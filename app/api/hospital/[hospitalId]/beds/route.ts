import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
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
    
    const bed = await prisma.bed.findUnique({
      where: { hospitalId },
    });

    if (!bed) {
      return NextResponse.json({ message: 'Bed information not found' }, { status: 404 });
    }

    const transformedBed = {
      ICU: bed.icu,
      General: bed.general,
      Emergency: bed.emergency,
      Maternity: bed.maternity,
      Pediatric: bed.pediatric,
    };

    return NextResponse.json(transformedBed);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
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
    const { ICU, General, Emergency, Maternity, Pediatric } = body;

    if (
      [ICU, General, Emergency, Maternity, Pediatric].some(
        (val) => typeof val !== 'number' || val < 0
      )
    ) {
      return NextResponse.json({ message: 'Invalid bed counts' }, { status: 400 });
    }

    const bed = await prisma.bed.upsert({
      where: { hospitalId },
      update: {
        icu: ICU,
        general: General,
        emergency: Emergency,
        maternity: Maternity,
        pediatric: Pediatric,
      },
      create: {
        hospitalId,
        icu: ICU,
        general: General,
        emergency: Emergency,
        maternity: Maternity,
        pediatric: Pediatric,
      },
    });

    const transformedBed = {
      ICU: bed.icu,
      General: bed.general,
      Emergency: bed.emergency,
      Maternity: bed.maternity,
      Pediatric: bed.pediatric,
    };

    return NextResponse.json(transformedBed);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}