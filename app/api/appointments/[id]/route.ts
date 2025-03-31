import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // Convert appointmentId to number
    const appointmentId = parseInt(id, 10);

    if (isNaN(appointmentId)) {
      return NextResponse.json(
        { error: 'Invalid Appointment ID format' },
        { status: 400 }
      );
    }

    // Fetch the appointment with hospital details
    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Format the appointment data for the response
    const formattedAppointment = {
      id: appointment.id,
      patient: appointment.patient,
      phone: appointment.phone,
      symptoms: appointment.symptoms,
      latitude: appointment.latitude,
      longitude: appointment.longitude,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      statusReason: appointment.statusReason,
      paymentStatus: appointment.paymentStatus,
      hospitalId: appointment.hospitalId,
      hospitalName: appointment.hospital.name,
      hospitalAddress: appointment.hospital.address,
      hospitalPhone: appointment.hospital.phone,
      userId: appointment.userId,
      createdAt: appointment.createdAt,
    };

    return NextResponse.json(formattedAppointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    );
  }
} 