import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongoDb/connect';
import User from '@/models/User';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

// Function to verify admin access
async function verifyAdminAccess(request) {
  try {
    // Create a Supabase client using server components
    const supabase = await createServerSupabaseClient();
    let session = null;
    
    // First check for Authorization header (for API testing)
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data, error } = await supabase.auth.getUser(token);
      
      if (data?.user) {
        // Create a session-like object from the token data
        session = { user: data.user };
      }
    }
    
 // If no session from Bearer token, try getting from cookies
 if (!session) {
    const { data: sessionData } = await supabase.auth.getSession();
    session = sessionData.session;
  }
    // If no session, user is not logged in
    if (!session) {
      return { 
        authorized: false, 
        error: 'Unauthorized: Not logged in',
        status: 401 
      };
    }

    // Get user ID from session
    const userId = session.user.id;

    // Connect to MongoDB and find the user
    await connectMongoDB();
    const user = await User.findOne({ supabaseId: userId });

    // Check if user exists and has appropriate role
    if (!user) {
      return { 
        authorized: false, 
        error: 'User not found in database',
        status: 404 
      };
    }

    // Check if user has admin or super admin role
    if (user.role !== 'admin' && user.role !== 'super admin') {
      return { 
        authorized: false, 
        error: 'Unauthorized: Insufficient permissions',
        status: 403 
      };
    }

    // User is authorized
    return { authorized: true, user };
  } catch (error) {
    console.error('Authentication error:', error);
    return { 
      authorized: false, 
      error: 'Authentication error',
      status: 500 
    };
  }
}

// Get all users - with admin role check
export async function GET(request) {
    try {
        // Verify if the user has admin access
        const authResult = await verifyAdminAccess(request);
        
        if (!authResult.authorized) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }
        
        // User is authenticated and has proper permissions, proceed with the request
        await connectMongoDB();
        const { searchParams } = new URL(request.url);
        const supabaseId = searchParams.get('supabaseId');
        
        if (supabaseId) {
            const user = await User.findOne({ supabaseId });
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
            return NextResponse.json(user);
        }

        const users = await User.find();
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


// Update a user by supabaseId
export async function PUT(request) {
    try {
         // Verify if the user has admin access
         const authResult = await verifyAdminAccess(request);
        
         if (!authResult.authorized) {
             return NextResponse.json({ error: authResult.error }, { status: authResult.status });
         }

        await connectMongoDB();
        const body = await request.json();
        const { supabaseId, ...updates } = body;
        const updatedUser = await User.findOneAndUpdate({ supabaseId }, updates, { new: true });
        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json(updatedUser);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Delete a user by supabaseId
export async function DELETE(request) {
    try {
         // Verify if the user has admin access
         const authResult = await verifyAdminAccess(request);
        
         if (!authResult.authorized) {
             return NextResponse.json({ error: authResult.error }, { status: authResult.status });
         }

          // Initialize Supabase client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY // Important: Use service role key for admin operations
        );

         
        await connectMongoDB();
        const { searchParams } = new URL(request.url);
        const supabaseId = searchParams.get('supabaseId');
        if (!supabaseId) {
            return NextResponse.json({ error: 'supabaseId is required' }, { status: 400 });
        }
        const deletedUser = await User.findOneAndDelete({ supabaseId });
        if (!deletedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        // Delete user from Supabase
        const { error } = await supabase.auth.admin.deleteUser(supabaseId);
        
        if (error) {
            // If Supabase deletion fails, return the error but note that MongoDB deletion succeeded
            return NextResponse.json({ 
                warning: 'User deleted from MongoDB but failed to delete from Supabase',
                error: error.message 
            }, { status: 207 }); // 207 Multi-Status
        }
        return NextResponse.json({ message: 'User deleted successfully from both MongoDB and Supabase' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
    