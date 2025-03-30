// app/api/hospital/[hospitalId]/blood/route.ts
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
    
    const blood = await prisma.blood.findUnique({
      where: { hospitalId },
    });
    
    if (!blood) {
      return NextResponse.json(
        { message: 'Blood information not found' },
        { status: 404 }
      );
    }
    
    // Transform the response to match the expected client format
    const transformedBlood = {
      A_Positive: blood.aPositive,
      B_Positive: blood.bPositive,
      O_Positive: blood.oPositive,
      AB_Positive: blood.abPositive
    };
    
    return NextResponse.json(transformedBlood);
  } catch (error) {
    console.error('Error fetching blood data:', error);
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
    console.log('Received blood update data:', body);
    
    // Handle both camelCase and snake_case formats for flexibility
    const A_Positive = body.A_Positive ?? body.a_positive ?? body.aPositive ?? 0;
    const B_Positive = body.B_Positive ?? body.b_positive ?? body.bPositive ?? 0;
    const O_Positive = body.O_Positive ?? body.o_positive ?? body.oPositive ?? 0;
    const AB_Positive = body.AB_Positive ?? body.ab_positive ?? body.abPositive ?? 0;
    
    // Validate the values
    if (
      [A_Positive, B_Positive, O_Positive, AB_Positive].some(
        (val) => typeof val !== 'number' || val < 0
      )
    ) {
      return NextResponse.json(
        { message: 'Invalid blood units' },
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
    
    const blood = await prisma.blood.upsert({
      where: { hospitalId },
      update: {
        aPositive: A_Positive,
        bPositive: B_Positive,
        oPositive: O_Positive,
        abPositive: AB_Positive,
      },
      create: {
        hospitalId,
        aPositive: A_Positive,
        bPositive: B_Positive,
        oPositive: O_Positive,
        abPositive: AB_Positive,
      },
    });
    
    // Transform the response to match the expected client format
    const transformedBlood = {
      A_Positive: blood.aPositive,
      B_Positive: blood.bPositive,
      O_Positive: blood.oPositive,
      AB_Positive: blood.abPositive
    };
    
    return NextResponse.json(transformedBlood);
  } catch (error) {
    console.error('Blood update error:', error);
    return NextResponse.json(
      { message: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}