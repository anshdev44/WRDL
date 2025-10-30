import { NextResponse } from "next/server";
import { leaveroombackend } from "@/app/action/room"; 

export async function POST(req) {
  try {
    // Parse JSON body
    const body = await req.json();
    const { roomId, email } = body;

    console.log("Incoming leave room request:", body);

    // Validate inputs
    if (!roomId || !email) {
      return NextResponse.json(
        { error: "roomId and email are required" },
        { status: 400 }
      );
    }
    let res;
    try {
      res = await leaveroombackend(roomId, email);
    } catch (backendErr) {
      console.error("Error in leaveroombackend:", backendErr);
      return NextResponse.json(
        { error: "Backend function crashed", details: backendErr.message },
        { status: 500 }
      );
    }
    if (res.status === 200) {
      return NextResponse.json({ message: res.message }, { status: 200 });
    } else if (res.status === 201) {
      return NextResponse.json({ message: res.message }, { status: 201 });
    } else {
      return NextResponse.json(
        { error: res.error || "Unexpected backend error" },
        { status: res.status || 500 }
      );
    }

  } catch (err) {
    console.error("Leave room API crashed:", err);
    return NextResponse.json(
      { error: "Server crashed", details: err.message },
      { status: 500 }
    );
  }
}
