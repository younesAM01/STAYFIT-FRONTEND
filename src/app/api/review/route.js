import connectMongoDB from '@/lib/mongoDb/connect';
import Review from '@/models/Reviews';
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

        // Basic validation - at least some text content and required fields
        if (!rating || !image) {
            return NextResponse.json({ success: false, error: "Rating and image are required fields" }, { status: 400 });
        }

        // Create a data object with default empty values
        const reviewData = {
            name: { en: "", ar: "" },
            trainerName: { en: "", ar: "" },
            quote: { en: "", ar: "" },
            rating,
            image
        };

        // Handle name in different formats
        if (name) {
            if (typeof name === 'object') {
                if (name.en) reviewData.name.en = name.en;
                if (name.ar) reviewData.name.ar = name.ar;
            } else if (typeof name === 'string') {
                // Default to English if string is provided without language specification
                reviewData.name.en = name;
            }
        }

        // Handle trainerName in different formats
        if (trainerName) {
            if (typeof trainerName === 'object') {
                if (trainerName.en) reviewData.trainerName.en = trainerName.en;
                if (trainerName.ar) reviewData.trainerName.ar = trainerName.ar;
            } else if (typeof trainerName === 'string') {
                // Default to English if string is provided without language specification
                reviewData.trainerName.en = trainerName;
            }
        }

        // Handle quote in different formats
        if (quote) {
            if (typeof quote === 'object') {
                if (quote.en) reviewData.quote.en = quote.en;
                if (quote.ar) reviewData.quote.ar = quote.ar;
            } else if (typeof quote === 'string') {
                // Default to English if string is provided without language specification
                reviewData.quote.en = quote;
            }
        }

        await connectMongoDB();
        
        try {
            const newReview = await Review.create(reviewData);
            return NextResponse.json({ success: true, data: "Review created successfully" });
        } catch (validationError) {
            console.error('Validation error:', validationError);
            return NextResponse.json({ 
                success: false, 
                error: "Validation error: " + validationError.message 
            }, { status: 400 });
        }

    } catch (error) {
        
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
        
        // Handle multilingual fields
        if (name) {
            if (typeof name === 'object') {
                updateFields.name = {};
                if (name.en) updateFields.name.en = name.en;
                if (name.ar) updateFields.name.ar = name.ar;
            }
        }
        
        if (trainerName) {
            if (typeof trainerName === 'object') {
                updateFields.trainerName = {};
                if (trainerName.en) updateFields.trainerName.en = trainerName.en;
                if (trainerName.ar) updateFields.trainerName.ar = trainerName.ar;
            }
        }
        
        if (quote) {
            if (typeof quote === 'object') {
                updateFields.quote = {};
                if (quote.en) updateFields.quote.en = quote.en;
                if (quote.ar) updateFields.quote.ar = quote.ar;
            }
        }
        
        if (rating !== undefined) updateFields.rating = rating;
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

        return NextResponse.json({ success: true, data: "Review updated successfully" });
    } catch (error) {
        
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

        return NextResponse.json({ success: true, data: "Review deleted successfully" });
    } catch (error) {
    }
}