-- Database Schema for Magnum Self Drive Cars
-- Run this in your Supabase SQL Editor

-- 1. Cars Table
CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 4-Seater, 7-Seater
  gear VARCHAR(20) NOT NULL, -- Manual, Automatic
  fuel VARCHAR(20) NOT NULL, -- Petrol, Diesel
  price_24h INTEGER NOT NULL,
  price_12h INTEGER NOT NULL,
  mileage VARCHAR(50),
  image_url TEXT,
  city_id VARCHAR(50) NOT NULL,
  owner_name VARCHAR(255),
  owner_phone VARCHAR(20),
  owner_share_percent INTEGER DEFAULT 100,
  total_revenue INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  car_id INTEGER REFERENCES cars(id),
  city_id VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected, Ready for Pickup, Completed
  
  -- Stage 1: Customer Info
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  occupation VARCHAR(255),
  address TEXT,
  trip_location VARCHAR(255),
  trip_purpose VARCHAR(255),
  trip_days INTEGER,
  delivery_needed BOOLEAN DEFAULT FALSE,
  start_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_date DATE NOT NULL,
  end_time TIME NOT NULL,
  total_amount INTEGER NOT NULL,
  
  -- Stage 2: Admin Delivery Info
  start_km INTEGER,
  end_km INTEGER,
  delivery_datetime TIMESTAMP,
  fuel_level VARCHAR(50),
  fasttag_status VARCHAR(255),
  signature_url TEXT,
  customer_photo_url TEXT,
  id_proof_urls TEXT[], -- Array of URLs
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Admin Users (Optional if using Supabase Auth, but good for custom logic)
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin'
);

-- Seed Data (Example)
INSERT INTO cars (name, type, gear, fuel, price_24h, price_12h, mileage, image_url, city_id, owner_name, owner_phone, owner_share_percent)
VALUES 
('Maruti Suzuki Alto 2018', '4-Seater', 'Manual', 'Petrol', 1800, 1600, '20–24 KMPL', 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/39013/alto-exterior-right-front-three-quarter-72.jpeg', 'tirunelveli', 'Magnum Own', '7845012402', 100);
