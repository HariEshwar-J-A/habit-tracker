CREATE OR REPLACE FUNCTION update_habit_streaks()
RETURNS TRIGGER AS $$
DECLARE
  habit_record RECORD;
  last_completion DATE;
  current_streak INT;
  longest_streak INT;
BEGIN
  -- Get the habit record
  SELECT * INTO habit_record 
  FROM habits 
  WHERE id = NEW.habit_id;

  -- Get the most recent completion before this one
  SELECT date INTO last_completion
  FROM habit_completions
  WHERE habit_id = NEW.habit_id
    AND date < NEW.date
  ORDER BY date DESC
  LIMIT 1;

  -- Calculate current streak
  IF last_completion IS NULL OR 
     (NEW.date - last_completion) > 1 THEN
    current_streak := 1;
  ELSE
    current_streak := habit_record.current_streak + 1;
  END IF;

  -- Update longest streak if needed
  longest_streak := GREATEST(habit_record.longest_streak, current_streak);

  -- Update the habit record
  UPDATE habits
  SET 
    current_streak = current_streak,
    longest_streak = longest_streak,
    updated_at = NOW()
  WHERE id = NEW.habit_id;

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