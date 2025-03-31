import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Convert userId to number
    const userIdNumber = parseInt(userId, 10);

    if (isNaN(userIdNumber)) {
      return NextResponse.json(
        { error: 'Invalid User ID format' },
        { status: 400 }
      );
    }

    // Fetch all appointments for the user, including hospital data
    const appointments = await prisma.appointment.findMany({
      where: { 
        userId: userIdNumber 
      },
      include: {
        hospital: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // If no appointments found, return an empty array
    if (!appointments || appointments.length === 0) {
      return NextResponse.json([]);
    }

    // Transform appointments to include hospitalName
    const formattedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      date: appointment.date,
      time: appointment.time,
      patient: appointment.patient,
      hospitalId: appointment.hospitalId,
      hospitalName: appointment.hospital?.name || 'Unknown Hospital',
      symptoms: appointment.symptoms || '',
      status: appointment.status || 'scheduled',
      paymentStatus: appointment.paymentStatus || 'pending',
      createdAt: appointment.createdAt,
    }));

    // Filter to only show upcoming appointments and recent ones (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filteredAppointments = formattedAppointments.filter(app => {
      const appointmentDate = new Date(app.date);
      return appointmentDate >= thirtyDaysAgo;
    });

    return NextResponse.json(filteredAppointments);
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
} 