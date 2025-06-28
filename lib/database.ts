import { supabase } from './supabase'
import type { Database } from './supabase'

// Type definitions for our tables
export type Business = Database['public']['Tables']['businesses']['Row']
export type CustomerProfile = Database['public']['Tables']['customer_profiles']['Row']
export type CustomerReview = Database['public']['Tables']['customer_reviews']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export type BusinessInsert = Database['public']['Tables']['businesses']['Insert']
export type CustomerProfileInsert = Database['public']['Tables']['customer_profiles']['Insert']
export type CustomerReviewInsert = Database['public']['Tables']['customer_reviews']['Insert']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']

export class DatabaseService {
  // Business operations
  async createBusiness(business: Omit<BusinessInsert, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('businesses')
      .insert(business)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async getUserBusiness(userId: string) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found"
    return data
  }

  // Customer profile operations
  async getCustomerByPhoneHash(phoneHash: string): Promise<CustomerProfile | null> {
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('phone_hash', phoneHash)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async createCustomerProfile(profile: Omit<CustomerProfileInsert, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('customer_profiles')
      .insert(profile)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateCustomerProfile(id: string, updates: Partial<CustomerProfile>) {
    const { data, error } = await supabase
      .from('customer_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Customer review operations
  async createCustomerReview(review: Omit<CustomerReviewInsert, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('customer_reviews')
      .insert(review)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async getCustomerReviews(customerId: string) {
    const { data, error } = await supabase
      .from('customer_reviews')
      .select(`
        *,
        businesses(name),
        user_profiles(display_name, role)
      `)
      .eq('customer_profile_id', customerId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  async getBusinessReviews(businessId: string) {
    const { data, error } = await supabase
      .from('customer_reviews')
      .select(`
        *,
        customer_profiles(display_id, overall_score),
        user_profiles(display_name, role)
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  async getUserReviews(userId: string) {
    const { data, error } = await supabase
      .from('customer_reviews')
      .select(`
        *,
        customer_profiles(display_id, overall_score)
      `)
      .eq('reviewer_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  async deleteReview(reviewId: string) {
    const { error } = await supabase
      .from('customer_reviews')
      .delete()
      .eq('id', reviewId)
    
    if (error) throw error
  }

  // User profile operations
  async createUserProfile(profile: Omit<UserProfileInsert, 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        businesses(*)
      `)
      .eq('id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Utility functions
  async recalculateCustomerScores(customerId: string) {
    // Get all reviews for this customer
    const reviews = await this.getCustomerReviews(customerId)
    
    if (reviews.length === 0) return
    
    // Calculate averages
    const totalReviews = reviews.length
    const overallScore = reviews.reduce((sum, r) => sum + r.overall_rating, 0) / totalReviews
    const behaviorScore = reviews.reduce((sum, r) => sum + r.behavior_rating, 0) / totalReviews
    const paymentScore = reviews.reduce((sum, r) => sum + r.payment_rating, 0) / totalReviews
    const maintenanceScore = reviews.reduce((sum, r) => sum + r.maintenance_rating, 0) / totalReviews
    
    // Check if customer should be flagged (average overall score < 2.0)
    const isFlagged = overallScore < 2.0
    
    // Update customer profile
    await this.updateCustomerProfile(customerId, {
      overall_score: Number(overallScore.toFixed(2)),
      behavior_score: Number(behaviorScore.toFixed(2)),
      payment_score: Number(paymentScore.toFixed(2)),
      maintenance_score: Number(maintenanceScore.toFixed(2)),
      total_reviews: totalReviews,
      is_flagged: isFlagged
    })
  }

  // Hash phone number for privacy
  async hashPhoneNumber(phoneNumber: string): Promise<string> {
    // Simple hash function - in production, use a proper cryptographic hash
    const encoder = new TextEncoder()
    const data = encoder.encode(phoneNumber)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Generate display ID from phone number (e.g., "John D.")
  generateDisplayId(phoneNumber: string): string {
    // Simple algorithm to generate consistent display names
    const names = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Chris', 'Amy', 'Tom', 'Kate']
    const lastInitials = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    
    // Use phone number to deterministically pick name and initial
    const phoneSum = phoneNumber.split('').reduce((sum, digit) => sum + parseInt(digit) || 0, 0)
    const firstName = names[phoneSum % names.length]
    const lastInitial = lastInitials[phoneSum % lastInitials.length]
    
    return `${firstName} ${lastInitial}.`
  }
}

export const db = new DatabaseService()