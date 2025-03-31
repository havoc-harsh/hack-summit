import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { hospitalId: string, id: string } }
) {
  try {
    const { hospitalId, id } = params;
    
    // Ensure parameters are provided
    if (!hospitalId || !id) {
      return NextResponse.json(
        { error: 'Hospital ID and Appointment ID are required' },
        { status: 400 }
      );
    }

    // Parse IDs to integers
    const hospitalIdNum = parseInt(hospitalId, 10);
    const appointmentIdNum = parseInt(id, 10);
    
    if (isNaN(hospitalIdNum) || isNaN(appointmentIdNum)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    // Fetch the appointment for the specified hospital
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentIdNum,
        hospitalId: hospitalIdNum,
      },
      include: {
        hospital: {
          select: {
            name: true,
            address: true,
            email: true,
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

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { hospitalId: string, id: string } }
) {
  try {
    const { hospitalId, id } = params;
    const body = await request.json();
    
    // Ensure parameters are provided
    if (!hospitalId || !id) {
      return NextResponse.json(
        { error: 'Hospital ID and Appointment ID are required' },
        { status: 400 }
      );
    }

    // Parse IDs to integers
    const hospitalIdNum = parseInt(hospitalId, 10);
    const appointmentIdNum = parseInt(id, 10);
    
    if (isNaN(hospitalIdNum) || isNaN(appointmentIdNum)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    // Validate that the appointment belongs to the hospital
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentIdNum,
        hospitalId: hospitalIdNum,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found or does not belong to this hospital' },
        { status: 404 }
      );
    }

    // Update the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentIdNum },
      data: body,
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { hospitalId: string, id: string } }
) {
  try {
    const { hospitalId, id } = params;
    
    // Ensure parameters are provided
    if (!hospitalId || !id) {
      return NextResponse.json(
        { error: 'Hospital ID and Appointment ID are required' },
        { status: 400 }
      );
    }

    // Parse IDs to integers
    const hospitalIdNum = parseInt(hospitalId, 10);
    const appointmentIdNum = parseInt(id, 10);
    
    if (isNaN(hospitalIdNum) || isNaN(appointmentIdNum)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    // Validate that the appointment belongs to the hospital
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentIdNum,
        hospitalId: hospitalIdNum,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found or does not belong to this hospital' },
        { status: 404 }
      );
    }

    // Delete the appointment
    await prisma.appointment.delete({
      where: { id: appointmentIdNum },
    });

    return NextResponse.json(
      { message: 'Appointment deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
} 