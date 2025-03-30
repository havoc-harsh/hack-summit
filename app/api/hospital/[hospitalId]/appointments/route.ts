// pages/api/hospital/[hospitalId]/appointments.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  request: NextRequest,
  { params }: { params: { hospitalId: string } }
) {
  try {
    // Check if the user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure the authenticated user's ID matches the hospitalId in the route
    if (session.user.id !== params.hospitalId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Convert hospitalId to an integer for database query
    const hospitalId = parseInt(params.hospitalId);
    if (isNaN(hospitalId)) {
      return NextResponse.json({ error: 'Invalid hospital ID' }, { status: 400 });
    }

    // Fetch appointments from the database
    const appointments = await prisma.appointment.findMany({
      where: { hospitalId },
      orderBy: { date: 'asc' }, // Optional: sort by date
    });

    // Return the list of appointments
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}