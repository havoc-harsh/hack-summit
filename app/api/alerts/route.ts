import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { withApiKeyAuth } from '@/lib/api-middleware';

export const POST = withApiKeyAuth(async (req: NextRequest) => {
  try {
    console.log("DEBUG: Alert endpoint called");
    
    // Parse request body
    const body = await req.json();
    const { 
      type, 
      location, 
      time, 
      hospitalId,
      commonSymptoms,
      symptomCounts,
      symptomFrequencies,
      possibleDiseases,
      severity,
      precautions,
      description,
      outbreakRadiusKm,
      centerLatitude,
      centerLongitude,
      appointmentsCount,
      thresholdUsed
    } = body;
    
    console.log("DEBUG: Received alert request with data:", JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!type || !location || !hospitalId) {
      console.log("ERROR: Missing required fields in alert request");
      return NextResponse.json(
        { error: 'Missing required fields: type, location, hospitalId' },
        { status: 400 }
      );
    }
    
    console.log(`DEBUG: Validated request - creating alert for hospital ID: ${hospitalId}`);
    
    // Verify hospital exists
    try {
      const hospital = await prisma.hospital.findUnique({
        where: { id: parseInt(hospitalId) }
      });
      
      if (!hospital) {
        console.log(`ERROR: Hospital with ID ${hospitalId} not found`);
        return NextResponse.json(
          { error: `Hospital with ID ${hospitalId} not found` },
          { status: 404 }
        );
      }
      
      console.log(`DEBUG: Found hospital: ${hospital.name}`);
    } catch (error) {
      console.error("ERROR: Failed to verify hospital:", error);
    }
    
    // Create alert in database
    try {
      console.log("DEBUG: Attempting to create alert record in database...");
      
      const alert = await prisma.alert.create({
        data: {
          type,
          location,
          time: time ? new Date(time) : new Date(),
          hospitalId: parseInt(hospitalId),
          // Include enhanced fields if provided
          commonSymptoms: Array.isArray(commonSymptoms) ? commonSymptoms : [],
          symptomCounts: Array.isArray(symptomCounts) ? symptomCounts : [],
          symptomFrequencies: Array.isArray(symptomFrequencies) ? symptomFrequencies : [],
          possibleDiseases: Array.isArray(possibleDiseases) ? possibleDiseases : [],
          severity: severity || "Unknown",
          precautions: Array.isArray(precautions) ? precautions : [],
          description: description || "",
          outbreakRadiusKm: typeof outbreakRadiusKm === 'number' ? outbreakRadiusKm : 0.0,
          centerLatitude: typeof centerLatitude === 'number' ? centerLatitude : 0.0,
          centerLongitude: typeof centerLongitude === 'number' ? centerLongitude : 0.0,
          appointmentsCount: typeof appointmentsCount === 'number' ? appointmentsCount : 0,
          thresholdUsed: typeof thresholdUsed === 'number' ? thresholdUsed : 0.0,
        },
      });
      
      console.log("DEBUG: Alert successfully created:", JSON.stringify(alert, null, 2));
      
      return NextResponse.json({
        success: true,
        alert,
      });
    } catch (dbError) {
      console.error("ERROR: Database operation failed:", dbError);
      throw dbError; // Rethrow to be caught by outer try/catch
    }
  } catch (error) {
    console.error('ERROR: Failed to create alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert', details: String(error) },
      { status: 500 }
    );
  }
}); 