// pages/api/hospital/[hospitalId]/appointments.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { hospitalId: string } }
) {
  try {
    const { hospitalId } = params;
    
    // Ensure hospital ID is provided
    if (!hospitalId) {
      return NextResponse.json(
        { error: 'Hospital ID is required' },
        { status: 400 }
      );
    }

    // Parse ID to integer
    const hospitalIdNum = parseInt(hospitalId, 10);
    if (isNaN(hospitalIdNum)) {
      return NextResponse.json(
        { error: 'Invalid hospital ID format' },
        { status: 400 }
      );
    }

    // Check if the hospital exists
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalIdNum }
    });

    if (!hospital) {
      return NextResponse.json(
        { error: 'Hospital not found' },
        { status: 404 }
      );
    }

    // Get appointments for this hospital, ordered by date (newest first)
    const appointments = await prisma.appointment.findMany({
      where: { hospitalId: hospitalIdNum },
      orderBy: [
        { date: 'desc' },
        { time: 'asc' }
      ],
      include: {
        hospital: {
          select: {
            name: true,
            address: true,
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching hospital appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}