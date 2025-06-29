import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client for server-side operations with elevated permissions
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

// Database types
export interface Customer {
  id: string
  phone_number: string
  name: string
  email?: string
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  customer_id: string
  restaurant_name: string
  rating: number
  comment: string
  behavior_rating: number
  payment_rating: number
  maintenance_rating: number
  reviewer_role: string
  reddit_url?: string
  reddit_shared?: boolean
  created_at: string
  updated_at: string
  customer?: Customer
}

// Database functions
export const customerService = {
  async createCustomer(data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) {
    const { data: customer, error } = await supabase
      .from('customers')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return customer
  },

  async getCustomerByPhone(phoneNumber: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async updateCustomer(id: string, data: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>) {
    const { data: customer, error } = await supabase
      .from('customers')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return customer
  }
}

export const reviewService = {
  async createReview(data: Omit<Review, 'id' | 'created_at' | 'updated_at'>) {
    const { data: review, error } = await supabase
      .from('reviews')
      .insert(data)
      .select(`
        *,
        customer:customers(*)
      `)
      .single()

    if (error) throw error
    return review
  },

  async getReviewsByCustomer(customerId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        customer:customers(*)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getReviewsByRestaurant(restaurantName: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        customer:customers(*)
      `)
      .eq('restaurant_name', restaurantName)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getAllReviews() {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        customer:customers(*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
} 