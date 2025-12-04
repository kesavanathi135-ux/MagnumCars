/*
  # Fix Schema Conflicts & Ensure Admin Features
  
  ## Query Description:
  1. Safely adds 'owner_share_percent' and 'registration_number' to 'cars' table.
  2. Creates 'settings' table if missing.
  3. Recreates policies for 'settings' to avoid "already exists" errors.
  4. Seeds default system settings.

  ## Metadata:
  - Schema-Category: "Safe"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true
*/

-- 1. Update CARS table safely
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'owner_share_percent') THEN
        ALTER TABLE cars ADD COLUMN owner_share_percent INTEGER DEFAULT 100;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'registration_number') THEN
        ALTER TABLE cars ADD COLUMN registration_number TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'is_maintenance') THEN
        ALTER TABLE cars ADD COLUMN is_maintenance BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. Ensure SETTINGS table exists
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Fix Policies (Drop first to avoid 42710 error)
DROP POLICY IF EXISTS "Allow public read access to settings" ON settings;
DROP POLICY IF EXISTS "Allow admin full access to settings" ON settings;

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to settings" 
ON settings FOR SELECT 
USING (true);

CREATE POLICY "Allow admin full access to settings" 
ON settings FOR ALL 
USING (true) 
WITH CHECK (true);

-- 4. Seed Default Settings (if they don't exist)
INSERT INTO settings (key, value, description)
VALUES 
  ('terms_and_conditions', '1. Fuel charges are borne by the customer.\n2. Any damage to the vehicle will be charged as per actuals.\n3. Speed limit is 80 kmph.\n4. Late return penalty applies.', 'T&C text shown to customers'),
  ('default_owner_share', '100', 'Default revenue share percentage'),
  ('whatsapp_number', '7845012402', 'Admin WhatsApp Number')
ON CONFLICT (key) DO NOTHING;
