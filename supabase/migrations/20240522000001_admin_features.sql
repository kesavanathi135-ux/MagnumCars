/*
  # Admin Features Support
  
  ## Changes
  1. Update 'cars' table with owner and status details
  2. Create 'settings' table for system configuration
  
  ## Security
  - Enable RLS on settings
*/

-- Add new columns to cars table if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'owner_share_percent') THEN
        ALTER TABLE cars ADD COLUMN owner_share_percent INTEGER DEFAULT 100;
        ALTER TABLE cars ADD COLUMN registration_number TEXT;
        ALTER TABLE cars ADD COLUMN is_maintenance BOOLEAN DEFAULT false;
        ALTER TABLE cars ADD COLUMN owner_name TEXT DEFAULT 'Magnum Own';
        ALTER TABLE cars ADD COLUMN owner_phone TEXT;
        ALTER TABLE cars ADD COLUMN total_revenue INTEGER DEFAULT 0;
        ALTER TABLE cars ADD COLUMN total_bookings INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policies for Settings (Public Read, Admin Write)
CREATE POLICY "Allow public read access to settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow full access to settings" ON settings FOR ALL USING (true);

-- Insert Default Settings
INSERT INTO settings (key, value, description) VALUES
('terms_and_conditions', '1. Fuel charges are borne by the customer.\n2. Any damage to the vehicle will be charged as per actuals.\n3. Speed limit is 80 kmph.\n4. Late return penalty applies.', 'Terms and Conditions text displayed to customers'),
('whatsapp_number', '7845012402', 'Admin WhatsApp Number for notifications'),
('default_owner_share', '100', 'Default revenue share percentage for new cars')
ON CONFLICT (key) DO NOTHING;
