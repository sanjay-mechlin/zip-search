-- Complete Supabase Deployment Script for Local Service MVP
-- Run this entire script in your Supabase SQL Editor

-- ============================================
-- STEP 1: Create Companies Table
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_codes TEXT[] NOT NULL,
  service_category VARCHAR(100) NOT NULL DEFAULT 'garage_doors',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 2: Create Global Services Table
-- ============================================
CREATE TABLE IF NOT EXISTS global_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  price_unit VARCHAR(50) NOT NULL DEFAULT 'per_service',
  category VARCHAR(100) NOT NULL DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 3: Create Company Services Junction Table
-- ============================================
CREATE TABLE IF NOT EXISTS company_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  service_id UUID REFERENCES global_services(id) ON DELETE CASCADE,
  custom_price DECIMAL(10,2),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, service_id)
);

-- ============================================
-- STEP 4: Create Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_companies_zip_codes ON companies USING GIN (zip_codes);
CREATE INDEX IF NOT EXISTS idx_companies_service_category ON companies (service_category);
CREATE INDEX IF NOT EXISTS idx_global_services_category ON global_services (category);
CREATE INDEX IF NOT EXISTS idx_global_services_active ON global_services (is_active);
CREATE INDEX IF NOT EXISTS idx_company_services_company_id ON company_services (company_id);
CREATE INDEX IF NOT EXISTS idx_company_services_service_id ON company_services (service_id);

-- ============================================
-- STEP 5: Enable Row Level Security
-- ============================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_services ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: Create RLS Policies
-- ============================================

-- Public read access policies
DROP POLICY IF EXISTS "Allow public read access to companies" ON companies;
CREATE POLICY "Allow public read access to companies" ON companies
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to global_services" ON global_services;
CREATE POLICY "Allow public read access to global_services" ON global_services
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow public read access to company_services" ON company_services;
CREATE POLICY "Allow public read access to company_services" ON company_services
  FOR SELECT USING (true);

-- Admin access policies (using service role)
DROP POLICY IF EXISTS "Allow admin full access to companies" ON companies;
CREATE POLICY "Allow admin full access to companies" ON companies
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow admin full access to global_services" ON global_services;
CREATE POLICY "Allow admin full access to global_services" ON global_services
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow admin full access to company_services" ON company_services;
CREATE POLICY "Allow admin full access to company_services" ON company_services
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- STEP 7: Insert Sample Data
-- ============================================

-- Insert sample companies
INSERT INTO companies (name, description, phone, email, website, address, city, state, zip_codes, service_category) VALUES
('Premier Garage Doors', 'Professional garage door installation and repair services with 20+ years of experience', '(555) 123-4567', 'info@premiergaragedoors.com', 'https://premiergaragedoors.com', '123 Main St', 'Los Angeles', 'CA', ARRAY['90210', '90211', '90212', '90213'], 'garage_doors'),
('Quick Fix Garage', 'Fast and reliable garage door repairs with same-day service', '(555) 987-6543', 'contact@quickfixgarage.com', 'https://quickfixgarage.com', '456 Oak Ave', 'Los Angeles', 'CA', ARRAY['90210', '90213', '90214', '90215'], 'garage_doors'),
('Elite Door Services', 'Premium garage door solutions for luxury homes', '(555) 456-7890', 'hello@elitedoors.com', 'https://elitedoors.com', '789 Pine St', 'Beverly Hills', 'CA', ARRAY['90211', '90212', '90215', '90216'], 'garage_doors'),
('Reliable HVAC', 'Complete HVAC installation and maintenance services', '(555) 234-5678', 'info@reliablehvac.com', 'https://reliablehvac.com', '321 Elm St', 'Los Angeles', 'CA', ARRAY['90210', '90211', '90212'], 'hvac'),
('Pro Plumbing', 'Professional plumbing services for residential and commercial', '(555) 345-6789', 'service@proplumbing.com', 'https://proplumbing.com', '654 Maple Ave', 'Los Angeles', 'CA', ARRAY['90213', '90214', '90215'], 'plumbing')
ON CONFLICT (name) DO NOTHING;

