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
        const { title, description, imageUrl, image } = body;
        
        // Support for both imageUrl and image field names
        const imageValue = imageUrl || image;

        // Basic validation - image is required
        if (!imageValue) {
            return NextResponse.json({ success: false, error: "Image URL is required" }, { status: 400 });
        }

        // Create a data object with default empty values
        const serviceData = {
            title: { en: "", ar: "" },
            description: { en: "", ar: "" },
            image: imageValue
        };

        // Handle title in different formats
        if (title) {
            if (typeof title === 'object') {
                if (title.en) serviceData.title.en = title.en;
                if (title.ar) serviceData.title.ar = title.ar;
            } else if (typeof title === 'string') {
                // Default to English if string is provided without language specification
                serviceData.title.en = title;
            }
        }

        // Handle description in different formats
        if (description) {
            if (typeof description === 'object') {
                if (description.en) serviceData.description.en = description.en;
                if (description.ar) serviceData.description.ar = description.ar;
            } else if (typeof description === 'string') {
                // Default to English if string is provided without language specification
                serviceData.description.en = description;
            }
        }

        await connectMongoDB();
        
        try {
            const newService = await Services.create(serviceData);
            return NextResponse.json({ 
                success: true, 
                data: "Service created successfully",
                service: newService
            });
        } catch (validationError) {
            console.error('Validation error:', validationError);
            return NextResponse.json({ 
                success: false, 
                error: "Validation error: " + validationError.message 
            }, { status: 400 });
        }

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

        return NextResponse.json({ success: true, data: "Service updated successfully" });
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

        return NextResponse.json({ success: true, data: " service deleted successfully" });
    } catch (error) {
        console.error('Error deleting service:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}