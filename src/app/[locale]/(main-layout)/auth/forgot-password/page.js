"use client"

import React, { useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { useLocale } from "use-intl"

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const router = useRouter()
  const local = useLocale()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setMessage({ type: "", text: "" })
    setIsSubmitting(true)

    try {
      // Validate email
      const validatedData = forgotPasswordSchema.parse({ email })

      // Send password reset email via Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
        redirectTo: `${window.location.origin}/${local}/auth/reset-password`,
      })

      if (error) {
        throw new Error(error.message)
      }

      // Show success message
      setMessage({
        type: "success",
        text: "Password reset link has been sent to your email address",
      })
      
      // Clear the email field
      setEmail("")
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
        // Handle other errors but still show success message for security
        console.error(error)
        setMessage({
          type: "success",
          text: "If an account exists with this email, a password reset link has been sent",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d111a] p-4">
      <div className="w-full max-w-md space-y-6 p-6 bg-[#1a2334]/70 rounded-lg border border-gray-800 shadow-xl">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-white">Forgot your password?</h1>
          <p className="text-gray-400">Enter your email and we&#39;ll send you a reset link</p>
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
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/30 border-gray-700 text-white"
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#B4E90E] hover:bg-[#a3d40d] text-black font-medium disabled:opacity-50"
          >
            {isSubmitting ? "Sending link..." : "Send Reset Link"}
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