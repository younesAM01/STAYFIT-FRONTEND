import connectMongoDB from '@/lib/mongoDb/connect';
import Review from '@/models/Reviews';
import User from '@/models/User';
import { NextResponse } from "next/server";

// Get single review by ID
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        await connectMongoDB();

        if (id) {
            const review = await Review.findById(id)
                .populate({
                    path: 'userId',
                    select: 'firstName lastName profilePic'
                })
                .populate({
                    path: 'coachId',
                    select: 'firstName lastName profilePic'
                });
            if (!review) {
                return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: review });
        }

        // Get all reviews with populated user and coach data
        const reviews = await Review.find({})
            .populate({
                path: 'userId',
                select: 'firstName lastName profilePic'
            })
            .populate({
                path: 'coachId',
                select: 'firstName lastName profilePic'
            })
            .sort({ createdAt: -1 }); // Sort by newest first
            
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
        const { quote, rating, userId, coachId } = body;

        // Basic validation - only rating, userId, and coachId are required
        if (!rating || !userId || !coachId) {
            return NextResponse.json({ success: false, error: "Rating, user ID, and coach ID are required fields" }, { status: 400 });
        }

        await connectMongoDB();

        // Fetch user and coach data
        const user = await User.findById(userId);
        const coach = await User.findById(coachId);

        if (!user || !coach) {
            return NextResponse.json({ success: false, error: "User or coach not found" }, { status: 404 });
        }

        // Create a data object with default empty values
        const reviewData = {
            name: body.name || {
                en: `${user.firstName} ${user.lastName}`,
                ar: `${user.firstName} ${user.lastName}`
            },
            trainerName: body.trainerName || {
                en: `${coach.firstName} ${coach.lastName}`,
                ar: `${coach.firstName} ${coach.lastName}`
            },
            quote: { en: "", ar: "" },
            rating,
            image: body.image || user.profilePic || user.profilePicture || 'https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg',
            userId,
            coachId
        };

        // Handle quote if provided
        if (quote) {
            if (typeof quote === 'object') {
                if (quote.en) reviewData.quote.en = quote.en;
                if (quote.ar) reviewData.quote.ar = quote.ar;
            } else if (typeof quote === 'string') {
                reviewData.quote.en = quote;
            }
        }

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