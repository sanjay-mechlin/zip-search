import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Company {
  id: string
  name: string
  description?: string
  phone: string
  email: string
  website?: string
  address: string
  city: string
  state: string
  zip_codes: string[]
  service_category: string
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  company_id: string
  name: string
  description?: string
  base_price: number
  price_unit: string // 'per_hour', 'per_service', 'per_sqft', etc.
  created_at: string
  updated_at: string
}

export interface CompanyWithServices extends Company {
  services: Service[]
}
