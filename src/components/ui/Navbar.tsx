'use client'

import { createClient } from '@/lib/supabase/client'
import { LogOut, Calendar, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export function Navbar() {
  const supabase = createClient()
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  /* ---------------------------------------------------------
     Restore session on page refresh (PRODUCTION SAFE)
  --------------------------------------------------------- */
  useEffect(() => {
    let mounted = true

    const init = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (!mounted) return

      if (error) {
        console.error('Session error:', error)
        setUser(null)
      } else {
        setUser(data.session?.user ?? null)
      }

      setLoading(false)
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  /* ---------------------------------------------------------
     Sign out
  --------------------------------------------------------- */
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/auth/login')
    router.refresh()
  }

  const displayName =
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'User'

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-gray-900"
          >
            <Calendar className="w-6 h-6 text-blue-600" />
            Event Manager
          </Link>

          {loading ? (
            <div className="h-8 w-24 bg-gray-100 animate-pulse rounded" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <UserIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{displayName}</span>
              </div>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sign out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
