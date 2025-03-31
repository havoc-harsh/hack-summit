import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.hospitalId || !data.serviceType || !data.quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert hospitalId to number if it's a string
    const hospitalId = typeof data.hospitalId === 'string' 
      ? parseInt(data.hospitalId, 10) 
      : data.hospitalId;

    // Ensure hospital exists
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId }
    });

    if (!hospital) {
      return NextResponse.json(
        { error: "Hospital not found" },
        { status: 404 }
      );
    }

    // Create the emergency request
    const emergencyRequest = await (prisma as any).emergencyRequest.create({
      data: {
        hospitalId,
        serviceType: data.serviceType,
        quantity: data.quantity,
        status: data.status || "pending",
        patientName: data.patientName || "Anonymous",
        patientId: data.patientId,
        patientPhone: data.patientPhone || "Not provided",
        reason: data.reason || `Emergency ${data.serviceType} request`,
        latitude: data.location?.latitude || 0,
        longitude: data.location?.longitude || 0,
        requestDate: data.requestDate ? new Date(data.requestDate) : new Date(),
      }
    });

    return NextResponse.json(emergencyRequest);
  } catch (error) {
    console.error("Error creating emergency request:", error);
    // Return more detailed error information for debugging
    return NextResponse.json(
      { 
        error: "Failed to create emergency request", 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const hospitalId = url.searchParams.get("hospitalId");
    
    // If hospitalId is provided, get requests for that hospital
    if (hospitalId) {
      const requests = await (prisma as any).emergencyRequest.findMany({
        where: { 
          hospitalId: parseInt(hospitalId, 10)
        },
        orderBy: { requestDate: 'desc' }
      });
      
      return NextResponse.json(requests);
    }
    
    // Otherwise return all requests (could be limited with pagination in real app)
    const requests = await (prisma as any).emergencyRequest.findMany({
      orderBy: { requestDate: 'desc' },
      take: 100
    });
    
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching emergency requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch emergency requests" },
      { status: 500 }
    );
  }
} 