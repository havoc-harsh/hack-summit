import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { emergencyRequests } from "../route";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const requestId = typeof id === 'string' ? parseInt(id, 10) : Number(id);
    console.log("Processing status update for request ID:", requestId, "type:", typeof requestId);
    
    const data = await request.json();
    console.log("Status update data:", data);
    
    if (!data.status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }
    
    try {
      // Try to update in database first
      const updatedRequest = await (prisma as any).emergencyRequest?.update({
        where: { id: requestId },
        data: {
          status: data.status,
          updatedAt: new Date()
        },
      });
      
      if (updatedRequest) {
        return NextResponse.json(updatedRequest);
      }
    } catch (dbError) {
      console.log("Database update failed, using in-memory storage:", dbError);
    }
    
    // Update in in-memory storage
    const requestIndex = emergencyRequests.findIndex((req: any) => {
      const reqId = Number(req.id);
      const result = reqId === requestId;
      console.log(`Comparing request id ${reqId} (${typeof reqId}) with ${requestId} (${typeof requestId}): ${result}`);
      return result;
    });
    
    if (requestIndex === -1) {
      return NextResponse.json(
        { error: "Emergency request not found" },
        { status: 404 }
      );
    }
    
    // Update the status
    emergencyRequests[requestIndex].status = data.status;
    emergencyRequests[requestIndex].updatedAt = new Date();
    
    return NextResponse.json(emergencyRequests[requestIndex]);
    
  } catch (error) {
    console.error("Error updating emergency request status:", error);
    return NextResponse.json(
      { 
        error: "Failed to update emergency request status",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 