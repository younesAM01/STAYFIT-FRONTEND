import connectMongoDB from '@/lib/mongoDb/connect';
import Reviews from '@/models/Reviews';
import { NextResponse } from "next/server";

// Get single review by ID
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        await connectMongoDB();

        if (id) {
            const review = await Review.findById(id);
            if (!review) {
                return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: review });
        }

        // Get all reviews
        const reviews = await Review.find({});
        return NextResponse.json({ success: true, data: reviews });
    } catch (error) {
        console.error('Error fetching review(s):', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST route to create a new review
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, trainerName, quote, rating, image } = body;

        if (!name || !trainerName || !quote || !rating || !image) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        await connectMongoDB();
        
        const newReview = await Review.create({ name, trainerName, quote, rating, image });
        return NextResponse.json({ success: true, data: "created successfully" });

    } catch (error) {
        console.error('Error adding review:', error);
        
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern)[0];
            return NextResponse.json({ 
                success: false, 
                error: `A review with this ${duplicateField} already exists` 
            }, { status: 409 });
        }

        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT route to update a review
export async function PUT(request) {
    try {
        const body = await request.json();
        const { name, trainerName, quote, rating, image } = body;

        await connectMongoDB();

        const updateFields = {};
        if (name) updateFields.name = name;
        if (trainerName) updateFields.trainerName = trainerName;
        if (quote) updateFields.quote = quote;
        if (rating) updateFields.rating = rating;
        if (image) updateFields.image = image;

        if (Object.keys(updateFields).length === 0) {
            return NextResponse.json({ 
                success: false, 
                error: "No fields provided to update" 
            }, { status: 400 });
        }

        const { searchParams } = new URL(request.url);
        const reviewId = searchParams.get('id');

        const updatedReview = await Review.findByIdAndUpdate(
            reviewId,
            updateFields,
            { new: true }
        );

        if (!updatedReview) {
            return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: "updated successfully" });
    } catch (error) {
        console.error('Error updating review:', error);
        
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern)[0];
            return NextResponse.json({ 
                success: false, 
                error: `A review with this ${duplicateField} already exists` 
            }, { status: 409 });
        }

        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE route to remove a review
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: "Review ID is required" }, { status: 400 });
        }

        await connectMongoDB();
        
        const deletedReview = await Review.findByIdAndDelete(id);

        if (!deletedReview) {
            return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: "deleted successfully" });
    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}