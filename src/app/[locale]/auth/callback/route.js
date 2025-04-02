// app/en/auth/callback/route.js
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { handleOAuthUser } from '@/app/[locale]/auth/actions'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
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
      await handleOAuthUser(user.id)
    }
    
    // Redirect to the dashboard (this matches your server action redirectTo)
    return NextResponse.redirect(new URL('/en/dashboard', request.url))
  }
  
  // If no code, redirect to login
  return NextResponse.redirect(new URL('/en/login', request.url))
}