// app/en/auth/callback/route.js
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { handleOAuthUser } from '@/app/[locale]/(main-layout)/auth/actions'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const returnUrl = requestUrl.searchParams.get('returnUrl')
  
  if (code) {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name, options) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
    
    // Get the user ID to sync with MongoDB
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Call handleOAuthUser to sync with MongoDB
      const result = await handleOAuthUser(user.id)
      
      if (result && result.mongoUser) {
        // Get role-based redirect URL
        const redirectUrl = getRoleBasedRedirectUrl(result.mongoUser.role)
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
    }
    
    // Fallback redirect if role-based logic fails
    return NextResponse.redirect(new URL('/en', request.url))
  }
  
  // If no code, redirect to login
  return NextResponse.redirect(new URL('/en/login', request.url))
}

// Helper function to determine redirect URL based on user role
function getRoleBasedRedirectUrl(role) {
  switch(role) {
    case "client":
      return '/en/client-profile'
    case "coach":
      return '/en/coach'
    case "admin":
    case "superadmin":
      return '/en/admin'
    default:
      return '/en' // Default fallback
  }
}