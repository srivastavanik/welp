import { createClient } from '@supabase/supabase-js'

// Use placeholder values when environment variables are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Only throw error in production or when actually trying to use Supabase
const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!isSupabaseConfigured && process.env.NODE_ENV === 'production') {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Export a flag to check if Supabase is properly configured
export const isSupabaseReady = isSupabaseConfigured

// Database types will be generated here once you set up your schema
export type Database = {
  public: {
    Tables: {
      // Tables will be defined here
    }
    Views: {
      // Views will be defined here
    }
    Functions: {
      // Functions will be defined here
    }
    Enums: {
      // Enums will be defined here
    }
  }
}