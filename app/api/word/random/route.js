import connectDb from "@/app/db/connect";
import Word from "@/app/models/word";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await connectDb();

      
        const randomWords = await Word.aggregate([{ $sample: { size: 1 } }]);

        if (!randomWords || randomWords.length === 0) {
            return NextResponse.json({ error: "No words found in database" }, { status: 404 });
        }

        return NextResponse.json({ word: randomWords[0].word }, { status: 200 });
    } catch (error) {
        console.error("Error fetching random word:", error);
        return NextResponse.json({ error: "Failed to fetch random word" }, { status: 500 });
    }
}
