import connectMongoDB from '@/lib/mongoDb/connect'
import Services from "@module/services"
import mongoose from 'mongoose';

// Function to check DB connection
export async function checkDbConnection() {
    try {
        const state = mongoose.connection.readyState;
        switch (state) {
            case 0:
                return { connected: false, status: 'disconnected' };
            case 1:
                return { connected: true, status: 'connected' };
            case 2:
                return { connected: false, status: 'connecting' };
            case 3:
                return { connected: false, status: 'disconnecting' };
            default:
                return { connected: false, status: 'unknown' };
        }
    } catch (error) {
        return { connected: false, status: 'error', error: error.message };
    }
}

// GET route to check connection status
export async function GET() {
    try {
        await connectMongoDB();
        const connectionStatus = await checkDbConnection();
        
        return Response.json(connectionStatus);
    } catch (error) {
        return Response.json({ 
            connected: false, 
            status: 'error', 
            error: error.message 
        }, { status: 500 });
    }
}

// POST route to create a new service
export async function POST(request) {
    try {
        const body = await request.json();
        const { description, imageUrl } = body;

        // Connect to MongoDB
        await connectMongoDB();
        
        // Create new service
        const newService = await Services.create({
            description: description,
            image: imageUrl
        });
        
        return Response.json({ success: true, data: newService });
    } catch (error) {
        console.error('Error adding service:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}


