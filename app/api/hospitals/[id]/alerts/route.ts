import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { withApiKeyAuth } from '@/lib/api-middleware';

export const GET = async (
  req: NextRequest,
  context: { params: { id: string } }
) => {
  try {
    console.log(`DEBUG: Hospital alerts endpoint called for hospital ID: ${context.params.id}`);
    
    const hospitalId = parseInt(context.params.id);
    
    if (isNaN(hospitalId)) {
      return NextResponse.json(
        { error: 'Invalid hospital ID' },
        { status: 400 }
      );
    }
    
    // Check if hospital exists
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
    });
    
    if (!hospital) {
      return NextResponse.json(
        { error: 'Hospital not found' },
        { status: 404 }
      );
    }
    
    // Get alerts for the hospital
    const alerts = await prisma.alert.findMany({
      where: { hospitalId },
      orderBy: { time: 'desc' },
    });
    
    console.log(`DEBUG: Found ${alerts.length} alerts for hospital ID: ${hospitalId}`);
    
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching hospital alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hospital alerts' },
      { status: 500 }
    );
  }
}; 