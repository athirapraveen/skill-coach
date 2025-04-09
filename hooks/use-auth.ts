'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useSupabase } from '@/lib/supabase-provider'

export type User = {
  id: string
  email: string
  first_name?: string
  last_name?: string
}

export function useAuth() {
  const router = useRouter()
  const { supabase, session, isLoading } = useSupabase()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Update user state when session changes
    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email!,
      })
    } else {
      setUser(null)
    }
    setLoading(false)
  }, [session])

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      // Proceed with signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        // Handle specific error cases
        if (error.message.includes('already registered')) {
          toast.error('An account with this email already exists. Please try logging in instead.')
          router.push('/login')
          return
        }
        throw error
      }

      if (data.user) {
        toast.success('Signup successful! Please check your email to confirm your account.')
        router.push('/login')
      }
    } catch (error) {
      console.error('Error signing up:', error)
      toast.error('Failed to sign up. Please try again.')
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('Signed in successfully!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error signing in:', error)
      toast.error('Failed to sign in. Please check your credentials and try again.')
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast.success('Signed out successfully!')
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out. Please try again.')
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })

      if (error) throw error

      toast.success('Password reset email sent. Please check your inbox.')
    } catch (error) {
      console.error('Error resetting password:', error)
      toast.error('Failed to send password reset email. Please try again.')
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      toast.success('Password updated successfully!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error updating password:', error)
      toast.error('Failed to update password. Please try again.')
    }
  }

  return {
    user,
    loading: loading || isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  }
} 