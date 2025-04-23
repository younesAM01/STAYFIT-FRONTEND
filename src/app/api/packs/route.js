import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDb/connect";
import Pack from "@/models/Pack";


export async function GET(request) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (id) {
      const pack = await Pack.findById(id);
      if (!pack) {
        return NextResponse.json({ error: "Pack not found" }, { status: 404 });
      
      }
      return NextResponse.json(pack);
    }

    const packs = await Pack.find();
    if (!packs || packs.length === 0) {
      console.error("No packs found in the database.");
      console.error("No packs found in the database.");
    }
    return NextResponse.json(packs);
  } catch (error) {
    console.error("Error fetching packs:", error);
    return NextResponse.json(
      { error: "Failed to fetch packs" },
      { status: 500 }
    );

  }
}

export async function POST(request) {
  try {
    await connectMongoDB();

    const body = await request.json();

    // Validate required fields
    if (
      !body.startPrice ||
      !body.category ||
      !body.sessions ||
      !body.features
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new pack
    const newPack = await Pack.create(body);

    return NextResponse.json(newPack, { status: 201 });
  } catch (error) {
    console.error("Error creating pack:", error);
    return NextResponse.json(
      { error: "Failed to create pack", details: error.message },
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
        { error: "Pack ID is required" },
        { status: 400 }
      );
    }

    const deletedPack = await Pack.findByIdAndDelete(id);

    if (!deletedPack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Pack deleted successfully", deletedPack },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting pack:", error);
    return NextResponse.json(
      { error: "Failed to delete pack", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Pack ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const updatedPack = await Pack.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedPack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    return NextResponse.json(updatedPack);
  } catch (error) {
    console.error("Error updating pack:", error);
    return NextResponse.json(
      { error: "Failed to update pack", details: error.message },
      { status: 500 }
    );

  }
}
