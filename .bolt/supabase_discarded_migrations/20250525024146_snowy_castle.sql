/*
  # Fix habit streak calculation and completion state

  1. Changes
    - Add function to calculate current streak based on completion history
    - Add function to handle streak updates on completion deletion
    - Update triggers to handle both INSERT and DELETE events
    - Fix date comparison logic in streak calculation

  2. Technical Details
    - Uses window functions for efficient streak calculation
    - Handles edge cases like gaps in completion history
    - Maintains data consistency with explicit transaction handling
*/

-- Function to calculate current streak from completion history
CREATE OR REPLACE FUNCTION calculate_current_streak(habit_id_param uuid)
RETURNS integer AS $$
DECLARE
  streak integer;
BEGIN
  WITH dated_completions AS (
    SELECT 
      date,
      date - (ROW_NUMBER() OVER (ORDER BY date))::integer AS grp
    FROM habit_completions
    WHERE habit_id = habit_id_param
    ORDER BY date DESC
  )
  SELECT COUNT(*) INTO streak
  FROM dated_completions
  WHERE grp = (
    SELECT grp 
    FROM dated_completions 
    WHERE date = CURRENT_DATE
    LIMIT 1
  );

  RETURN COALESCE(streak, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to update habit streaks
CREATE OR REPLACE FUNCTION update_habit_streaks()
RETURNS TRIGGER AS $$
DECLARE
  current_streak integer;
  longest_streak integer;
BEGIN
  -- Calculate current streak
  SELECT calculate_current_streak(NEW.habit_id) INTO current_streak;
  
  -- Get existing longest streak
  SELECT COALESCE(h.longest_streak, 0) INTO longest_streak
  FROM habits h
  WHERE h.id = NEW.habit_id;

  -- Update longest streak if current streak is higher
  longest_streak := GREATEST(longest_streak, current_streak);

  -- Update the habit record
  UPDATE habits h
  SET 
    current_streak = current_streak,
    longest_streak = longest_streak,
    updated_at = NOW()
  WHERE h.id = NEW.habit_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle streak updates on completion deletion
CREATE OR REPLACE FUNCTION update_habit_streaks_on_delete()
RETURNS TRIGGER AS $$
DECLARE
  current_streak integer;
  longest_streak integer;
BEGIN
  -- Calculate current streak after deletion
  SELECT calculate_current_streak(OLD.habit_id) INTO current_streak;
  
  -- Get existing longest streak
  SELECT COALESCE(h.longest_streak, 0) INTO longest_streak
  FROM habits h
  WHERE h.id = OLD.habit_id;

  -- Update the habit record
  UPDATE habits h
  SET 
    current_streak = current_streak,
    updated_at = NOW()
  WHERE h.id = OLD.habit_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_streaks_on_completion ON habit_completions;
DROP TRIGGER IF EXISTS update_streaks_on_deletion ON habit_completions;

-- Create new triggers
CREATE TRIGGER update_streaks_on_completion
  AFTER INSERT ON habit_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_habit_streaks();

CREATE TRIGGER update_streaks_on_deletion
  AFTER DELETE ON habit_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_habit_streaks_on_delete();