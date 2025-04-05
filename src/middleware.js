// src/middleware.js
import { NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { routing } from './i18n/routing';

// Create a combined middleware function that handles both authentication and internationalization
export async function middleware(request) {
  // First run the internationalization middleware
  const intlMiddleware = createIntlMiddleware(routing);
  
  // Run the intl middleware first to handle locale routing
  let response = await intlMiddleware(request);
  
  // If the response is a redirect (intl middleware redirected), just return it
  if (response.status !== 200) {
    return response;
  }
  
  // Create supabase server client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );
  
  // Get the user session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;
  
  // Define protected paths
  const protectedPaths = [
    '/dashboard',
    '/profile', 
    '/settings'
  ];
  
  // Check if the current path is protected and needs authentication
  const isProtectedPath = protectedPaths.some(path => pathname.includes(path));
  
  // If the path is protected and there's no session, redirect to login
  if (isProtectedPath && !session) {
    // Determine the current locale from the URL (default to 'en' if not found)
    const localeMatch = pathname.match(/^\/([a-z]{2})\//);
    const locale = localeMatch ? localeMatch[1] : 'en';
    
    // Redirect to the login page with the appropriate locale
    const redirectUrl = new URL(`/${locale}/auth/login`, request.url);
    
    // Add original URL as return path
    redirectUrl.searchParams.set('returnUrl', pathname);
    
    return NextResponse.redirect(redirectUrl);
  }
  
  return response;
}

// Configure the middleware to run on all paths with locale prefixes
// Include all the paths from the original matcher plus the intl paths
export const config = {
  matcher: [
    '/', 
    '/(en|ar)/:path*',
    '/(.*)/dashboard/:path*',
    '/(.*)/profile/:path*',
    '/(.*)/settings/:path*',
  ],
};