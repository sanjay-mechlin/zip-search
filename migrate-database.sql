-- Migration script to update existing database to new service structure
-- Run this in your Supabase SQL editor

-- Step 1: Create global_services table
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

-- Step 2: Create company_services table
CREATE TABLE IF NOT EXISTS company_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  service_id UUID REFERENCES global_services(id) ON DELETE CASCADE,
  custom_price DECIMAL(10,2),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, service_id)
);

-- Step 3: Migrate existing services to global_services
-- First, let's see what services exist in the old services table
INSERT INTO global_services (name, description, base_price, price_unit, category)
SELECT DISTINCT 
  name,
  description,
  base_price,
  price_unit,
  'garage_doors' as category
FROM services
WHERE name IS NOT NULL
ON CONFLICT (name, base_price, price_unit) DO NOTHING;

-- Step 4: Create assignments for existing company-service relationships
INSERT INTO company_services (company_id, service_id, custom_price, is_available)
SELECT 
  s.company_id,
  gs.id,
  s.base_price as custom_price,
  true as is_available
FROM services s
JOIN global_services gs ON (
  gs.name = s.name AND 
  gs.base_price = s.base_price AND 
  gs.price_unit = s.price_unit
)
ON CONFLICT (company_id, service_id) DO NOTHING;

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_global_services_category ON global_services (category);
CREATE INDEX IF NOT EXISTS idx_global_services_active ON global_services (is_active);
CREATE INDEX IF NOT EXISTS idx_company_services_company_id ON company_services (company_id);
CREATE INDEX IF NOT EXISTS idx_company_services_service_id ON company_services (service_id);

-- Step 6: Enable Row Level Security (RLS)
ALTER TABLE global_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_services ENABLE ROW LEVEL SECURITY;

-- Step 7: Create policies for public read access
DROP POLICY IF EXISTS "Allow public read access to global_services" ON global_services;
CREATE POLICY "Allow public read access to global_services" ON global_services
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow public read access to company_services" ON company_services;
CREATE POLICY "Allow public read access to company_services" ON company_services
  FOR SELECT USING (true);

-- Step 8: Create policies for admin access
DROP POLICY IF EXISTS "Allow admin full access to global_services" ON global_services;
CREATE POLICY "Allow admin full access to global_services" ON global_services
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow admin full access to company_services" ON company_services;
CREATE POLICY "Allow admin full access to company_services" ON company_services
  FOR ALL USING (auth.role() = 'service_role');

-- Step 9: Add some sample global services if none exist
INSERT INTO global_services (name, description, base_price, price_unit, category) VALUES
('Garage Door Installation', 'Complete garage door installation with opener', 1200.00, 'per_service', 'garage_doors'),
('Garage Door Repair', 'General garage door repair service', 150.00, 'per_hour', 'garage_doors'),
('Spring Replacement', 'Garage door spring replacement', 300.00, 'per_service', 'garage_doors'),
('Emergency Repair', '24/7 emergency garage door repair', 200.00, 'per_hour', 'garage_doors'),
('Opener Installation', 'Garage door opener installation', 400.00, 'per_service', 'garage_doors'),
('Luxury Door Installation', 'High-end garage door installation', 2500.00, 'per_service', 'garage_doors'),
('Maintenance Service', 'Regular garage door maintenance', 100.00, 'per_service', 'garage_doors'),
('Door Tune-up', 'Garage door tune-up and adjustment', 75.00, 'per_service', 'garage_doors'),
('Weather Stripping', 'Garage door weather stripping replacement', 50.00, 'per_service', 'garage_doors'),
('Track Alignment', 'Garage door track alignment and repair', 125.00, 'per_service', 'garage_doors')
ON CONFLICT (name, base_price, price_unit) DO NOTHING;

-- Step 10: Verify the migration
-- Check if we have global services
SELECT 'Global Services Count:' as info, COUNT(*) as count FROM global_services;

-- Check if we have company service assignments
SELECT 'Company Service Assignments Count:' as info, COUNT(*) as count FROM company_services;

-- Check a sample company with its services
SELECT 
  c.name as company_name,
  gs.name as service_name,
  cs.custom_price,
  gs.base_price,
  gs.price_unit
FROM companies c
LEFT JOIN company_services cs ON c.id = cs.company_id
LEFT JOIN global_services gs ON cs.service_id = gs.id
LIMIT 10;

-- Step 11: Optional - Drop the old services table after verification
-- UNCOMMENT THE LINE BELOW ONLY AFTER VERIFYING THE MIGRATION WORKED
-- DROP TABLE IF EXISTS services;
