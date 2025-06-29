import { NextRequest, NextResponse } from 'next/server'
import { customerService } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const customer = await customerService.getCustomerByPhone(phone)
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone_number, name, email } = body

    if (!phone_number || !name) {
      return NextResponse.json({ error: 'Phone number and name are required' }, { status: 400 })
    }

    // Check if customer already exists
    const existingCustomer = await customerService.getCustomerByPhone(phone_number)
    if (existingCustomer) {
      return NextResponse.json({ customer: existingCustomer })
    }

    // Create new customer
    const customer = await customerService.createCustomer({
      phone_number,
      name,
      email
    })

    return NextResponse.json({ customer }, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 