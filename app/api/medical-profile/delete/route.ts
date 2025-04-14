import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const userId = parseInt(url.searchParams.get("userId") || "");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    await prisma.medicalProfile.delete({
      where: {
        userId,
      },
    });
    return NextResponse.json({ success: true, message: "Medical profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting medical profile:", error);
    return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 });
  }
} 