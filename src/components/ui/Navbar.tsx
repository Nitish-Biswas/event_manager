'use client'

import { createClient } from '@/lib/supabase/client'
import { LogOut, Calendar, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // const initializeUser = async () => {
    //   // 1. Ask Supabase Auth: "Is this person logged in?"
    //   // We extract 'authUser' directly and 'authError' if needed
    //   console.log(">>> CLIENT: Checking Auth...")
    //   console.log(">>> CLIENT: Document Cookie string:", document.cookie) // DANGEROUS: Don't show to others, purely for your debug
    //   const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    //   console.log(">>> CLIENT: Supabase getUser() returned:", authUser?.email)
    //   if (authError) console.error(">>> CLIENT: Supabase Error:", authError)
    //   if (authUser) {
    //     // SUCCESS: We are logged in. Set state IMMEDIATELY.
    //     setUser(authUser)

    //     // 2. Optional: Try to get extra details (Name) from the database
    //     const { data: dbUser, error: dbError } = await supabase
    //       .from('users')
    //       .select('*')
    //       .eq('id', authUser.id)
    //       .single()

    //     if (dbUser) {
    //       // If we found a profile, merge it with the auth data
    //       setUser((prev: any) => ({ ...prev, ...dbUser }))
    //     } else if (dbError) {
    //       // If DB fetch fails, we just warn console but keep the user logged in
    //       console.warn("Profile fetch warning:", dbError.message)
    //     }
    //   } else {
    //     setUser(null)
    //   }
      
    //   setLoading(false)
    // }

    // Inside Navbar.tsx

    const initializeUser = async () => {
      // 1. Try getSession first (Reads directly from cookie - FAST)

      console.log(">>> CLIENT: Checking Auth...")
      console.log(">>> CLIENT: Document Cookie string:", document.cookie) // DANGEROUS: Don't show to others, purely for your debug
      const { data: { session }, error: SesError } = await supabase.auth.getSession()

      if (SesError) console.error(">>> CLIENT: Supabase Error:", SesError)
      if (session?.user) {
        // Logged in! Show button immediately
        setUser(session.user)
        
        // 2. Validate with getUser in background (SECURITY)
        const { data: validData } = await supabase.auth.getUser()
        if (!validData.user) {
           setUser(null) // Token was actually revoked/invalid
        } else {
           // 3. Fetch profile if needed
           const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
           if (dbUser) setUser((prev: any) => ({ ...prev, ...dbUser }))
        }
      } else {
        setUser(null)
      }
      
      setLoading(false)
    }

    initializeUser()

    // 3. Listen for real-time auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user) // Immediate update
          
          // Background fetch for profile details
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
    router.push('/auth/login') // Redirect to login
    router.refresh() // Clear server cache
  }

  // Helper to safely get a display name
  const getDisplayName = () => {
    if (!user) return ''
    // Priority: 1. DB Name, 2. Google Name, 3. Email prefix
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