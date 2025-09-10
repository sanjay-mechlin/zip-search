import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for admin operations to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { data: services, error } = await supabaseAdmin
      .from('global_services')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching global services:', error)
      return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
    }

    return NextResponse.json({ services })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, base_price, price_unit, category } = body

    const { data: service, error } = await supabaseAdmin
      .from('global_services')
      .insert({
        name,
        description,
        base_price,
        price_unit,
        category: category || 'general'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating global service:', error)
      return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
    }

    return NextResponse.json({ service }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
