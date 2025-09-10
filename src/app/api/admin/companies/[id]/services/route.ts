import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for admin operations to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params

    const { data: assignments, error } = await supabaseAdmin
      .from('company_services')
      .select(`
        *,
        service:global_services(*)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching company services:', error)
      return NextResponse.json({ error: 'Failed to fetch company services' }, { status: 500 })
    }

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params
    const body = await request.json()
    const { service_id, custom_price, is_available } = body

    // First check if the service is already assigned to this company
    const { data: existingAssignment, error: checkError } = await supabaseAdmin
      .from('company_services')
      .select('id')
      .eq('company_id', companyId)
      .eq('service_id', service_id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing assignment:', checkError)
      return NextResponse.json({ error: 'Failed to check existing assignment' }, { status: 500 })
    }

    if (existingAssignment) {
      return NextResponse.json({ error: 'Service is already assigned to this company' }, { status: 400 })
    }

    const { data: assignment, error } = await supabaseAdmin
      .from('company_services')
      .insert({
        company_id: companyId,
        service_id,
        custom_price,
        is_available: is_available !== undefined ? is_available : true
      })
      .select(`
        *,
        service:global_services(*)
      `)
      .single()

    if (error) {
      console.error('Error assigning service:', error)
      return NextResponse.json({ error: 'Failed to assign service' }, { status: 500 })
    }

    return NextResponse.json({ assignment }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}