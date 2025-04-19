"use client"

import React, { useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createGoogleUser, getUser } from "../actions"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"



export function LoginForm({ onToggle }) {
  const t = useTranslations("LoginPage")
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const local = useLocale();
  const loginSchema = z.object({
    email: z.string().email({ message: t("emailError") }),
    password: z.string().min(6, { message: t("passwordError") }),
  })
  // We'll determine this based on user role later
  const defaultReturnUrl = `/${local}`

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
    // Clear global error
    if (globalError) {
      setGlobalError(null)
    }
  }

  // Helper function to get redirect URL based on user role
  const getRedirectUrl = (role) => {
    const urlBase = `/${local}`
    
    switch(role) {
      case "client":
        return `${urlBase}/client-profile`
      case "coach":
        return `${urlBase}/coach`
      case "admin":
      case "super admin":
        return `${urlBase}/admin`
      default:
        return `${urlBase}` // Default fallback
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGlobalError(null)
    setIsSubmitting(true)

    try {
      // Validate form data
      const validatedData = loginSchema.parse(formData)

      // Direct client-side auth with Supabase
      const { error, data } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password
      })

      if (error) {
        setGlobalError(error.message || t("loginFailed"))
        return
      }
      
      // Call server action to handle any additional server-side logic if needed
      const userData = await getUser(data.user.id)
      console.log(userData)
      
      // Get appropriate redirect URL based on user role
      const roleBasedRedirectUrl = getRedirectUrl(userData.role)
      
      // Force a router refresh to update auth state across the app
      router.refresh()
      
      // Redirect based on role
      router.push(roleBasedRedirectUrl)
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const formattedErrors = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0].toString()] = err.message
          }
        })
        setErrors(formattedErrors)
      } else {
        // Handle unexpected errors
        setGlobalError(error instanceof Error ? error.message : t("unexpectedError"))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setGlobalError(null)
  
    try {
      const { data: sessionData } = await supabase.auth.getSession()
  
      if (sessionData?.session?.user) {
        const user = sessionData.session.user
        console.log(user)
        
        // Create or get Google user
        const response = await createGoogleUser({
          email: user.email,
          supabaseId: user.id,
          firstName: user.user_metadata?.given_name || user.user_metadata?.name?.split(' ')[0] || '',
          lastName: user.user_metadata?.family_name || user.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
          provider: 'google',
          role: "client" // Default role is client
        })
        
        // Get the user data from MongoDB to determine role
        const userData = await getUser(user.id)
        
        // Get appropriate redirect URL based on user role
        const roleBasedRedirectUrl = getRedirectUrl(userData.mongoUser.role)
        
        // Redirect based on role
        router.push(roleBasedRedirectUrl)
        return
      }
  
      // If no session exists, initiate Google OAuth
      const returnUrl = searchParams.get('returnUrl') || defaultReturnUrl
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/en/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}`
        }
      })
  
      if (error) {
        throw new Error(error.message)
      }
  
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : 'Google sign-in failed')
      setIsGoogleLoading(false)
    }
  } 
  

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-white">{t("welcomeBack")}</h1>
        <p className="text-gray-400">{t("signInToYourAccount")}</p>
      </div>

      {globalError && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            {t("email")}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            className="bg-black/30 border-gray-700 text-white"
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white">
            {t("password")}
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="bg-black/30 border-gray-700 text-white"
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          <div className="flex justify-end">
            <Link href={`/${local}/auth/forgot-password`} className="text-xs text-[#B4E90E] hover:underline">
              {t("forgotPassword")}
            </Link>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-[#B4E90E] hover:bg-[#a3d40d] text-black font-medium disabled:opacity-50"
        >
          {isSubmitting ? t("signingIn") : t("signIn")}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-700"></span>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#0d111a] px-2 text-gray-400">{t("orContinueWith")}</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full border-gray-700 text-white bg-black/20"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t("connecting")}
          </span>
        ) : (
          <>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            {t("signInWithGoogle")}
          </>
        )}
      </Button>

      <div className="text-center text-sm text-gray-400">
        {t("dontHaveAnAccount")}
        <button type="button" onClick={onToggle} className="text-[#B4E90E] hover:underline font-medium">
          {t("signUp")}
        </button>
      </div>
    </div>
  )
}