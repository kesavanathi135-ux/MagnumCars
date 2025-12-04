/*
  # Add Security Deposit Column
  
  1. Changes
    - Add `deposit_amount` column to `bookings` table with default value of 5000.
    - This ensures we can track the deposit separately from the rental cost.
*/

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'deposit_amount') THEN
    ALTER TABLE bookings ADD COLUMN deposit_amount INTEGER DEFAULT 5000;
  END IF;
END $$;
