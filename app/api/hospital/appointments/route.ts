import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'hospital') {
      return NextResponse.json(
        { error: 'Unauthorized. Only hospital accounts can access this endpoint' },
        { status: 401 }
      );
    }

    const hospitalId = parseInt(session.user.id, 10);
    
    if (isNaN(hospitalId)) {
      return NextResponse.json(
        { error: 'Invalid hospital ID' },
        { status: 400 }
      );
    }

    // Fetch all appointments for this hospital
    const appointments = await prisma.appointment.findMany({
      where: {
        hospitalId: hospitalId,
      },
      orderBy: [
        {
          status: 'asc', // First scheduled, then approved, then declined, then completed
        },
        {
          date: 'asc', // Then by date
        },
        {
          time: 'asc', // Then by time
        }
      ],
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