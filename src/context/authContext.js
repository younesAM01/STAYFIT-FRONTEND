'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Create the context
const AuthContext = createContext(undefined)

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [mongoUser, setMongoUser] = useState(null) // Add MongoDB user state
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  // Function to fetch MongoDB user data using Supabase ID via the existing GET endpoint
  const fetchMongoUser = async (supabaseId) => {
    try {
      // Use the existing GET endpoint with supabaseId as a query parameter
      const response = await fetch(`/api/users?supabaseId=${encodeURIComponent(supabaseId)}`)
      
      if (response.ok) {
        const userData = await response.json()
        setMongoUser(userData)
        return userData
      } else {
        console.error('Failed to fetch MongoDB user data:', response.status)
        return null
      }
    } catch (error) {
      console.error('Error fetching MongoDB user:', error)
      return null
    }
  }

  // Function to refresh the session
  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      console.log(session)
      if (session?.user) {
          
        // Fetch MongoDB user data when we have a valid Supabase user
        await fetchMongoUser(session.user.id)
      } else {
        setUser(null)
        setMongoUser(null)
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
      setUser(null)
      setMongoUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Check for user session on mount
  useEffect(() => {
    setIsLoading(true) // ✅ Add this line

    const getUser = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          // Fetch MongoDB user data using Supabase ID
          await fetchMongoUser(session.user.id)
        } else {
          setUser(null)
          setMongoUser(null)
        }
      } catch (error) {
        console.error('Error getting session:', error)
        setUser(null)
        setMongoUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          
          // Fetch MongoDB user data on sign in
          if (event === 'SIGNED_IN') {
            await fetchMongoUser(session.user.id)
          }
        } else {
          setUser(null)
          setMongoUser(null)
        }
        
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
      setUser(null)
      setMongoUser(null)
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
    mongoUser, // Add MongoDB user to the context value
    isLoading,
    isAuthenticated: !!user,
    signOut,
    refreshSession
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}