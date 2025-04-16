'use server'

import { supabase } from '@/lib/supabase/client'
import connectMongoDB from '@/lib/mongoDb/connect'
import User from '@/models/User'
import { cookies } from 'next/headers'

export async function registerUser(data) {
  try {
    // Supabase Authentication
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })

    if (authError) {
      throw new Error(authError.message)
    }

    // Ensure we have a user ID from Supabase
    if (!authData.user) {
      throw new Error('User creation failed')
    }

    // Connect to MongoDB
    await connectMongoDB()

    // Create User in MongoDB
    const newUser = await User.create({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      supabaseId: authData.user.id
    })

    // Set authentication cookies (optional)
    // const cookieStore = cookies()
    // cookieStore.set('user-token', authData.session?.access_token || '', {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    //   maxAge: 60 * 60 * 24 * 7 // 1 week
    // })

    return { 
      success: true, 
      userId: newUser._id.toString() // Convert userId to a string
    }
  } catch (error) {
    console.error('Registration error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Registration failed' 
    }
  }
}