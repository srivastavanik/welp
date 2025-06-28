"use client"

import { createContext, useContext, useEffect, useState } from 'react'
// import { useAuth } from '@/hooks/use-auth'
// import { db } from '@/lib/database'
// import type { AuthUser } from '@/lib/supabase-auth'
// import type { UserProfile, Business } from '@/lib/database'

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
  const [user, setUser] = useState<AuthUser | null>({
    id: 'mock-user-id',
    email: 'demo@welp.com'
  })
  const [userProfile, setUserProfile] = useState<UserProfile | null>({
    id: 'mock-user-id',
    business_id: 'mock-business-id',
    display_name: 'Demo User',
    role: 'owner',
    subscription_tier: 'free',
    lookups_remaining: 3
  })
  const [business, setBusiness] = useState<Business | null>({
    id: 'mock-business-id',
    name: 'Demo Restaurant',
    owner_id: 'mock-user-id'
  })
  const [loading, setLoading] = useState(false)

  // Commented out Supabase integration
  /*
  const auth = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user profile and business when user changes
  useEffect(() => {
    async function loadUserData() {
      if (!auth.user) {
        setUserProfile(null)
        setBusiness(null)
        setLoading(false)
        return
      }

      try {
        // Load user profile
        const profile = await db.getUserProfile(auth.user.id)
        setUserProfile(profile)

        // Load business if user has one
        if (profile?.business_id) {
          const userBusiness = await db.getUserBusiness(auth.user.id)
          setBusiness(userBusiness)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!auth.loading) {
      loadUserData()
    }
  }, [auth.user, auth.loading])
  */

  const signUp = async (email: string, password: string, businessName: string, displayName: string) => {
    // Mock signup
    console.log('Mock signup:', { email, businessName, displayName })
    
    /*
    const result = await auth.signUp(email, password)
    
    if (result.user) {
      // Create business
      const business = await db.createBusiness({
        name: businessName,
        owner_id: result.user.id
      })

      // Create user profile
      const profile = await db.createUserProfile({
        id: result.user.id,
        business_id: business.id,
        display_name: displayName,
        role: 'owner',
        subscription_tier: 'free',
        lookups_remaining: 3
      })

      setUserProfile(profile)
      setBusiness(business)
    }
    */
  }

  const signIn = async (email: string, password: string) => {
    // Mock signin
    console.log('Mock signin:', { email })
    
    /*
    await auth.signIn(email, password)
    */
  }

  const signOut = async () => {
    // Mock signout
    console.log('Mock signout')
    
    /*
    await auth.signOut()
    setUserProfile(null)
    setBusiness(null)
    */
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