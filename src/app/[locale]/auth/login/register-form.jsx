"use client"

import React, { useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerUser } from "../actions"
import { useRouter } from "next/navigation"

const registerSchema = z
  .object({
    firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
    lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export function RegisterForm({ onToggle }) {
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGlobalError(null)
    setIsSubmitting(true)

    try {
      // Validate form data
      const validatedData = registerSchema.parse({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      })

      // Prepare data for registration
      const registrationData = {
        email: validatedData.email,
        password: validatedData.password,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName
      }

      // Call server action to register user
      const result = await registerUser(registrationData)

      if (result.success) {
        onToggle() // Switch to login form
      } else {
        // Set error from server response
        setGlobalError(result.error || 'Registration failed')
      }
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
        setGlobalError(error instanceof Error ? error.message : 'An unexpected error occurred')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-white">Create an account</h1>
        <p className="text-gray-400">Enter your information to get started</p>
      </div>

      {globalError && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-white">
              First name
            </Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="John"
              value={formData.firstName}
              onChange={handleChange}
              className="bg-black/30 border-gray-700 text-white"
            />
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-white">
              Last name
            </Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange}
              className="bg-black/30 border-gray-700 text-white"
            />
            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            Email
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
            Password
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
            Confirm Password
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
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <button type="button" onClick={onToggle} className="text-[#B4E90E] hover:underline font-medium">
          Sign in
        </button>
      </div>
    </div>
  )
}