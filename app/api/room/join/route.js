import { NextResponse } from "next/server";
import { handlejoinroombackend } from "@/app/action/room";
export async function POST(req) {
    try {
        const body = await req.json();
        const { roomId, email, username } = body;

        console.log("Received join room request:", body);

        if (!roomId || !email || !username) {
            return NextResponse.json(
                { 
                    error: "Missing required fields",
                    details: `Please provide ${!roomId ? 'roomId' : ''} ${!email ? 'email' : ''} ${!username ? 'username' : ''}`.trim(),
                    status: 400 
                },
                { status: 400 }
            );
        }
        let res;    
        try {
            res = await handlejoinroombackend(roomId, email, username);
        } catch (backendErr) {
            console.log("Backend join room operation failed:", backendErr);
            return NextResponse.json(
                { 
                    error: "Failed to process join room request",
                    details: backendErr.message,

                },
                { status: 500 }
            );
        }
        if (res.status !== 200) {
            console.log("Join room operation failed with status:", res.status, res.error);
            return NextResponse.json({ 
                error: res.error, 
                details: res.error || "Unable to join room. Please try again later.",
                status: res.status
            }, { status: res.status });
        }
        else {
            return NextResponse.json({ 
                message: res.message, 
                details: "Successfully joined the room",
                status: res.status,
            });
        }

    } catch (err) {
        console.log("Critical error in join room API:", err);
        return NextResponse.json(
            { 
                error: "Internal server error",
                details: err.message,
                status: 500,
            },
            { status: 500 }
        );
    }
}