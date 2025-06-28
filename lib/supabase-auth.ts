import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthUser extends User {
  // Add any custom user properties here
}

export class SupabaseAuthService {
  // Sign up with email and password
  async signUp(email: string, password: string, metadata?: Record<string, any>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    
    if (error) throw error
    return data
  }

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  }

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Get current session
  async getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user as AuthUser | null
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  // Reset password
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    
    if (error) throw error
  }

  // Update user metadata
  async updateUser(updates: { email?: string; password?: string; data?: Record<string, any> }) {
    const { data, error } = await supabase.auth.updateUser(updates)
    if (error) throw error
    return data
  }
}

export const authService = new SupabaseAuthService()