-- Reset and populate database with new structure
-- This will clear all existing data and create fresh data

-- Step 1: Drop all existing tables (in correct order to handle foreign keys)
DROP TABLE IF EXISTS company_services CASCADE;
DROP TABLE IF EXISTS global_services CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Step 2: Recreate companies table
CREATE TABLE companies (
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

-- Step 3: Create global_services table (master list of all available services)
CREATE TABLE global_services (
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

-- Step 4: Create company_services table (junction table for company-service assignments)
CREATE TABLE company_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  service_id UUID REFERENCES global_services(id) ON DELETE CASCADE,
  custom_price DECIMAL(10,2), -- Optional custom price override
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, service_id) -- Prevent duplicate assignments
);

-- Step 5: Create indexes for better performance
CREATE INDEX idx_global_services_category ON global_services (category);
CREATE INDEX idx_global_services_active ON global_services (is_active);
CREATE INDEX idx_company_services_company_id ON company_services (company_id);
CREATE INDEX idx_company_services_service_id ON company_services (service_id);

-- Step 6: Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_services ENABLE ROW LEVEL SECURITY;

-- Step 7: Create policies for public read access
CREATE POLICY "Allow public read access to companies" ON companies
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to global_services" ON global_services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to company_services" ON company_services
  FOR SELECT USING (true);

-- Step 8: Create policies for admin access
CREATE POLICY "Allow admin full access to companies" ON companies
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow admin full access to global_services" ON global_services
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow admin full access to company_services" ON company_services
  FOR ALL USING (auth.role() = 'service_role');

-- Step 9: Insert sample companies
INSERT INTO companies (name, description, phone, email, website, address, city, state, zip_codes, service_category) VALUES
('Premier Garage Doors', 'Professional garage door installation and repair services with 20+ years of experience. We specialize in residential and commercial garage doors.', '(555) 123-4567', 'info@premiergaragedoors.com', 'https://premiergaragedoors.com', '123 Main Street', 'Austin', 'TX', ARRAY['78701', '78702', '78703', '78704', '78705'], 'garage_doors'),
('Quick Fix Garage', 'Fast and reliable garage door repair services. Available 24/7 for emergency repairs. Licensed and insured professionals.', '(555) 234-5678', 'contact@quickfixgarage.com', 'https://quickfixgarage.com', '456 Oak Avenue', 'Dallas', 'TX', ARRAY['75201', '75202', '75203', '75204', '75205'], 'garage_doors'),
('Elite Door Services', 'Luxury garage door installation and maintenance. We work with high-end residential and commercial properties.', '(555) 345-6789', 'hello@elitedoors.com', 'https://elitedoors.com', '789 Pine Street', 'Houston', 'TX', ARRAY['77001', '77002', '77003', '77004', '77005'], 'garage_doors'),
('Metro Garage Solutions', 'Comprehensive garage door services for the metro area. Installation, repair, and maintenance with competitive pricing.', '(555) 456-7890', 'info@metrogarage.com', 'https://metrogarage.com', '321 Elm Street', 'San Antonio', 'TX', ARRAY['78201', '78202', '78203', '78204', '78205'], 'garage_doors'),
('Reliable Door Works', 'Trusted garage door specialists serving the community for over 15 years. Quality workmanship and customer satisfaction guaranteed.', '(555) 567-8901', 'service@reliabledoors.com', 'https://reliabledoors.com', '654 Maple Drive', 'Fort Worth', 'TX', ARRAY['76101', '76102', '76103', '76104', '76105'], 'garage_doors'),
('Express Garage Repair', 'Same-day garage door repair services. We respond quickly to emergency calls and provide efficient solutions.', '(555) 678-9012', 'emergency@expressgarage.com', 'https://expressgarage.com', '987 Cedar Lane', 'Austin', 'TX', ARRAY['78710', '78711', '78712', '78713', '78714'], 'garage_doors'),
('Pro Door Systems', 'Professional garage door installation and automation. We handle everything from basic repairs to smart home integration.', '(555) 789-0123', 'info@prodoors.com', 'https://prodoors.com', '147 Birch Street', 'Dallas', 'TX', ARRAY['75210', '75211', '75212', '75213', '75214'], 'garage_doors'),
('City Garage Doors', 'Full-service garage door company serving the city area. Installation, repair, and maintenance with excellent customer service.', '(555) 890-1234', 'contact@citygarage.com', 'https://citygarage.com', '258 Spruce Avenue', 'Houston', 'TX', ARRAY['77010', '77011', '77012', '77013', '77014'], 'garage_doors');

