import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { appointmentId: string } }
) {
  try {
    // Get appointmentId from route params
    const { appointmentId } = params;
    
    // Parse request body
    const { status, transactionHash } = await request.json();
    
    // Update appointment with payment information
    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        paymentStatus: status,
        paymentMethod: 'crypto',
        transactionHash,
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json(
      { success: true, appointment: updatedAppointment },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating appointment payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
} 