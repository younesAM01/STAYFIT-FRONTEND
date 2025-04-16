import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongoDb/connect';
import Session from '@/models/Session';
import Pack from '@/models/Pack';



export async function POST(request) {
  try {
    await connectMongoDB();
    const body = await request.json();
    const newSession = await Session.create(body);
    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating session", error }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(request.url);

    const id = searchParams.get('id');
    const clientId = searchParams.get('clientId');
    const coachId = searchParams.get('coachId');

    // Get session by _id
    if (id) {
      const session = await Session.findById(id);
      if (!session) {
        return NextResponse.json({ message: "Session not found" }, { status: 404 });
      }
      return NextResponse.json(session, { status: 200 });
    }

    // Get sessions by client ID
    if (clientId) {
      const sessions = await Session.find({ client: clientId }).populate('coach');
      return NextResponse.json(sessions, { status: 200 });
    }

    // Get sessions by coach ID
    if (coachId) {
      const sessions = await Session.find({ coach: coachId }).populate('client').populate('pack');
      return NextResponse.json(sessions, { status: 200 });
    }

    // Get all sessions
    const sessions = await Session.find();
    return NextResponse.json(sessions, { status: 200 });
  } catch (error) {
    console.error("Error fetching sessions:", error); // Add this
    return NextResponse.json(
      { message: "Error fetching sessions", error: error.message },
      { status: 500 }
    );
  }
  
}


export async function PUT(request) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const updatedSession = await Session.findByIdAndUpdate(id, body, { new: true });
    if (!updatedSession) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }
    return NextResponse.json(updatedSession, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error updating session", error }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectMongoDB();
    const { id } = request.query;
    const deletedSession = await Session.findByIdAndDelete(id);
    if (!deletedSession) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Session deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting session", error }, { status: 500 });
  }
}
