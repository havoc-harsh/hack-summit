import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const userId = parseInt(params.userId);

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    const medicalProfile = await prisma.medicalProfile.findUnique({
      where: { userId },
      include: {
        favoriteDoctors: true,
        user: true
      }
    });

    if (!medicalProfile) {
      return NextResponse.json(
        { error: "Medical profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(medicalProfile);
  } catch (error) {
    console.error("Error fetching medical profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}