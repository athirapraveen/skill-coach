'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { BookOpen, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function Header() {
  const { user, signOut } = useAuth()
  const [firstName, setFirstName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('id', user.id)
            .single()
          
          if (error) {
            console.error('Error fetching user profile:', error)
          } else if (data) {
            setFirstName(data.first_name)
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      }
      setLoading(false)
    }

    fetchUserProfile()
  }, [user])

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="border-b border-gray-200 py-4">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-medium text-gray-900">Skill Coach</span>
        </div>
        <nav className="hidden md:flex gap-6">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
            Dashboard
          </Link>
          <Link href="/roadmaps" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            My Roadmaps
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-700">
                Welcome, {firstName || 'User'}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 