'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ConfirmPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)

    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')
    const type = params.get('type')
    const error = params.get('error')

    if (error) {
      console.error('Confirmation error:', error)
      router.push('/auth/login')
      return
    }

    if (access_token && refresh_token && type === 'signup') {
      supabase.auth.setSession({ access_token, refresh_token })
        .then(({ error }) => {
          if (error) {
            console.error('Session set error:', error)
            router.push('/auth/login')
          } else {
            router.push('/')
            router.refresh()
          }
        })
    } else {
      router.push('/')
      router.refresh()
    }
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Confirming your email...</h2>
        <p className="mt-2 text-gray-600">You will be redirected shortly.</p>
      </div>
    </div>
  )
}