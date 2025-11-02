import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("SESSION:", session);

    if (!session) {
      return NextResponse.json({ message: "please login first" }, { status: 401 });
    }

    if (session.user?.email) {
      return NextResponse.json(
        { message: "successfully got email", email: session.user.email },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ message: "email not loaded" }, { status: 403 });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ message: "API crashed" }, { status: 500 });
  }
}
