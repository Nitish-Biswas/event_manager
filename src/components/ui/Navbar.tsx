'use client'

import { createClient } from '@/lib/supabase/client'
import { LogOut, Calendar, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function Navbar() {
  // Use 'any' temporarily to handle both Auth User and DB User types seamlessly
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const initializeUser = async () => {
      // 1. Ask Supabase Auth: "Is this person logged in?"
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (authUser) {
        // SUCCESS: We are logged in. Set state IMMEDIATELY.
        // This ensures the button appears even if the DB fetch fails later.
        setUser(authUser)

        // 2. Optional: Try to get extra details (Name, Avatar) from the database
        const { data: dbUser, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (dbUser) {
          // If we found a profile, merge it with the auth data
          setUser((prev: any) => ({ ...prev, ...dbUser }))
        } else if (error) {
          console.warn("User is logged in, but profile fetch failed:", error.message)
          // We DO NOT set user to null here. We stay logged in.
        }
      } else {
        setUser(null)
      }
      
      setLoading(false)
    }

    initializeUser()

    // 3. Listen for changes (Sign In / Sign Out events)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user) // Immediate update
          
          // Fetch profile in background
          const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
            
          if (dbUser) setUser((prev: any) => ({ ...prev, ...dbUser }))
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
    router.push('/auth/login')
    router.refresh()
  }

  // Helper to safely get a display name
  const getDisplayName = () => {
    if (!user) return ''
    // 1. Try DB Name, 2. Try Google/Auth Meta Name, 3. Fallback to Email
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
              // Loading Skeleton
              <div className="h-8 w-24 bg-gray-100 animate-pulse rounded" />
            ) : (
              <>
                {user ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <UserIcon className="w-4 h-4" />
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
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