/*
  # Initial Habits Schema

  1. New Tables
    - habits: Stores habit definitions with user associations
    - habit_completions: Records daily habit completions
  
  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
  
  3. Performance
    - Add indexes for common queries
    - Add trigger for updated_at timestamps
*/

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  description text,
  frequency text NOT NULL,
  color text NOT NULL,
  reminder_enabled boolean DEFAULT false,
  reminder_time time without time zone,
  target integer DEFAULT 1,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT habits_frequency_check CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom'))
);

-- Create habit_completions table
CREATE TABLE IF NOT EXISTS habit_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT habit_completions_habit_id_date_key UNIQUE (habit_id, date)
);

-- Enable Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can create their own habits" ON habits;
  DROP POLICY IF EXISTS "Users can view their own habits" ON habits;
  DROP POLICY IF EXISTS "Users can update their own habits" ON habits;
  DROP POLICY IF EXISTS "Users can delete their own habits" ON habits;
  DROP POLICY IF EXISTS "Users can create completions for their habits" ON habit_completions;
  DROP POLICY IF EXISTS "Users can view completions for their habits" ON habit_completions;
  DROP POLICY IF EXISTS "Users can delete completions for their habits" ON habit_completions;
END $$;

-- Policies for habits table
CREATE POLICY "Users can create their own habits"
  ON habits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own habits"
  ON habits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON habits
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON habits
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for habit_completions table
CREATE POLICY "Users can create completions for their habits"
  ON habit_completions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_completions.habit_id
      AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view completions for their habits"
  ON habit_completions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_completions.habit_id
      AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete completions for their habits"
  ON habit_completions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_completions.habit_id
      AND habits.user_id = auth.uid()
    )
  );

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_habits_updated_at ON habits;

-- Create trigger for updating timestamps
CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS habits_user_id_idx;
DROP INDEX IF EXISTS habit_completions_habit_id_idx;
DROP INDEX IF EXISTS habit_completions_date_idx;

-- Create indexes for better performance
CREATE INDEX habits_user_id_idx ON habits(user_id);
CREATE INDEX habit_completions_habit_id_idx ON habit_completions(habit_id);
CREATE INDEX habit_completions_date_idx ON habit_completions(date);