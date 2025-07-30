import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, createdAt, type, text } = body;

    const client = await clientPromise;
    const db = client.db("resume-tailor-project");
    const collection = db.collection("resumes");

    const result = await collection.insertOne({
      title,
      createdAt,
      type,
      text,
    });

    return NextResponse.json({
      message: "Saved successfully",
      id: result.insertedId,
    });
  } catch (err: unknown) {
    console.error("Mongo Save Error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
