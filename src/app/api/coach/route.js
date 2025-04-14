import connectMongoDB from "@/lib/mongoDb/connect";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await connectMongoDB();
        const coaches = await User.find({ role: 'coach' });
        
        if (!coaches || coaches.length === 0) {
            return NextResponse.json({ error: 'No coaches found' }, { status: 404 });
        }
        
        return NextResponse.json(coaches);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
