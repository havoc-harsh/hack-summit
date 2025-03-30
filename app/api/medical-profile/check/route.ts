import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const medicalProfile = await prisma.medicalProfile.findUnique({
      where: { userId: parseInt(userId) },
    });
    return NextResponse.json({ exists: !!medicalProfile });
  } catch (error) {
    console.error("Error checking medical profile:", error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}