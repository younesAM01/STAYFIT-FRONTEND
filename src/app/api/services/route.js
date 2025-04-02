import connectMongoDB from '@/lib/mongoDb/connect';
import Services from "@/models/services";
import { NextResponse } from "next/server";

// Get single service by ID
// Get all services or single service by ID
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        await connectMongoDB();

        // If ID is provided, return single service
        if (id) {
            const service = await Services.findById(id);
            if (!service) {
                return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: service });
        }

        // If no ID provided, return all services
        const services = await Services.find({});
        return NextResponse.json({ success: true, data: services });
    } catch (error) {
        console.error('Error fetching service(s):', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// Get all services


// POST route to create a new service
export async function POST(request) {
    try {
        const body = await request.json();
        const { title, description, imageUrl } = body;

        if (!title || !description || !imageUrl) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        await connectMongoDB();
        
        const newService = await Services.create({ title, description, image: imageUrl });
        return NextResponse.json({ success: true, data: newService });

    } catch (error) {
        console.error('Error adding service:', error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern)[0];
            return NextResponse.json({ 
                success: false, 
                error: `A service with this ${duplicateField} already exists` 
            }, { status: 409 });
        }

        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT route to update a service
export async function PUT(request) {
    try {
        const body = await request.json();
        const {  title, description, imageUrl } = body;

        await connectMongoDB();

        // Only update fields that are provided
        const updateFields = {};
        if (title) updateFields.title = title;
        if (description) updateFields.description = description; 
        if (imageUrl) updateFields.image = imageUrl;

        // If no fields to update, return error
        if (Object.keys(updateFields).length === 0) {
            return NextResponse.json({ 
                success: false, 
                error: "No fields provided to update" 
            }, { status: 400 });
        }

        // Get ID from URL params instead of body
        const { searchParams } = new URL(request.url);
        const serviceId = searchParams.get('id');

        const updatedService = await Services.findByIdAndUpdate(
            serviceId,
            updateFields,
            { new: true }
        );

        if (!updatedService) {
            return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedService });
    } catch (error) {
        console.error('Error updating service:', error);
        
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern)[0];
            return NextResponse.json({ 
                success: false, 
                error: `A service with this ${duplicateField} already exists` 
            }, { status: 409 });
        }

        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE route to remove a service
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: "Service ID is required" }, { status: 400 });
        }

        await connectMongoDB();
        
        const deletedService = await Services.findByIdAndDelete(id);

        if (!deletedService) {
            return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: deletedService });
    } catch (error) {
        console.error('Error deleting service:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}