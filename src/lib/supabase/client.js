// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

// Client for browser/client components
export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// Export a singleton instance for easy imports in client components
export const supabase = createClient()