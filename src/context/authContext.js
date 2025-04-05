// src/context/AuthContext.js
'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Create the context
const AuthContext = createContext(undefined)

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Function to refresh the session
  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    } catch (error) {
      console.error('Error refreshing session:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Check for user session on mount
  useEffect(() => {
    const getUser = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)
      } catch (error) {
        console.error('Error getting session:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
       
        setUser(session?.user || null)
        setIsLoading(false)
        
        // Force router refresh on sign in and sign out
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          router.refresh()
        }
      }
    )

    // Add event listener for storage changes (for multi-tab sync)
    const handleStorageChange = (e) => {
      if (e.key && e.key.includes('supabase.auth')) {
        refreshSession()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)

    // Cleanup
    return () => {
      subscription.unsubscribe()
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [router, refreshSession])

  // Sign out function
  const signOut = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      router.push('/en')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    refreshSession
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}