import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // DEBUG: Log ALL cookies the server receives
  const allCookies = request.cookies.getAll()
  console.log("---------------- MIDDELWARE START ----------------")
  console.log("Request URL:", request.nextUrl.pathname)
  console.log("Cookies received by Server:", allCookies.map(c => c.name))
  
  const hasAuthCookie = allCookies.some(c => c.name.includes('sb-') && c.name.includes('-auth-token'))
  console.log("Server sees Auth Cookie?", hasAuthCookie ? "YES" : "NO")

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // DEBUG: Result of getUser()
  const { data: { user }, error } = await supabase.auth.getUser()
  console.log("Middleware getUser() result:", user?.email || "NULL")
  if (error) console.log("Middleware Error:", error.message)
  console.log("---------------- MIDDLEWARE END ----------------")

  return response
}