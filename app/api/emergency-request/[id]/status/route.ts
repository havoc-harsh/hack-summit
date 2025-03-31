import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const requestId = parseInt(id, 10);
    
    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    const { status } = await request.json();
    
    if (!status || !["pending", "approved", "rejected", "fulfilled"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Update emergency request status
    const updatedRequest = await (prisma as any).emergencyRequest.update({
      where: { id: requestId },
      data: { status }
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error updating emergency request status:", error);
    return NextResponse.json(
      { error: "Failed to update emergency request status" },
      { status: 500 }
    );
  }
} 