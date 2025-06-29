"use client"

import { createContext, useContext, useState } from 'react'

// Mock types for now (until Supabase is enabled)
interface AuthUser {
  id: string;
  email: string;
}

interface UserProfile {
  id: string;
  business_id: string;
  display_name: string;
  role: string;
  subscription_tier: string;
  lookups_remaining: number;
}

interface Business {
  id: string;
  name: string;
  owner_id: string;
}

interface AuthContextType {
  user: AuthUser | null
  userProfile: UserProfile | null
  business: Business | null
  loading: boolean
  signUp: (email: string, password: string, businessName: string, displayName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Mock authentication for now
  const [user] = useState<AuthUser | null>({
    id: 'mock-user-id',
    email: 'demo@welp.com'
  })
  const [userProfile] = useState<UserProfile | null>({
    id: 'mock-user-id',
    business_id: 'mock-business-id',
    display_name: 'Demo User',
    role: 'owner',
    subscription_tier: 'free',
    lookups_remaining: 3
  })
  const [business] = useState<Business | null>({
    id: 'mock-business-id',
    name: 'Demo Restaurant',
    owner_id: 'mock-user-id'
  })
  const [loading] = useState(false)

  const signUp = async (email: string, password: string, businessName: string, displayName: string) => {
    // Mock signup
    console.log('Mock signup:', { email, businessName, displayName })
  }

  const signIn = async (email: string, password: string) => {
    // Mock signin
    console.log('Mock signin:', { email })
  }

  const signOut = async () => {
    // Mock signout
    console.log('Mock signout')
  }

  const value: AuthContextType = {
    user,
    userProfile,
    business,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}