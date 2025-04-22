// api/client-pack
import { NextResponse } from 'next/server';
import connectMongoDB from "@/lib/mongoDb/connect";
import ClientPack from "@/models/ClientPack";
import Pack from '@/models/Pack';

export async function POST(request) {
  try {
    await connectMongoDB();
    const body = await request.json();
    const newSession = await ClientPack.create(body);
    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating session", error }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const id = searchParams.get('id');


    
    if (id) {
      const clientPack = await ClientPack.findById(id).populate('pack');
      if (!clientPack) {
        return NextResponse.json({ message: "Client pack not found" }, { status: 404 });
      }
      return NextResponse.json(clientPack, { status: 200 });
    }

    if (clientId) {
      const clientPacks = await ClientPack.find({ client: clientId }).populate('pack');
      return NextResponse.json(clientPacks, { status: 200 });
    }

    const clientPacks = await ClientPack.find().populate('pack');
    return NextResponse.json(clientPacks, { status: 200 });
  } catch (error) {
    console.error("Error fetching client packs:", error);
    return NextResponse.json({ message: "Error fetching client packs", error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const updatedSession = await ClientPack.findByIdAndUpdate(id, body, { new: true });
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const deletedSession = await ClientPack.findByIdAndDelete(id);
    if (!deletedSession) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Session deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting session", error }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const updatedSession = await ClientPack.findByIdAndUpdate(id, body, { new: true });
    if (!updatedSession) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }
    return NextResponse.json(updatedSession, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error updating session", error }, { status: 500 });
  }
}
