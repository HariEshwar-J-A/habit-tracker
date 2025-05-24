/*
  # Initial schema setup for habit tracker

  1. New Tables
    - `habits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `description` (text)
      - `frequency` (text)
      - `color` (text)
      - `reminder_enabled` (boolean)
      - `reminder_time` (time)
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
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  description text,
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  color text NOT NULL,
  reminder_enabled boolean DEFAULT false,
  reminder_time time,
  target integer DEFAULT 1,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create habit_completions table
CREATE TABLE IF NOT EXISTS habit_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid REFERENCES habits ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(habit_id, date)
);

-- Enable Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

-- Create policies for habits table
CREATE POLICY "Users can view their own habits"
  ON habits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habits"
  ON habits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

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

-- Create policies for habit_completions table
CREATE POLICY "Users can view completions for their habits"
  ON habit_completions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM habits
    WHERE habits.id = habit_completions.habit_id
    AND habits.user_id = auth.uid()
  ));

CREATE POLICY "Users can create completions for their habits"
  ON habit_completions
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM habits
    WHERE habits.id = habit_completions.habit_id
    AND habits.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete completions for their habits"
  ON habit_completions
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM habits
    WHERE habits.id = habit_completions.habit_id
    AND habits.user_id = auth.uid()
  ));

-- Create function to update streak counts
CREATE OR REPLACE FUNCTION update_habit_streaks()
RETURNS TRIGGER AS $$
DECLARE
  current_streak integer := 0;
  longest_streak integer;
  last_completion date;
  habit_record habits%ROWTYPE;
BEGIN
  -- Get the habit record
  SELECT * INTO habit_record FROM habits WHERE id = NEW.habit_id;
  
  -- Get the last completion date before this one
  SELECT date INTO last_completion
  FROM habit_completions
  WHERE habit_id = NEW.habit_id
  AND date < NEW.date
  ORDER BY date DESC
  LIMIT 1;

  -- Calculate current streak
  IF last_completion IS NULL OR last_completion = NEW.date - INTERVAL '1 day' THEN
    -- First completion or consecutive day
    current_streak := habit_record.current_streak + 1;
  ELSE
    -- Streak broken
    current_streak := 1;
  END IF;

  -- Update the habit record
  UPDATE habits
  SET 
    current_streak = current_streak,
    longest_streak = GREATEST(current_streak, longest_streak),
    updated_at = now()
  WHERE id = NEW.habit_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating streaks
CREATE TRIGGER update_streaks_on_completion
  AFTER INSERT ON habit_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_habit_streaks();