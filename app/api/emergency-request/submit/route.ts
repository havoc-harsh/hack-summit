import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// In-memory storage as a fallback until database schema is updated
export let emergencyRequests: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("Received request data:", data);
    console.log("Hospital ID before conversion:", data.hospitalId, "type:", typeof data.hospitalId);
    
    // Simple validation
    if (!data.hospitalId) {
      return NextResponse.json({ error: "Missing hospitalId" }, { status: 400 });
    }
    
    // Convert ID to number (ensure it's always a number)
    const hospitalId = typeof data.hospitalId === 'string' 
      ? parseInt(data.hospitalId, 10) 
      : Number(data.hospitalId);
    
    console.log("Hospital ID after conversion:", hospitalId, "type:", typeof hospitalId);
    
    // Check if hospital exists
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId }
    });
    
    if (!hospital) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }
    
    // Create a new emergency request object
    const newRequest = {
      id: Date.now(),
      hospitalId,
      serviceType: data.serviceType || "ambulances",
      quantity: data.quantity || 1,
      status: "pending",
      patientName: data.patientName || "Anonymous",
      patientId: data.patientId || null,
      patientPhone: data.patientPhone || "Not provided",
      reason: data.reason || "Emergency request",
      latitude: data.location?.latitude || 0,
      longitude: data.location?.longitude || 0,
      requestDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    try {
      // Try to use the database if the model exists
      const dbRequest = await (prisma as any).emergencyRequest?.create({
        data: {
          hospitalId,
          serviceType: newRequest.serviceType,
          quantity: newRequest.quantity,
          status: newRequest.status,
          patientName: newRequest.patientName,
          patientId: newRequest.patientId,
          patientPhone: newRequest.patientPhone,
          reason: newRequest.reason,
          latitude: newRequest.latitude,
          longitude: newRequest.longitude,
          requestDate: newRequest.requestDate
        }
      });
      
      console.log("Created database emergency request:", dbRequest);
      return NextResponse.json({ 
        success: true, 
        message: "Emergency request saved to database",
        data: dbRequest
      });
      
    } catch (dbError) {
      // If database save fails, use in-memory storage
      console.log("Database save failed, using in-memory storage:", dbError);
      emergencyRequests.push(newRequest);
      
      return NextResponse.json({ 
        success: true, 
        message: "Emergency request saved in memory",
        data: newRequest
      });
    }
  } catch (error) {
    console.error("Error in simplified request:", error);
    return NextResponse.json({
      error: "Failed to process emergency request",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Add a GET endpoint to retrieve requests for a hospital
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const hospitalId = url.searchParams.get("hospitalId");
    
    if (!hospitalId) {
      return NextResponse.json({ error: "Missing hospitalId parameter" }, { status: 400 });
    }
    
    // Always convert to number for consistency
    const hospitalIdNum = typeof hospitalId === 'string' 
      ? parseInt(hospitalId, 10) 
      : Number(hospitalId);
    
    console.log("GET: Looking for hospital ID:", hospitalIdNum, "type:", typeof hospitalIdNum);
    
    try {
      // Try to use the database if the model exists
      const dbRequests = await (prisma as any).emergencyRequest?.findMany({
        where: { hospitalId: hospitalIdNum },
        orderBy: { requestDate: 'desc' }
      });
      
      if (dbRequests && dbRequests.length > 0) {
        console.log(`Found ${dbRequests.length} requests in database for hospital ${hospitalIdNum}`);
        return NextResponse.json(dbRequests);
      }
    } catch (dbError) {
      console.log("Database fetch failed, using in-memory storage:", dbError);
    }
    
    // Use in-memory storage as fallback
    const inMemoryRequests = emergencyRequests.filter(req => {
      // Force number comparison
      const reqHospitalId = Number(req.hospitalId);
      const result = reqHospitalId === hospitalIdNum;
      console.log(`Comparing request hospitalId ${reqHospitalId} (${typeof reqHospitalId}) with ${hospitalIdNum} (${typeof hospitalIdNum}): ${result}`);
      return result;
    });
    
    console.log(`Found ${inMemoryRequests.length} requests in memory for hospital ${hospitalIdNum}`);
    return NextResponse.json(inMemoryRequests);
    
  } catch (error) {
    console.error("Error fetching emergency requests:", error);
    return NextResponse.json({
      error: "Failed to fetch emergency requests",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 