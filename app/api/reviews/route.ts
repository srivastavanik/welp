import { NextRequest, NextResponse } from 'next/server'
import { reviewService, customerService } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customer_id')
    const restaurantName = searchParams.get('restaurant_name')

    let reviews
    if (customerId) {
      reviews = await reviewService.getReviewsByCustomer(customerId)
    } else if (restaurantName) {
      reviews = await reviewService.getReviewsByRestaurant(restaurantName)
    } else {
      reviews = await reviewService.getAllReviews()
    }

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      customer_phone, 
      customer_name, 
      restaurant_name, 
      rating, 
      comment,
      behavior_rating,
      payment_rating,
      maintenance_rating,
      reviewer_role
    } = body

    if (!customer_phone || !restaurant_name || !rating || !reviewer_role) {
      return NextResponse.json({ 
        error: 'Customer phone, restaurant name, rating, and reviewer role are required' 
      }, { status: 400 })
    }

    // Find or create customer
    let customer = await customerService.getCustomerByPhone(customer_phone)
    if (!customer) {
      customer = await customerService.createCustomer({
        phone_number: customer_phone,
        name: customer_name || `Customer ${customer_phone.slice(-4)}`,
        email: undefined
      })
    }

    // Create review with additional ratings
    const reviewData = {
      customer_id: customer.id,
      restaurant_name,
      rating,
      comment: comment || '',
      behavior_rating: behavior_rating || rating,
      payment_rating: payment_rating || rating,
      maintenance_rating: maintenance_rating || rating,
      reviewer_role
    }

    const review = await reviewService.createReview(reviewData)

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 