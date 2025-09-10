-- Create companies table
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
  zip_codes TEXT[] NOT NULL, -- Array of ZIP codes this company serves
  service_category VARCHAR(100) NOT NULL DEFAULT 'garage_doors',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  price_unit VARCHAR(50) NOT NULL DEFAULT 'per_service',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_companies_zip_codes ON companies USING GIN (zip_codes);
CREATE INDEX idx_companies_service_category ON companies (service_category);
CREATE INDEX idx_services_company_id ON services (company_id);

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to companies" ON companies
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to services" ON services
  FOR SELECT USING (true);

-- Create policies for admin access (you'll need to set up authentication)
CREATE POLICY "Allow admin full access to companies" ON companies
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow admin full access to services" ON services
  FOR ALL USING (auth.role() = 'service_role');

-- Insert sample data
INSERT INTO companies (name, description, phone, email, website, address, city, state, zip_codes, service_category) VALUES
('Premier Garage Doors', 'Professional garage door installation and repair services', '(555) 123-4567', 'info@premiergaragedoors.com', 'https://premiergaragedoors.com', '123 Main St', 'Anytown', 'CA', ARRAY['90210', '90211', '90212'], 'garage_doors'),
('Quick Fix Garage', 'Fast and reliable garage door repairs', '(555) 987-6543', 'contact@quickfixgarage.com', 'https://quickfixgarage.com', '456 Oak Ave', 'Anytown', 'CA', ARRAY['90210', '90213', '90214'], 'garage_doors'),
('Elite Door Services', 'Premium garage door solutions', '(555) 456-7890', 'hello@elitedoors.com', 'https://elitedoors.com', '789 Pine St', 'Anytown', 'CA', ARRAY['90211', '90212', '90215'], 'garage_doors');

-- Insert sample services
INSERT INTO services (company_id, name, description, base_price, price_unit) VALUES
((SELECT id FROM companies WHERE name = 'Premier Garage Doors'), 'Garage Door Installation', 'Complete garage door installation with opener', 1200.00, 'per_service'),
((SELECT id FROM companies WHERE name = 'Premier Garage Doors'), 'Garage Door Repair', 'General garage door repair service', 150.00, 'per_hour'),
((SELECT id FROM companies WHERE name = 'Premier Garage Doors'), 'Spring Replacement', 'Garage door spring replacement', 300.00, 'per_service'),
((SELECT id FROM companies WHERE name = 'Quick Fix Garage'), 'Emergency Repair', '24/7 emergency garage door repair', 200.00, 'per_hour'),
((SELECT id FROM companies WHERE name = 'Quick Fix Garage'), 'Opener Installation', 'Garage door opener installation', 400.00, 'per_service'),
((SELECT id FROM companies WHERE name = 'Elite Door Services'), 'Luxury Door Installation', 'High-end garage door installation', 2500.00, 'per_service'),
((SELECT id FROM companies WHERE name = 'Elite Door Services'), 'Maintenance Service', 'Regular garage door maintenance', 100.00, 'per_service');
