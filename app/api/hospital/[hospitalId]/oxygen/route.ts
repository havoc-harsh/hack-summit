// app/api/hospital/[hospitalId]/oxygen/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
    
    const oxygen = await prisma.oxygen.findUnique({
      where: { hospitalId },
    });
    
    if (!oxygen) {
      return NextResponse.json(
        { message: 'Oxygen information not found' },
        { status: 404 }
      );
    }
    
    // Transform the response to match the expected client format
    const transformedOxygen = {
      "Oxygen Cylinders": oxygen.oxygenCylinders,
      "Liquid Oxygen": oxygen.liquidOxygen
    };
    
    return NextResponse.json(transformedOxygen);
  } catch (error) {
    console.error('Error fetching oxygen data:', error);
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
    console.log('Received oxygen update data:', body);
    
    // Handle various possible property names
    const oxygenCylinders = body["Oxygen Cylinders"] ?? body.oxygenCylinders ?? body.oxygen_cylinders ?? 0;
    const liquidOxygen = body["Liquid Oxygen"] ?? body.liquidOxygen ?? body.liquid_oxygen ?? 0;
    
    if (
      [oxygenCylinders, liquidOxygen].some(
        (val) => typeof val !== 'number' || val < 0
      )
    ) {
      return NextResponse.json(
        { message: 'Invalid oxygen quantities' },
        { status: 400 }
      );
    }
    
    // Check if hospital exists
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId }
    });
    
    if (!hospital) {
      return NextResponse.json(
        { message: 'Hospital not found' },
        { status: 404 }
      );
    }
    
    const oxygen = await prisma.oxygen.upsert({
      where: { hospitalId },
      update: {
        oxygenCylinders,
        liquidOxygen,
      },
      create: {
        hospitalId,
        oxygenCylinders,
        liquidOxygen,
      },
    });
    
    // Transform the response to match the expected client format
    const transformedOxygen = {
      "Oxygen Cylinders": oxygen.oxygenCylinders,
      "Liquid Oxygen": oxygen.liquidOxygen
    };
    
    return NextResponse.json(transformedOxygen);
  } catch (error) {
    console.error('Oxygen update error:', error);
    return NextResponse.json(
      { message: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}