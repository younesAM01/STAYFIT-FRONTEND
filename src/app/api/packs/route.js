import connectMongoDB from '@/lib/mongoDb/connect';
import Packs from "@/models/packs";
import { NextResponse } from "next/server";

// Get single packs by ID
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        await connectMongoDB();

        if (id) {
            const pack = await Packs.findById(id);
            if (!pack) {
                return NextResponse.json({ success: false, error: "Pack not found" }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: pack });
        }
// Get all packs

        const packs = await Packs.find({});
        return NextResponse.json({ success: true, data: packs });
    } catch (error) {
        console.error('Error fetching pack(s):', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST route to create a new pack
export async function POST(request) {
    try {
        const body = await request.json();
        const { title, description, price } = body;

        if (!title || !description || !price) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        await connectMongoDB();
        
        const newPack = await Packs.create({ title, description, price });
        return NextResponse.json({ success: true, data: newPack });

    } catch (error) {
        console.error('Error adding pack:', error);
        
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern)[0];
            return NextResponse.json({ 
                success: false, 
                error: `A pack with this ${duplicateField} already exists` 
            }, { status: 409 });
        }

        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT route to update a pack
export async function PUT(request) {
    try {
        const body = await request.json();
        const { title, description, price } = body;

        await connectMongoDB();

        const updateFields = {};
        if (title) updateFields.title = title;
        if (description) updateFields.description = description;
        if (price) updateFields.price = price;

        if (Object.keys(updateFields).length === 0) {
            return NextResponse.json({ 
                success: false, 
                error: "No fields provided to update" 
            }, { status: 400 });
        }

        const { searchParams } = new URL(request.url);
        const packId = searchParams.get('id');

        const updatedPack = await Packs.findByIdAndUpdate(
            packId,
            updateFields,
            { new: true }
        );

        if (!updatedPack) {
            return NextResponse.json({ success: false, error: "Pack not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedPack });
    } catch (error) {
        console.error('Error updating pack:', error);
        
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern)[0];
            return NextResponse.json({ 
                success: false, 
                error: `A pack with this ${duplicateField} already exists` 
            }, { status: 409 });
        }

        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE route to remove a pack
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: "Pack ID is required" }, { status: 400 });
        }

        await connectMongoDB();
        
        const deletedPack = await Packs.findByIdAndDelete(id);

        if (!deletedPack) {
            return NextResponse.json({ success: false, error: "Pack not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: deletedPack });
    } catch (error) {
        console.error('Error deleting pack:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}