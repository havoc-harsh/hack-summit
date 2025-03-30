import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseadmin";

export async function GET() {
  try {
    const snapshot = await db.collection("requests").orderBy("createdAt", "desc").get();
    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}
