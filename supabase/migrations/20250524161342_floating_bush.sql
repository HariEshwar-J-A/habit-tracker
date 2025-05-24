/*
  # Initial Schema Setup for Habit Tracker

  1. New Tables
    - `habits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `description` (text, optional)
      - `frequency` (text, enum: daily/weekly/monthly/custom)
      - `color` (text)
      - `reminder_enabled` (boolean)
      - `reminder_time` (time without time zone, optional)
      - `target` (integer)
      - `current_streak` (integer)
      - `longest_streak` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `habit_completions`
      - `id` (uuid, primary key)
      - `habit_id` (uuid, references habits)
      - `date` (date)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Create their own habits
      - Read their own habits
      - Update their own habits
      - Delete their own habits
      - Create completions for their habits
      - Read completions for their habits
      - Delete completions for their habits

  3. Functions
    - Add trigger to update habit streaks on completion changes
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

-- Trigger for updating timestamps
CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS habits_user_id_idx ON habits(user_id);
CREATE INDEX IF NOT EXISTS habit_completions_habit_id_idx ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS habit_completions_date_idx ON habit_completions(date);