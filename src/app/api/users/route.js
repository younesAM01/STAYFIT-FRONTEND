import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongoDb/connect';
import User from '@/models/User';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

// Function to verify admin access
async function verifyAdminAccess(request) {
  try {
    const supabase = await createServerSupabaseClient();
    let session = null;

    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data } = await supabase.auth.getUser(token);
      if (data?.user) session = { user: data.user };
    }

    if (!session) {
      const { data: sessionData } = await supabase.auth.getSession();
      session = sessionData.session;
    }

    if (!session) {
      return { authorized: false, error: 'Unauthorized: Not logged in', status: 401 };
    }

    const currentSupabaseId = session.user.id;

    await connectMongoDB();
    const user = await User.findOne({ supabaseId: currentSupabaseId });

    if (!user) {
      return { authorized: false, error: 'User not found in DB', status: 404 };
    }

    const { searchParams } = new URL(request.url);
    const targetSupabaseId = searchParams.get('supabaseId');

    const isSelfAccess = targetSupabaseId === currentSupabaseId;

    if (user.role === 'admin' || user.role === 'super admin') {
      return { authorized: true, user };
    }

    if (user.role === 'client' && isSelfAccess) {
      return { authorized: true, user };
    }

    return {
      authorized: false,
      error: 'Unauthorized: Insufficient permissions',
      status: 403,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return { authorized: false, error: 'Authentication error', status: 500 };
  }
}


// Get all users - with admin role check
export async function GET(request) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const id = searchParams.get('id');

    if (id) {
      const user = await User.findById(id);
      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }
      return NextResponse.json(user, { status: 200 });
    }

    let query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query);
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Error fetching users", error: error.message }, { status: 500 });
  }
}



// Update a user by supabaseId
export async function PUT(request) {
  try {
    const authResult = await verifyAdminAccess(request);

    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectMongoDB();
    const body = await request.json();

    // Use supabaseId from query string, not body
    const { searchParams } = new URL(request.url);
    const supabaseId = searchParams.get('supabaseId');

    if (!supabaseId) {
      return NextResponse.json({ error: 'supabaseId is required' }, { status: 400 });
    }

    // Do not allow updating the supabaseId itself
    delete body.supabaseId;

    const updatedUser = await User.findOneAndUpdate({ supabaseId }, body, { new: true });

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function DELETE(request) {
  try {
    // Create Supabase client
    const supabase = await createServerSupabaseClient();
    let session = null;

    // Check for Bearer token (e.g., Postman)
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data } = await supabase.auth.getUser(token);
      if (data?.user) session = { user: data.user };
    }

    // Otherwise, get from cookies
    if (!session) {
      const { data: sessionData } = await supabase.auth.getSession();
      session = sessionData.session;
    }

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Not logged in' }, { status: 401 });
    }

    const currentSupabaseId = session.user.id;
    await connectMongoDB();

    const currentUser = await User.findOne({ supabaseId: currentSupabaseId });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const targetSupabaseId = searchParams.get('supabaseId');

    if (!targetSupabaseId) {
      return NextResponse.json({ error: 'supabaseId is required' }, { status: 400 });
    }

    // Clients can only delete their own account
    const isClientTryingAnotherUser = currentUser.role === 'client' && targetSupabaseId !== currentSupabaseId;
    const isNotAuthorized = isClientTryingAnotherUser && currentUser.role !== 'admin' && currentUser.role !== 'super admin';

    if (isNotAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: Insufficient permissions' }, { status: 403 });
    }

    // Delete from MongoDB
    const deletedUser = await User.findOneAndDelete({ supabaseId: targetSupabaseId });
    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete from Supabase Auth (admin only)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(targetSupabaseId);
    if (deleteAuthError) {
      return NextResponse.json({
        warning: 'Deleted from MongoDB but failed to delete from Supabase',
        error: deleteAuthError.message
      }, { status: 207 }); // Multi-Status
    }

    return NextResponse.json({ message: 'User deleted successfully from both MongoDB and Supabase' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
