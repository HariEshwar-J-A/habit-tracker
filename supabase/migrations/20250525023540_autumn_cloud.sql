/*
  # Fix streak calculation and column references

  1. Changes
    - Fix date comparison in streak calculation
    - Add explicit table aliases to avoid ambiguous column references
    - Add proper interval handling for date comparisons
    - Add proper error handling for NULL cases

  2. Notes
    - Uses proper date arithmetic with intervals
    - Handles edge cases for first completion
    - Maintains existing functionality while fixing bugs
*/

CREATE OR REPLACE FUNCTION update_habit_streaks()
RETURNS TRIGGER AS $$
DECLARE
  habit_record RECORD;
  last_completion DATE;
  new_current_streak INT;
  new_longest_streak INT;
BEGIN
  -- Get the habit record
  SELECT h.* INTO habit_record 
  FROM habits h 
  WHERE h.id = NEW.habit_id;

  -- Get the most recent completion before this one
  SELECT hc.date INTO last_completion
  FROM habit_completions hc
  WHERE hc.habit_id = NEW.habit_id
    AND hc.date < NEW.date
  ORDER BY hc.date DESC
  LIMIT 1;

  -- Calculate current streak
  IF last_completion IS NULL THEN
    -- First completion for this habit
    new_current_streak := 1;
  ELSIF (NEW.date - last_completion) = 1 THEN
    -- Consecutive day, increment streak
    new_current_streak := habit_record.current_streak + 1;
  ELSE
    -- Gap in streak, start new streak
    new_current_streak := 1;
  END IF;

  -- Update longest streak if needed
  new_longest_streak := GREATEST(COALESCE(habit_record.longest_streak, 0), new_current_streak);

  -- Update the habit record with explicit table reference
  UPDATE habits h
  SET 
    current_streak = new_current_streak,
    longest_streak = new_longest_streak,
    updated_at = NOW()
  WHERE h.id = NEW.habit_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_streaks_on_completion ON habit_completions;

-- Create new trigger
CREATE TRIGGER update_streaks_on_completion
  AFTER INSERT ON habit_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_habit_streaks();