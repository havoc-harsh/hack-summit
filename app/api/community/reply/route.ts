
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseadmin";

export async function POST(req: Request) {
  try {
    const { requestId, name, message } = await req.json();

    if (!requestId || !name || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const requestRef = db.collection("requests").doc(requestId);
    await requestRef.update({
      replies: [...(await requestRef.get()).data()?.replies || [], { name, message }]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit reply" }, { status: 500 });
  }
}
