import { useState, useEffect } from 'react'
import { authService, type AuthUser } from '@/lib/supabase-auth'
import type { Session } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    authService.getSession().then((session) => {
      setSession(session)
      setUser(session?.user as AuthUser || null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user as AuthUser || null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    setLoading(true)
    try {
      const result = await authService.signUp(email, password, metadata)
      return result
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await authService.signIn(email, password)
      return result
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await authService.signOut()
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email)
  }

  const updateUser = async (updates: { email?: string; password?: string; data?: Record<string, any> }) => {
    setLoading(true)
    try {
      const result = await authService.updateUser(updates)
      return result
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateUser,
    isAuthenticated: !!user
  }
}