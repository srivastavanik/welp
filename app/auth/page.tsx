"use client"

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { useState } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { SignUpForm } from '@/components/auth/signup-form'
import Image from 'next/image'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-red/5 to-brand-red/10 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Image 
            src="/logo-transparent.png" 
            alt="Welp Logo" 
            width={120} 
            height={120} 
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-text-primary">
            Welcome to Welp
          </h1>
          <p className="text-text-secondary mt-2">
            The customer rating platform for businesses
          </p>
        </div>
        
        {isSignUp ? (
          <SignUpForm onToggleMode={() => setIsSignUp(false)} />
        ) : (
          <LoginForm onToggleMode={() => setIsSignUp(true)} />
        )}
      </div>
    </div>
  )
}