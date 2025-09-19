import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json({ error: 'Service configuration error' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const zipCode = searchParams.get('zip')
    const category = searchParams.get('category') || 'garage_doors'

    if (!zipCode) {
      return NextResponse.json({ error: 'ZIP code is required' }, { status: 400 })
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Search for companies that serve the specified ZIP code
    const { data: companies, error } = await supabase
      .from('companies')
      .select(`
        *,
        company_services (
          *,
          service:global_services (*)
        )
      `)
      .eq('service_category', category)
      .contains('zip_codes', [zipCode])

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
    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json({ error: 'Service configuration error' }, { status: 500 })
    }

    const body = await request.json()
    const { name, description, phone, email, website, address, city, state, zip_codes, service_category } = body

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { data: company, error } = await supabase
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
