// app/api/hospital/[hospitalId]/ambulance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Helper function to transform ambulance data
function transformAmbulance(ambulance: any) {
  return {
    total: ambulance.total,
    inOperation: ambulance.inOperation,
    underMaintenance: ambulance.underMaintenance,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { hospitalId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const hospitalId = Number(params.hospitalId);
    
    const ambulance = await prisma.ambulance.findUnique({
      where: { hospitalId },
    });
    
    if (!ambulance) {
      return NextResponse.json(
        { message: 'Ambulance information not found' },
        { status: 404 }
      );
    }
    
    const transformedAmbulance = transformAmbulance(ambulance);
    return NextResponse.json(transformedAmbulance);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { hospitalId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const hospitalId = Number(params.hospitalId);
    const body = await request.json();
    
    // Support various input formats for ambulance fields
    const total = body.Total ?? body.total ?? 0;
    const inOperation = body["In Operation"] ?? body.inOperation ?? body.in_operation ?? 0;
    const underMaintenance = body["Under Maintenance"] ?? body.underMaintenance ?? body.under_maintenance ?? 0;
    
    // Validate that all values are numbers and non-negative
    if (
      [total, inOperation, underMaintenance].some(
        (val) => typeof val !== 'number' || val < 0
      )
    ) {
      return NextResponse.json(
        { message: 'Invalid ambulance counts' },
        { status: 400 }
      );
    }
    
    const ambulance = await prisma.ambulance.upsert({
      where: { hospitalId },
      update: { total, inOperation, underMaintenance },
      create: { hospitalId, total, inOperation, underMaintenance },
    });
    
    const transformedAmbulance = transformAmbulance(ambulance);
    return NextResponse.json(transformedAmbulance);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}