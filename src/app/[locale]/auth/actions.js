'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server';
import connectMongoDB from '@/lib/mongoDb/connect';
import User from '@/models/User';

export async function registerUser(data) {
  try {
    const supabase = createServerSupabaseClient()
    
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

    return { 
      success: true, 
      userId: newUser._id.toString()
    }
  } catch (error) {
    console.error('Registration error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Registration failed' 
    }
  }
}

export async function loginUser(data) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Supabase Authentication
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (authError) {
      throw new Error(authError.message)
    }

    // Return success response
    return { 
      success: true, 
      user: authData.user 
    }
  } catch (error) {
    console.error('Login error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Login failed' 
    }
  }
}