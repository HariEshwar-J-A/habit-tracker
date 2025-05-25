/*
  # Add reminder columns to habits table

  1. Changes
    - Add `reminder_enabled` column to `habits` table (boolean, defaults to false)
    - Add `reminder_time` column to `habits` table (time without time zone, nullable)

  2. Notes
    - Both columns are added safely using IF NOT EXISTS checks
    - No data loss will occur as these are new columns with appropriate defaults
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'habits' AND column_name = 'reminder_enabled'
  ) THEN
    ALTER TABLE habits ADD COLUMN reminder_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'habits' AND column_name = 'reminder_time'
  ) THEN
    ALTER TABLE habits ADD COLUMN reminder_time time without time zone;
  END IF;
END $$;