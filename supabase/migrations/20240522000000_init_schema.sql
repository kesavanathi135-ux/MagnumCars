/*
  # Initial Schema Setup for Magnum Cars

  ## Query Description: 
  This migration creates the 'cars' and 'bookings' tables and seeds the initial car data.
  It also enables Row Level Security (RLS) with permissive policies for this initial version to ensure the app functions smoothly without complex auth setup immediately.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "High"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Tables: cars, bookings
  - Seed Data: 13 Cars for Tirunelveli
*/

-- Create Cars Table
CREATE TABLE IF NOT EXISTS public.cars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    gear TEXT NOT NULL,
    fuel TEXT NOT NULL,
    price24h INTEGER NOT NULL,
    price12h INTEGER NOT NULL,
    mileage TEXT NOT NULL,
    image TEXT NOT NULL,
    city_id TEXT NOT NULL,
    owner_name TEXT DEFAULT 'Magnum Own',
    owner_phone TEXT,
    owner_share_percent INTEGER DEFAULT 100,
    total_revenue INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_id UUID REFERENCES public.cars(id),
    city_id TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    
    -- Customer Info (Stage 1)
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    occupation TEXT,
    address TEXT,
    trip_location TEXT,
    trip_purpose TEXT,
    trip_days NUMERIC,
    delivery_needed BOOLEAN DEFAULT false,
    start_date DATE,
    start_time TIME,
    end_date DATE,
    end_time TIME,
    total_amount INTEGER,
    
    -- Admin/Delivery Info (Stage 2)
    start_km INTEGER,
    delivery_datetime TIMESTAMP WITH TIME ZONE,
    fuel_level TEXT,
    fasttag_status TEXT,
    signature_url TEXT,
    id_proof_urls TEXT[],
    customer_photo_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policies (Permissive for Demo/MVP)
-- Allow public read for cars
CREATE POLICY "Public cars are viewable by everyone" ON public.cars FOR SELECT USING (true);
-- Allow admin update for cars (we allow all for now to support the custom admin panel flow)
CREATE POLICY "Enable update for all users" ON public.cars FOR UPDATE USING (true);

-- Allow public to create bookings
CREATE POLICY "Public can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
-- Allow public/admin to view/update bookings
CREATE POLICY "Enable read access for all users" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Enable update for all users" ON public.bookings FOR UPDATE USING (true);

-- Seed Data (Only insert if empty)
INSERT INTO public.cars (name, type, gear, fuel, price24h, price12h, mileage, image, city_id, owner_name, owner_phone, owner_share_percent)
SELECT name, type, gear, fuel, price24h, price12h, mileage, image, city_id, owner_name, owner_phone, owner_share_percent
FROM (VALUES 
  ('Maruti Suzuki Alto 2018', '4-Seater', 'Manual', 'Petrol', 1800, 1600, '20–24 KMPL', 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/39013/alto-exterior-right-front-three-quarter-72.jpeg?isig=0&q=80', 'tirunelveli', 'Magnum Own', '7845012402', 100),
  ('Maruti Suzuki Celerio 2025', '4-Seater', 'Automatic', 'Petrol', 2400, 2000, '20–24 KMPL', 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/106027/celerio-exterior-right-front-three-quarter-3.jpeg?isig=0&q=80', 'tirunelveli', 'Magnum Own', NULL, 100),
  ('Maruti Suzuki Swift 2025', '4-Seater', 'Manual', 'Petrol', 2400, 2200, '20–24 KMPL', 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/159205/swift-exterior-right-front-three-quarter-2.jpeg?isig=0&q=80', 'tirunelveli', 'Partner A', '9998887776', 70),
  ('Hyundai i10 Nios 2025', '4-Seater', 'Manual', 'Petrol', 2200, 2400, '18–23 KMPL', 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/136179/grand-i10-nios-exterior-right-front-three-quarter-11.jpeg?isig=0&q=80', 'tirunelveli', 'Magnum Own', NULL, 100),
  ('Maruti Suzuki Ignis 2019', '4-Seater', 'Automatic', 'Petrol', 2000, 2200, '18–23 KMPL', 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/43439/ignis-exterior-right-front-three-quarter-12.jpeg?isig=0&q=80', 'tirunelveli', 'Partner B', NULL, 65),
  ('Honda Amaze 2015', '4-Seater', 'Manual', 'Diesel', 2200, 2000, '18–23 KMPL', 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/32649/amaze-exterior-right-front-three-quarter-4.jpeg?q=80', 'tirunelveli', 'Magnum Own', NULL, 100),
  ('Maruti Suzuki Dzire 2019', '4-Seater', 'Automatic', 'Petrol', 2400, 2200, '16–20 KMPL', 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/45691/dzire-exterior-right-front-three-quarter-3.jpeg?isig=0&q=80', 'tirunelveli', 'Partner C', NULL, 75),
  ('Maruti Suzuki Dzire 2024', '4-Seater', 'Manual', 'Petrol', 2700, 2500, '18–23 KMPL', 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/144159/dzire-exterior-right-front-three-quarter.jpeg?isig=0&q=80', 'tirunelveli', 'Magnum Own', NULL, 100),
  ('Maruti Suzuki Baleno 2024', '4-Seater', 'Manual', 'Petrol', 2700, 2500, '18–23 KMPL', 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/112701/baleno-exterior-right-front-three-quarter-3.jpeg?isig=0&q=80', 'tirunelveli', 'Magnum Own', NULL, 100),
  ('Nissan Magnite 2024', '4-Seater', 'Manual', 'Petrol', 2700, 2500, '17–19 KMPL', 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/45784/magnite-exterior-right-front-three-quarter-3.jpeg?isig=0&q=80', 'tirunelveli', 'Magnum Own', NULL, 100),
  ('Maruti Suzuki Ertiga 2024', '7-Seater', 'Manual', 'Petrol', 3800, 3500, '13–16 KMPL', 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/115697/ertiga-exterior-right-front-three-quarter-4.jpeg?isig=0&q=80', 'tirunelveli', 'Magnum Own', NULL, 100),
  ('Maruti Suzuki XL6 2023', '6-Seater', 'Automatic', 'Petrol', 4000, 3800, '13–16 KMPL', 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/115051/xl6-exterior-right-front-three-quarter-4.jpeg?isig=0&q=80', 'tirunelveli', 'Partner D', NULL, 80),
  ('KIA Carens 2025', '7-Seater', 'Manual', 'Petrol', 4500, 4000, '15–19 KMPL', 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/110033/carens-exterior-right-front-three-quarter-3.jpeg?isig=0&q=80', 'tirunelveli', 'Magnum Own', NULL, 100)
) AS v(name, type, gear, fuel, price24h, price12h, mileage, image, city_id, owner_name, owner_phone, owner_share_percent)
WHERE NOT EXISTS (SELECT 1 FROM public.cars);
