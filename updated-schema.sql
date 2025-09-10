-- Updated schema with global services and company service assignments

-- Create global_services table (master list of all available services)
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

-- Create company_services table (junction table for company-service assignments)
CREATE TABLE company_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  service_id UUID REFERENCES global_services(id) ON DELETE CASCADE,
  custom_price DECIMAL(10,2), -- Optional custom price override
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, service_id) -- Prevent duplicate assignments
);

-- Drop the old services table
DROP TABLE IF EXISTS services;

-- Create indexes for better performance
CREATE INDEX idx_global_services_category ON global_services (category);
CREATE INDEX idx_global_services_active ON global_services (is_active);
CREATE INDEX idx_company_services_company_id ON company_services (company_id);
CREATE INDEX idx_company_services_service_id ON company_services (service_id);

-- Enable Row Level Security (RLS)
ALTER TABLE global_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_services ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to global_services" ON global_services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to company_services" ON company_services
  FOR SELECT USING (true);

-- Create policies for admin access
CREATE POLICY "Allow admin full access to global_services" ON global_services
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow admin full access to company_services" ON company_services
  FOR ALL USING (auth.role() = 'service_role');

-- Insert sample global services
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
('Track Alignment', 'Garage door track alignment and repair', 125.00, 'per_service', 'garage_doors');

-- Assign some services to existing companies
INSERT INTO company_services (company_id, service_id, custom_price)
SELECT 
  c.id,
  gs.id,
  CASE 
    WHEN gs.name = 'Luxury Door Installation' THEN 2800.00 -- Custom price for Elite Door Services
    ELSE gs.base_price
  END
FROM companies c
CROSS JOIN global_services gs
WHERE (c.name = 'Premier Garage Doors' AND gs.name IN ('Garage Door Installation', 'Garage Door Repair', 'Spring Replacement'))
   OR (c.name = 'Quick Fix Garage' AND gs.name IN ('Emergency Repair', 'Opener Installation'))
   OR (c.name = 'Elite Door Services' AND gs.name IN ('Luxury Door Installation', 'Maintenance Service'));