-- Step 10: Insert global services
INSERT INTO global_services (name, description, base_price, price_unit, category) VALUES
('Garage Door Installation', 'Complete garage door installation including hardware, tracks, and opener setup', 1200.00, 'per_service', 'garage_doors'),
('Garage Door Repair', 'General garage door repair service including diagnosis and parts replacement', 150.00, 'per_hour', 'garage_doors'),
('Spring Replacement', 'Garage door spring replacement - both torsion and extension springs', 300.00, 'per_service', 'garage_doors'),
('Emergency Repair', '24/7 emergency garage door repair service for urgent issues', 200.00, 'per_hour', 'garage_doors'),
('Opener Installation', 'Garage door opener installation and programming', 400.00, 'per_service', 'garage_doors'),
('Luxury Door Installation', 'High-end garage door installation with premium materials and finishes', 2500.00, 'per_service', 'garage_doors'),
('Maintenance Service', 'Regular garage door maintenance and tune-up', 100.00, 'per_service', 'garage_doors'),
('Door Tune-up', 'Garage door tune-up and adjustment for optimal performance', 75.00, 'per_service', 'garage_doors'),
('Weather Stripping', 'Garage door weather stripping replacement for better insulation', 50.00, 'per_service', 'garage_doors'),
('Track Alignment', 'Garage door track alignment and repair for smooth operation', 125.00, 'per_service', 'garage_doors'),
('Smart Opener Upgrade', 'Upgrade to smart garage door opener with app control', 600.00, 'per_service', 'garage_doors'),
('Safety Inspection', 'Comprehensive garage door safety inspection and testing', 80.00, 'per_service', 'garage_doors'),
('Panel Replacement', 'Individual garage door panel replacement', 200.00, 'per_panel', 'garage_doors'),
('Window Installation', 'Garage door window installation and replacement', 150.00, 'per_window', 'garage_doors'),
('Insulation Upgrade', 'Garage door insulation upgrade for energy efficiency', 300.00, 'per_service', 'garage_doors');

-- Step 11: Assign services to companies
-- Premier Garage Doors - Full service company
INSERT INTO company_services (company_id, service_id, custom_price, is_available)
SELECT 
  c.id,
  gs.id,
  CASE 
    WHEN gs.name = 'Luxury Door Installation' THEN 2800.00
    WHEN gs.name = 'Smart Opener Upgrade' THEN 650.00
    ELSE gs.base_price
  END,
  true
FROM companies c
CROSS JOIN global_services gs
WHERE c.name = 'Premier Garage Doors' 
  AND gs.name IN ('Garage Door Installation', 'Garage Door Repair', 'Spring Replacement', 'Opener Installation', 'Maintenance Service', 'Door Tune-up', 'Weather Stripping', 'Track Alignment', 'Smart Opener Upgrade', 'Safety Inspection');

-- Quick Fix Garage - Emergency and repair focused
INSERT INTO company_services (company_id, service_id, custom_price, is_available)
SELECT 
  c.id,
  gs.id,
  CASE 
    WHEN gs.name = 'Emergency Repair' THEN 180.00
    ELSE gs.base_price
  END,
  true
FROM companies c
CROSS JOIN global_services gs
WHERE c.name = 'Quick Fix Garage' 
  AND gs.name IN ('Emergency Repair', 'Garage Door Repair', 'Spring Replacement', 'Track Alignment', 'Safety Inspection');

-- Elite Door Services - Luxury and high-end
INSERT INTO company_services (company_id, service_id, custom_price, is_available)
SELECT 
  c.id,
  gs.id,
  CASE 
    WHEN gs.name = 'Luxury Door Installation' THEN 3000.00
    WHEN gs.name = 'Smart Opener Upgrade' THEN 750.00
    WHEN gs.name = 'Maintenance Service' THEN 150.00
    ELSE gs.base_price
  END,
  true
