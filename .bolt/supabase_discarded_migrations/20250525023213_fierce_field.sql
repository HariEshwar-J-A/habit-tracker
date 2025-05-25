/*
  # Fix ambiguous column reference in trigger function
  
  1. Changes
    - Fix ambiguous column references in update_habit_streaks function
    - Make table references explicit
    - Improve streak calculation logic
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
  SELECT * INTO habit_record 
  FROM habits 
  WHERE habits.id = NEW.habit_id;

  -- Get the most recent completion before this one
  SELECT habit_completions.date INTO last_completion
  FROM habit_completions
  WHERE habit_completions.habit_id = NEW.habit_id
    AND habit_completions.date < NEW.date
  ORDER BY habit_completions.date DESC
  LIMIT 1;

  -- Calculate current streak
  IF last_completion IS NULL OR 
     (NEW.date - last_completion) > 1 THEN
    new_current_streak := 1;
  ELSE
    new_current_streak := habit_record.current_streak + 1;
  END IF;

  -- Update longest streak if needed
  new_longest_streak := GREATEST(habit_record.longest_streak, new_current_streak);

  -- Update the habit record with explicit column references
  UPDATE habits
  SET 
    habits.current_streak = new_current_streak,
    habits.longest_streak = new_longest_streak,
    habits.updated_at = NOW()
  WHERE habits.id = NEW.habit_id;

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