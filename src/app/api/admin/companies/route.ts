import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for admin operations to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Fetch all companies with their services for admin dashboard
    const { data: companies, error } = await supabaseAdmin
      .from('companies')
      .select(`
        *,
        company_services (
          *,
          service:global_services (*)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching companies:', error)
      return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
    }

    return NextResponse.json({ companies })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, phone, email, website, address, city, state, zip_codes, service_category } = body

    const { data: company, error } = await supabaseAdmin
      .from('companies')
      .insert({
        name,
        description,
        phone,
        email,
        website,
        address,
        city,
        state,
        zip_codes,
        service_category: service_category || 'garage_doors'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating company:', error)
      return NextResponse.json({ error: 'Failed to create company' }, { status: 500 })
    }

    return NextResponse.json({ company }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
