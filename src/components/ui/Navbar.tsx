'use client'

import { createClient } from '@/lib/supabase/client'
import { LogOut, Calendar, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function Navbar() {
  // We keep 'user' generic to handle both Auth User and DB User
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const initializeAuth = async () => {
      // 1. Check Auth (The Source of Truth)
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (authUser) {
        // A. IMMEDIATE UPDATE: User is logged in. Show the UI immediately using Auth data.
        setUser(authUser) 
        
        // B. ENRICH DATA: Try to fetch the pretty name from the database
        const { data: dbUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()
        
        // If we found a DB profile, merge it. If not, we still have the authUser.
        if (dbUser) {
          setUser({ ...authUser, ...dbUser })
        }
      } else {
        setUser(null)
      }
      
      setLoading(false)
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user) // Set immediately to prevent flicker
          const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          if (dbUser) setUser({ ...session.user, ...dbUser })
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.refresh()
  }

  // Helper to get display name safely
  const getDisplayName = () => {
    if (!user) return ''
    // Check for DB 'name', then metadata 'name', then fallback to email
    return user.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors"
          >
            <Calendar className="w-6 h-6 text-primary-600" />
            Event Manager
          </Link>

          <div className="flex items-center gap-6">
            {loading ? (
              // Loading Skeleton to prevent layout shift
              <div className="h-8 w-24 bg-gray-100 animate-pulse rounded" />
            ) : (
              <>
                {user ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <UserIcon className="w-4 h-4" />
                      {/* Use the helper function here */}
                      <span className="text-sm font-medium">{getDisplayName()}</span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Sign out</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <Link
                      href="/auth/login"
                      className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="btn btn-primary"
                      // Use a standard class or inline style if 'btn-primary' isn't defined in your global CSS
                      style={{ padding: '0.5rem 1rem', backgroundColor: '#2563EB', color: 'white', borderRadius: '0.375rem' }}
                    >
                      Get started
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}