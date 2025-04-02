import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongoDb/connect';
import User from '@/models/User';

// Get all users
export async function GET(request) {
    try {
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

// Add a new user
export async function POST(request) {
    try {
        await connectMongoDB();
        const body = await request.json();
        const newUser = await User.create(body);
        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Update a user by supabaseId
export async function PUT(request) {
    try {
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
        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
    