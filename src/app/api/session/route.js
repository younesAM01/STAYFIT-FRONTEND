import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDb/connect";
import Session from "@/models/Session";
import Pack from "@/models/Pack";
import ClientPack from "@/models/ClientPack";

export async function POST(request) {
  try {
    await connectMongoDB();
    const body = await request.json();

    // Check if this session is associated with a client pack
    if (body.packId) {
      const clientPack = await ClientPack.findById(body.packId);

      // Validate the client pack exists and is active with remaining sessions
      if (!clientPack) {
        return NextResponse.json(
          { message: "Client pack not found" },
          { status: 404 }
        );
      }

      if (!clientPack.isActive) {
        return NextResponse.json(
          { message: "This package is no longer active" },
          { status: 400 }
        );
      }

      if (clientPack.remainingSessions <= 0) {
        return NextResponse.json(
          { message: "No remaining sessions in this package" },
          { status: 400 }
        );
      }

      // Create the session after validation
      const newSession = await Session.create(body);

      // Update the client pack - decrement remaining sessions
      const newRemainingSessionsCount = clientPack.remainingSessions - 1;
      const updateData = { remainingSessions: newRemainingSessionsCount };

      // If this was the last session, set isActive to false
      if (newRemainingSessionsCount === 0) {
        updateData.isActive = false;
      }

      await ClientPack.findByIdAndUpdate(body.packId, updateData);

      return NextResponse.json(newSession, { status: 201 });
    } else {
      // Regular session without a pack
      const newSession = await Session.create(body);
      return NextResponse.json(newSession, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating session", error },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");
    const clientId = searchParams.get("clientId");
    const coachId = searchParams.get("coachId");

    // Get session by _id
    if (id) {
      const session = await Session.findById(id);
      if (!session) {
        return NextResponse.json(
          { message: "Session not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(session, { status: 200 });
    }

    // Get sessions by client ID
    if (clientId) {
      const sessions = await Session.find({ client: clientId }).populate(
        "coach"
      );
      return NextResponse.json(sessions, { status: 200 });
    }

    // Get sessions by coach ID
    if (coachId) {
      const sessions = await Session.find({ coach: coachId })
        .populate("client")
        .populate("pack");
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
    const id = searchParams.get("id");
    const body = await request.json();

    // Get the session before update to check its original status
    const originalSession = await Session.findById(id);

    const updatedSession = await Session.findByIdAndUpdate(id, body, {
      new: true,
    });
    if (!updatedSession) {
      return NextResponse.json(
        { message: "Session not found" },
        { status: 404 }
      );
    }

    // If the session is associated with a client pack and status has changed
    if (
      updatedSession.packId &&
      originalSession &&
      (originalSession.status !== updatedSession.status ||
       originalSession.sessionStatus !== updatedSession.sessionStatus)
    ) {
      // If session was cancelled or completed, or finished, we may need to update the pack
      if (
        updatedSession.status === "cancelled" ||
        updatedSession.status === "completed" ||
        updatedSession.sessionStatus === "finished"
      ) {
        const clientPack = await ClientPack.findById(updatedSession.packId);

        if (clientPack) {
          // If this was the last session and it's been completed/finished, update isActive
          if (clientPack.remainingSessions === 0) {
            await ClientPack.findByIdAndUpdate(updatedSession.packId, {
              isActive: false,
            });
          }
        }
      }
    }

    return NextResponse.json(updatedSession, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating session", error },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { message: "Session ID is required" },
        { status: 400 }
      );
    }

    const deletedSession = await Session.findByIdAndDelete(id);
    if (!deletedSession) {
      return NextResponse.json(
        { message: "Session not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Session deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting session", error: error.message },
      { status: 500 }
    );
  }
}
