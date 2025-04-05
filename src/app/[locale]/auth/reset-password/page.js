"use client"

import React, { useState, useEffect } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { useLocale } from "use-intl"

const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState({ type: "", text: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSessionValid, setIsSessionValid] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const router = useRouter()
  const local = useLocale()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsSessionValid(!!session)
      setIsCheckingSession(false)
    }
    
    checkSession()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setMessage({ type: "", text: "" })
    setIsSubmitting(true)

    try {
      // Validate form data
      const validatedData = resetPasswordSchema.parse(formData)

      // Update password via Supabase
      const { error } = await supabase.auth.updateUser({
        password: validatedData.password
      })

      if (error) {
        throw new Error(error.message)
      }

      // Show success message
      setMessage({
        type: "success",
        text: "Password has been reset successfully! Redirecting to login...",
      })
      
      // Clear form
      setFormData({
        password: "",
        confirmPassword: "",
      })
      
      // Redirect to login after a delay
      setTimeout(() => {
        router.push(`/${local}/auth/login`)
      }, 2000)
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
        // Handle other errors
        setMessage({
          type: "error",
          text: error.message || "Failed to reset password. Please try again.",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d111a] p-4">
        <div className="w-full max-w-md space-y-6 p-6 bg-[#1a2334]/70 rounded-lg border border-gray-800 shadow-xl">
          <div className="text-center text-white">
            Verifying your reset link...
          </div>
        </div>
      </div>
    )
  }

  if (!isSessionValid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d111a] p-4">
        <div className="w-full max-w-md space-y-6 p-6 bg-[#1a2334]/70 rounded-lg border border-gray-800 shadow-xl">
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-bold text-white">Invalid or Expired Link</h1>
            <p className="text-gray-400">The password reset link is invalid or has expired.</p>
            <Button 
              className="bg-[#B4E90E] hover:bg-[#a3d40d] text-black font-medium"
              onClick={() => router.push(`/${local}/forgot-password`)}
            >
              Request New Reset Link
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d111a] p-4">
      <div className="w-full max-w-md space-y-6 p-6 bg-[#1a2334]/70 rounded-lg border border-gray-800 shadow-xl">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-white">Reset Your Password</h1>
          <p className="text-gray-400">Enter your new password below</p>
        </div>

        {message.text && (
          <div 
            className={`p-3 rounded ${
              message.type === "success" 
                ? "bg-green-500/10 border border-green-500 text-green-500" 
                : "bg-red-500/10 border border-red-500 text-red-500"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              New Password
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="bg-black/30 border-gray-700 text-white"
            />
            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#B4E90E] hover:bg-[#a3d40d] text-black font-medium disabled:opacity-50"
          >
            {isSubmitting ? "Resetting Password..." : "Reset Password"}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-400">
          <Link href={`/${local}/auth/login`} className="text-[#B4E90E] hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}