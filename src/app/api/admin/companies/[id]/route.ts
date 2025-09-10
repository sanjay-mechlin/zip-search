import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for admin operations to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, phone, email, website, address, city, state, zip_codes, service_category } = body

    const { data: company, error } = await supabaseAdmin
      .from('companies')
      .update({
        name,
        description,
        phone,
        email,
        website,
        address,
        city,
        state,
        zip_codes,
        service_category: service_category || 'garage_doors',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating company:', error)
      return NextResponse.json({ error: 'Failed to update company' }, { status: 500 })
    }

    return NextResponse.json({ company })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await supabaseAdmin
      .from('companies')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting company:', error)
      return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
