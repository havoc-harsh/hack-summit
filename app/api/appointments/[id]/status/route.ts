import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// PATCH endpoint to update appointment status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;
    
    // Validate input
    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    if (!status || !['scheduled', 'approved', 'declined', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required' },
        { status: 400 }
      );
    }

    // Parse ID to integer
    const appointmentId = parseInt(id, 10);
    if (isNaN(appointmentId)) {
      return NextResponse.json(
        { error: 'Invalid appointment ID format' },
        { status: 400 }
      );
    }

    // Get the appointment with hospital and user information
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        hospital: true,
        user: true
      }
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Update appointment status
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
      include: {
        hospital: true
      }
    });

    // Create a notification for the user in the database
    if (appointment.userId) {
      let message = '';
      let notificationType = '';
      
      // Determine notification message and type based on status
      if (status === 'approved') {
        message = `Your appointment at ${appointment.hospital.name} has been approved. You can now proceed to payment.`;
        notificationType = 'success';
      } else if (status === 'declined') {
        message = `Your appointment at ${appointment.hospital.name} has been declined.`;
        notificationType = 'error';
      } else if (status === 'cancelled') {
        message = `Your appointment at ${appointment.hospital.name} has been cancelled.`;
        notificationType = 'error';
      } else {
        message = `Your appointment status has been updated to: ${status}`;
        notificationType = 'info';
      }
      
      // Create the notification
      await prisma.notification.create({
        data: {
          userId: appointment.userId,
          type: status === 'approved' ? 'appointment_approved' : 
                status === 'declined' ? 'appointment_declined' :
                status === 'cancelled' ? 'appointment_cancelled' : 'appointment_updated',
          title: status.charAt(0).toUpperCase() + status.slice(1),
          message,
          read: false,
          appointmentId: appointmentId
        }
      });
    }

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment status' },
      { status: 500 }
    );
  }
} 