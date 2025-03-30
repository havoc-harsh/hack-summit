import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseadmin";

export async function POST(req: Request) {
  try {
    const { name, description } = await req.json();

    if (!name || !description) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await db.collection("requests").add({
      name,
      description,
      createdAt: new Date(),
      replies: [],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}
