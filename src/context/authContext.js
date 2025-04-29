"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useGetUserBySupabaseIdQuery } from "@/redux/services/user.service";
// Create the context
const AuthContext = createContext(undefined);

// Provider component
export function AuthProvider({ children }) {
  const locale = useLocale();
  const [user, setUser] = useState(null);
  const [mongoUser, setMongoUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Only fetch MongoDB user data when we have a valid Supabase ID
  const {
    data,
    isLoading: mongoUserLoading,
    isSuccess,
  } = useGetUserBySupabaseIdQuery(user?.id, {
    skip: !user?.id, // Skip the query if user.id is undefined
  });

  useEffect(() => {
    if (isSuccess && data?.user) {
      setMongoUser(data.user);
    }
  }, [data, isSuccess]);

  // Function to refresh the session
  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        setMongoUser(null);
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
      setUser(null);
      setMongoUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for user session on mount
  useEffect(() => {
    setIsLoading(true);

    const getUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
          setMongoUser(null);
        }
      } catch (error) {
        console.error("Error getting session:", error);
        setUser(null);
        setMongoUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        setMongoUser(null);
      }

      setIsLoading(false);

      // Force router refresh on sign in and sign out
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        router.refresh();
      }
    });

    // Add event listener for storage changes (for multi-tab sync)
    const handleStorageChange = (e) => {
      if (e.key && e.key.includes("supabase.auth")) {
        refreshSession();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Cleanup
    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [router, refreshSession]);

  // Sign out function
  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setMongoUser(null);
      router.push(`/${locale}`);
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    mongoUser,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