-- Insert sample global services
INSERT INTO global_services (name, description, base_price, price_unit, category) VALUES
-- Garage Door Services
('Garage Door Installation', 'Complete garage door installation with opener', 1200.00, 'per_service', 'garage_doors'),
('Garage Door Repair', 'General garage door repair service', 150.00, 'per_hour', 'garage_doors'),
('Spring Replacement', 'Garage door spring replacement', 300.00, 'per_service', 'garage_doors'),
('Emergency Repair', '24/7 emergency garage door repair', 200.00, 'per_hour', 'garage_doors'),
('Opener Installation', 'Garage door opener installation', 400.00, 'per_service', 'garage_doors'),
('Luxury Door Installation', 'High-end garage door installation', 2500.00, 'per_service', 'garage_doors'),
('Maintenance Service', 'Regular garage door maintenance', 100.00, 'per_service', 'garage_doors'),
('Door Tune-up', 'Garage door tune-up and adjustment', 75.00, 'per_service', 'garage_doors'),
('Weather Stripping', 'Garage door weather stripping replacement', 50.00, 'per_service', 'garage_doors'),
('Track Alignment', 'Garage door track alignment and repair', 125.00, 'per_service', 'garage_doors'),

-- HVAC Services
('AC Installation', 'Complete air conditioning system installation', 3500.00, 'per_service', 'hvac'),
('AC Repair', 'Air conditioning repair and maintenance', 120.00, 'per_hour', 'hvac'),
('Heating Installation', 'Furnace and heating system installation', 2800.00, 'per_service', 'hvac'),
('Heating Repair', 'Heating system repair and maintenance', 110.00, 'per_hour', 'hvac'),
('Duct Cleaning', 'Professional duct cleaning service', 200.00, 'per_service', 'hvac'),

-- Plumbing Services
('Pipe Repair', 'General pipe repair and replacement', 150.00, 'per_hour', 'plumbing'),
('Drain Cleaning', 'Professional drain cleaning service', 100.00, 'per_service', 'plumbing'),
('Faucet Installation', 'Faucet and fixture installation', 80.00, 'per_service', 'plumbing'),
('Toilet Repair', 'Toilet repair and installation', 120.00, 'per_service', 'plumbing'),
('Water Heater Installation', 'Water heater installation and repair', 800.00, 'per_service', 'plumbing')
ON CONFLICT (name, base_price, price_unit) DO NOTHING;

-- ============================================
-- STEP 8: Assign Services to Companies
-- ============================================
INSERT INTO company_services (company_id, service_id, custom_price, is_available)
SELECT 
  c.id,
  gs.id,
  CASE 
    WHEN c.name = 'Elite Door Services' AND gs.name = 'Luxury Door Installation' THEN 2800.00
    WHEN c.name = 'Premier Garage Doors' AND gs.name = 'Garage Door Installation' THEN 1100.00
    WHEN c.name = 'Quick Fix Garage' AND gs.name = 'Emergency Repair' THEN 180.00
    ELSE gs.base_price
  END,
  true
FROM companies c
CROSS JOIN global_services gs
WHERE 
  -- Premier Garage Doors gets basic garage door services
  (c.name = 'Premier Garage Doors' AND gs.category = 'garage_doors' AND gs.name IN ('Garage Door Installation', 'Garage Door Repair', 'Spring Replacement', 'Maintenance Service'))
  OR
  -- Quick Fix Garage gets emergency and quick services
  (c.name = 'Quick Fix Garage' AND gs.category = 'garage_doors' AND gs.name IN ('Emergency Repair', 'Opener Installation', 'Door Tune-up', 'Track Alignment'))
  OR
  -- Elite Door Services gets premium services
  (c.name = 'Elite Door Services' AND gs.category = 'garage_doors' AND gs.name IN ('Luxury Door Installation', 'Maintenance Service', 'Weather Stripping'))
  OR
  -- Reliable HVAC gets HVAC services
  (c.name = 'Reliable HVAC' AND gs.category = 'hvac')
  OR
  -- Pro Plumbing gets plumbing services
  (c.name = 'Pro Plumbing' AND gs.category = 'plumbing')
ON CONFLICT (company_id, service_id) DO NOTHING;

-- ============================================
-- STEP 9: Verification Queries
-- ============================================
-- Check data was inserted correctly
SELECT 'Companies Count:' as info, COUNT(*) as count FROM companies;
SELECT 'Global Services Count:' as info, COUNT(*) as count FROM global_services;
SELECT 'Company Service Assignments Count:' as info, COUNT(*) as count FROM company_services;

-- Show sample data
SELECT 
  c.name as company_name,
  c.service_category,
  gs.name as service_name,
  cs.custom_price,
  gs.base_price,
  gs.price_unit,
  cs.is_available
FROM companies c
LEFT JOIN company_services cs ON c.id = cs.company_id
LEFT JOIN global_services gs ON cs.service_id = gs.id
ORDER BY c.name, gs.name
LIMIT 20;

-- ============================================
-- DEPLOYMENT COMPLETE!
-- ============================================
-- Your database is now ready for the Local Service MVP application.
-- Next steps:
-- 1. Get your Supabase project URL and API keys
-- 2. Configure environment variables in your application
-- 3. Deploy your frontend application
