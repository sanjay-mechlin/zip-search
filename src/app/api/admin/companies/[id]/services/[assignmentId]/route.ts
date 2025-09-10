import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for admin operations to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  try {
    const { assignmentId } = await params
    const body = await request.json()
    const { custom_price, is_available } = body

    const updateData: any = {}

    if (custom_price !== undefined) updateData.custom_price = custom_price
    if (is_available !== undefined) updateData.is_available = is_available

    const { data: assignment, error } = await supabaseAdmin
      .from('company_services')
      .update(updateData)
      .eq('id', assignmentId)
      .select(`
        *,
        service:global_services(*)
      `)
      .single()

    if (error) {
      console.error('Error updating service assignment:', error)
      return NextResponse.json({ error: 'Failed to update service assignment' }, { status: 500 })
    }

    return NextResponse.json({ assignment })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  try {
    const { assignmentId } = await params

    const { error } = await supabaseAdmin
      .from('company_services')
      .delete()
      .eq('id', assignmentId)

    if (error) {
      console.error('Error unassigning service:', error)
      return NextResponse.json({ error: 'Failed to unassign service' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
