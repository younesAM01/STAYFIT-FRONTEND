'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server';
import connectMongoDB from '@/lib/mongoDb/connect';
import User from '@/models/User';

export async function registerUser(data) {
  try {
    const supabase = await createServerSupabaseClient()
    
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
      supabaseId: authData.user.id,
      role: 'client'
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

export async function getUser(id) {
  try {
    await connectMongoDB()
    const mongoUser = await User.findOne({ supabaseId: id })
    
    if (!mongoUser) {
      throw new Error('User not found in database')
    }
 
    // Return success response with plain object
    return {   
      role: mongoUser.role
    }
  } catch (error) {
    console.error('Get User error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'failed Get User' 
    }
  }
}

export async function createGoogleUser(userData) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the current user to verify the request
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.id !== userData.supabaseId) {
      throw new Error('Unauthorized')
    }
    
    // Connect to MongoDB
    await connectMongoDB()
    
    // Check if user already exists in MongoDB
    let mongoUser = await User.findOne({ supabaseId: userData.supabaseId })
    
    if (!mongoUser) {
      // Create new user in MongoDB with Google data
      mongoUser = await User.create({
        email: userData.email,
        supabaseId: userData.supabaseId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        provider: userData.provider,
        role: "client" // Assign "client" role
      })
    }
    
    // Convert Mongoose document to plain object
    const userObject = mongoUser.toJSON ? mongoUser.toJSON() : JSON.parse(JSON.stringify(mongoUser))
    
    return { 
      success: true,
      mongoUser: userObject
    }
  } catch (error) {
    console.error('Google user creation error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'User creation failed' 
    }
  }
} 


// In your actions.js file, add this function:
export async function handleOAuthUser(userId) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get user data from Supabase using getUser instead of admin API
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) throw new Error(error.message)
    
    // Connect to MongoDB
    await connectMongoDB()
    
    // Check if user already exists in MongoDB
    let mongoUser = await User.findOne({ supabaseId: user.id })
    
    if (!mongoUser) {
      // Create new user in MongoDB with Google data
      const userData = {
        email: user.email,
        supabaseId: user.id,
        firstName: user.user_metadata?.given_name || user.user_metadata?.name?.split(' ')[0] || '',
        lastName: user.user_metadata?.family_name || user.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
        provider: 'google',
        role: "client" // Assign "client" role
      }
      
      mongoUser = await User.create(userData)
    }
    
    // Convert Mongoose document to plain object
    const userObject = mongoUser.toJSON ? mongoUser.toJSON() : JSON.parse(JSON.stringify(mongoUser))
    
    return { 
      success: true,
      mongoUser: userObject
    }
  } catch (error) {
    console.error('OAuth user handling error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process OAuth user' 
    }
  }
}