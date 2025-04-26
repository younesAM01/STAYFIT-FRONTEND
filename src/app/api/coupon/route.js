import connectMongoDB from '@/lib/mongoDb/connect';
import Coupon from "@/models/coupon";
import { NextResponse } from "next/server";

// Get all coupons or single coupon by ID
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        await connectMongoDB();

        // If ID is provided, return single coupon
        if (id) {
            const coupon = await Coupon.findById(id);
            if (!coupon) {
                return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: coupon });
        }

        // If no ID provided, return all coupons
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        
        // Update status of expired coupons
        const updatedCoupons = coupons.map(coupon => {
            if (coupon.expiryDate < new Date() && coupon.status !== 'expired') {
                coupon.status = 'expired';
                coupon.save();
            }
            return coupon;
        });

        return NextResponse.json({ success: true, data: updatedCoupons });
    } catch (error) {
        console.error('Error fetching coupon(s):', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST route to create a new coupon
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, percentage, expiryDate } = body;

        // Basic validation
        if (!name || percentage === undefined || !expiryDate) {
            return NextResponse.json({ 
                success: false, 
                error: "Name, percentage, and expiry date are required" 
            }, { status: 400 });
        }

        // Validate percentage range
        if (percentage < 0 || percentage > 100) {
            return NextResponse.json({ 
                success: false, 
                error: "Percentage must be between 0 and 100" 
            }, { status: 400 });
        }

        // Validate expiry date
        const expiryDateObj = new Date(expiryDate);
        if (isNaN(expiryDateObj.getTime())) {
            return NextResponse.json({ 
                success: false, 
                error: "Invalid expiry date" 
            }, { status: 400 });
        }

        await connectMongoDB();
        
        try {
            const newCoupon = await Coupon.create({
                name,
                percentage,
                expiryDate: expiryDateObj,
                status: expiryDateObj < new Date() ? 'expired' : 'active'
            });
            
            return NextResponse.json({ 
                success: true, 
                data: "Coupon created successfully",
                coupon: newCoupon
            });
        } catch (validationError) {
            console.error('Validation error:', validationError);
            return NextResponse.json({ 
                success: false, 
                error: "Validation error: " + validationError.message 
            }, { status: 400 });
        }

    } catch (error) {
        console.error('Error adding coupon:', error);
        
        if (error.code === 11000) {
            return NextResponse.json({ 
                success: false, 
                error: "A coupon with this name already exists" 
            }, { status: 409 });
        }

        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT route to update a coupon
export async function PUT(request) {
    try {
        const body = await request.json();
        const { name, percentage, expiryDate, status } = body;

        await connectMongoDB();

        // Only update fields that are provided
        const updateFields = {};
        if (name) updateFields.name = name;
        if (percentage !== undefined) {
            // Validate percentage range
            if (percentage < 0 || percentage > 100) {
                return NextResponse.json({ 
                    success: false, 
                    error: "Percentage must be between 0 and 100" 
                }, { status: 400 });
            }
            updateFields.percentage = percentage;
        }
        if (expiryDate) {
            // Validate expiry date
            const expiryDateObj = new Date(expiryDate);
            if (isNaN(expiryDateObj.getTime())) {
                return NextResponse.json({ 
                    success: false, 
                    error: "Invalid expiry date" 
                }, { status: 400 });
            }
            updateFields.expiryDate = expiryDateObj;
            // Update status based on new expiry date
            updateFields.status = expiryDateObj < new Date() ? 'expired' : 'active';
        }

        // If no fields to update, return error
        if (Object.keys(updateFields).length === 0) {
            return NextResponse.json({ 
                success: false, 
                error: "No fields provided to update" 
            }, { status: 400 });
        }

        // Get ID from URL params
        const { searchParams } = new URL(request.url);
        const couponId = searchParams.get('id');

        const updatedCoupon = await Coupon.findByIdAndUpdate(
            couponId,
            updateFields,
            { new: true }
        );

        if (!updatedCoupon) {
            return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            data: "Coupon updated successfully",
            coupon: updatedCoupon
        });
    } catch (error) {
        console.error('Error updating coupon:', error);
        
        if (error.code === 11000) {
            return NextResponse.json({ 
                success: false, 
                error: "A coupon with this name already exists" 
            }, { status: 409 });
        }

        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE route to remove a coupon
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: "Coupon ID is required" }, { status: 400 });
        }

        await connectMongoDB();
        
        const deletedCoupon = await Coupon.findByIdAndDelete(id);

        if (!deletedCoupon) {
            return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: "Coupon deleted successfully" });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