FROM companies c
CROSS JOIN global_services gs
WHERE c.name = 'Elite Door Services' 
  AND gs.name IN ('Luxury Door Installation', 'Garage Door Installation', 'Opener Installation', 'Maintenance Service', 'Door Tune-up', 'Weather Stripping', 'Smart Opener Upgrade', 'Safety Inspection', 'Insulation Upgrade');

-- Metro Garage Solutions - Comprehensive services
INSERT INTO company_services (company_id, service_id, custom_price, is_available)
SELECT 
  c.id,
  gs.id,
  gs.base_price,
  true
FROM companies c
CROSS JOIN global_services gs
WHERE c.name = 'Metro Garage Solutions' 
  AND gs.name IN ('Garage Door Installation', 'Garage Door Repair', 'Spring Replacement', 'Opener Installation', 'Maintenance Service', 'Door Tune-up', 'Weather Stripping', 'Track Alignment', 'Safety Inspection', 'Panel Replacement');

-- Reliable Door Works - Traditional services
INSERT INTO company_services (company_id, service_id, custom_price, is_available)
SELECT 
  c.id,
  gs.id,
  CASE 
    WHEN gs.name = 'Garage Door Installation' THEN 1100.00
    ELSE gs.base_price
  END,
  true
FROM companies c
CROSS JOIN global_services gs
WHERE c.name = 'Reliable Door Works' 
  AND gs.name IN ('Garage Door Installation', 'Garage Door Repair', 'Spring Replacement', 'Maintenance Service', 'Door Tune-up', 'Weather Stripping', 'Track Alignment', 'Safety Inspection');

-- Express Garage Repair - Emergency focused
INSERT INTO company_services (company_id, service_id, custom_price, is_available)
SELECT 
  c.id,
  gs.id,
  CASE 
    WHEN gs.name = 'Emergency Repair' THEN 175.00
    WHEN gs.name = 'Garage Door Repair' THEN 140.00
    ELSE gs.base_price
  END,
  true
FROM companies c
CROSS JOIN global_services gs
WHERE c.name = 'Express Garage Repair' 
  AND gs.name IN ('Emergency Repair', 'Garage Door Repair', 'Spring Replacement', 'Track Alignment', 'Safety Inspection', 'Door Tune-up');

-- Pro Door Systems - Technology focused
INSERT INTO company_services (company_id, service_id, custom_price, is_available)
SELECT 
  c.id,
  gs.id,
  CASE 
    WHEN gs.name = 'Smart Opener Upgrade' THEN 700.00
    WHEN gs.name = 'Garage Door Installation' THEN 1300.00
    ELSE gs.base_price
  END,
  true
FROM companies c
CROSS JOIN global_services gs
WHERE c.name = 'Pro Door Systems' 
  AND gs.name IN ('Garage Door Installation', 'Garage Door Repair', 'Opener Installation', 'Smart Opener Upgrade', 'Maintenance Service', 'Door Tune-up', 'Weather Stripping', 'Track Alignment', 'Safety Inspection', 'Insulation Upgrade');

-- City Garage Doors - Full service
INSERT INTO company_services (company_id, service_id, custom_price, is_available)
SELECT 
  c.id,
  gs.id,
  gs.base_price,
  true
FROM companies c
CROSS JOIN global_services gs
WHERE c.name = 'City Garage Doors' 
  AND gs.name IN ('Garage Door Installation', 'Garage Door Repair', 'Spring Replacement', 'Opener Installation', 'Maintenance Service', 'Door Tune-up', 'Weather Stripping', 'Track Alignment', 'Safety Inspection', 'Panel Replacement', 'Window Installation');

-- Step 12: Verify the data
SELECT 'Companies Count:' as info, COUNT(*) as count FROM companies;
SELECT 'Global Services Count:' as info, COUNT(*) as count FROM global_services;
SELECT 'Company Service Assignments Count:' as info, COUNT(*) as count FROM company_services;

-- Step 13: Show sample data
SELECT 
  'Sample Company with Services:' as info,
  c.name as company_name,
  gs.name as service_name,
  cs.custom_price,
  gs.base_price,
  gs.price_unit
FROM companies c
LEFT JOIN company_services cs ON c.id = cs.company_id
LEFT JOIN global_services gs ON cs.service_id = gs.id
WHERE c.name = 'Premier Garage Doors'
ORDER BY gs.name
LIMIT 5;
