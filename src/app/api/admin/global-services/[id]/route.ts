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
    const { name, description, base_price, price_unit, category, is_active } = body

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (base_price !== undefined) updateData.base_price = base_price
    if (price_unit !== undefined) updateData.price_unit = price_unit
    if (category !== undefined) updateData.category = category
    if (is_active !== undefined) updateData.is_active = is_active

    const { data: service, error } = await supabaseAdmin
      .from('global_services')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating global service:', error)
      return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
    }

    return NextResponse.json({ service })
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
      .from('global_services')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting global service:', error)
      return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
