import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Ensure id is provided
    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // Parse the ID to integer
    const appointmentId = parseInt(id, 10);
    if (isNaN(appointmentId)) {
      return NextResponse.json(
        { error: 'Invalid appointment ID format' },
        { status: 400 }
      );
    }

    // Update payment status
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { 
        paymentStatus: 'completed',
        // Store transaction hash if provided
        ...(body.transactionHash && { 
          paymentTransactionHash: body.transactionHash 
        })
      },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
} 