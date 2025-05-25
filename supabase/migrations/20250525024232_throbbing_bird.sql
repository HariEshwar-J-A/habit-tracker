/*
  # Fix habit streak calculation and completion state

  1. Changes
    - Adds new function to calculate streaks properly
    - Handles both INSERT and DELETE operations
    - Uses window functions for efficient streak calculation
    - Fixes date comparison issues
    - Maintains data consistency

  2. Security
    - Maintains existing RLS policies
    - No changes to table permissions
*/

-- Function to calculate streaks
CREATE OR REPLACE FUNCTION calculate_habit_streaks(habit_id uuid)
RETURNS TABLE (current_streak integer, longest_streak integer) AS $$
DECLARE
  completions_exist boolean;
BEGIN
  -- Check if habit has any completions
  SELECT EXISTS (
    SELECT 1 FROM habit_completions 
    WHERE habit_id = calculate_habit_streaks.habit_id
  ) INTO completions_exist;

  -- Return 0 for both streaks if no completions exist
  IF NOT completions_exist THEN
    RETURN QUERY SELECT 0::integer, 0::integer;
    RETURN;
  END IF;

  RETURN QUERY
  WITH dated_completions AS (
    -- Get all completions for the habit
    SELECT 
      date,
      date - (ROW_NUMBER() OVER (ORDER BY date))::integer AS grp
    FROM habit_completions
    WHERE habit_id = calculate_habit_streaks.habit_id
    ORDER BY date
  ),
  streaks AS (
    -- Calculate streak lengths
    SELECT 
      COUNT(*) AS streak_length,
      MIN(date) AS streak_start,
      MAX(date) AS streak_end
    FROM dated_completions
    GROUP BY grp
    ORDER BY streak_end DESC
  )
  SELECT 
    -- Current streak: if the last streak includes today or yesterday, return its length, otherwise 0
    CASE 
      WHEN EXISTS (
        SELECT 1 
        FROM streaks 
        WHERE streak_end >= CURRENT_DATE - 1
      ) THEN (
        SELECT streak_length 
        FROM streaks 
        WHERE streak_end >= CURRENT_DATE - 1 
        LIMIT 1
      )
      ELSE 0
    END,
    -- Longest streak: maximum streak length
    COALESCE(MAX(streak_length), 0)
  FROM streaks;
END;
$$ LANGUAGE plpgsql;

-- Function to update habit streaks
CREATE OR REPLACE FUNCTION update_habit_streaks()
RETURNS TRIGGER AS $$
DECLARE
  new_current_streak integer;
  new_longest_streak integer;
BEGIN
  -- Calculate new streak values
  SELECT * FROM calculate_habit_streaks(
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.habit_id
      ELSE NEW.habit_id
    END
  ) INTO new_current_streak, new_longest_streak;

  -- Update the habit record
  UPDATE habits
  SET 
    current_streak = new_current_streak,
    longest_streak = new_longest_streak,
    updated_at = NOW()
  WHERE id = CASE
    WHEN TG_OP = 'DELETE' THEN OLD.habit_id
    ELSE NEW.habit_id
  END;

  RETURN CASE
    WHEN TG_OP = 'DELETE' THEN OLD
    ELSE NEW
  END;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_streaks_on_completion ON habit_completions;
DROP TRIGGER IF EXISTS update_streaks_on_deletion ON habit_completions;

-- Create triggers for both INSERT and DELETE
CREATE TRIGGER update_streaks_on_completion
  AFTER INSERT ON habit_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_habit_streaks();

CREATE TRIGGER update_streaks_on_deletion
  AFTER DELETE ON habit_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_habit_streaks();