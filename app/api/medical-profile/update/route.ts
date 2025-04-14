import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function PUT(request: NextRequest) {
  const data = await request.json();
  const userId = parseInt(data.userId);

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const medicalProfile = await prisma.medicalProfile.update({
      where: {
        userId,
      },
      data: {
        bloodType: data.bloodType || "",
        allergies: data.allergies || [],
        medications: data.medications || [],
        conditions: data.conditions || [],
        vaccinations: data.vaccinations || [],
        lastCheckup: data.lastCheckup ? new Date(data.lastCheckup) : undefined,
      },
    });
    return NextResponse.json(medicalProfile);
  } catch (error) {
    console.error("Error updating medical profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
} 