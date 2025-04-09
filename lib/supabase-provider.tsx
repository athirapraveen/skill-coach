'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Session, User, SupabaseClient } from '@supabase/supabase-js'

type SupabaseContextType = {
  supabase: SupabaseClient
  session: Session | null
  user: User | null
  isLoading: boolean
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

// Export the provider component as default
export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClientComponentClient())
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get the initial session
    const getSession = async () => {
      try {
        setIsLoading(true)
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setSession(null)
          setUser(null)
          return
        }
        
        console.log('Initial session check:', initialSession?.user?.email || 'No session')
        setSession(initialSession)
        setUser(initialSession?.user || null)
      } catch (error) {
        console.error('Error in getSession:', error)
        setSession(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email)
        
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', currentSession?.user?.email)
          setSession(currentSession)
          setUser(currentSession?.user || null)
          router.refresh()
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out')
          setSession(null)
          setUser(null)
          router.refresh()
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed for:', currentSession?.user?.email)
          setSession(currentSession)
          setUser(currentSession?.user || null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  // Log the active session for debugging
  useEffect(() => {
    console.log('Active session:', session?.user?.email || 'No session')
  }, [session])

  const value = {
    supabase,
    session,
    user,
    isLoading
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
} 