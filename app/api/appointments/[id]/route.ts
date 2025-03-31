import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { withApiKeyAuth } from '@/lib/api-middleware';

export const GET = withApiKeyAuth(async (
  req: NextRequest,
  context?: { params?: { id: string } }
) => {
  try {
    // Get the ID from context params or from the URL path
    let id: string;
    
    // With our fixed middleware, we can now safely access context.params
    // without awaiting it, since the middleware already awaited it
    if (context?.params?.id) {
      id = context.params.id;
    } else {
      // Extract ID from URL as fallback
      const urlParts = req.url.split('/');
      id = urlParts[urlParts.length - 1];
    }
    
    const appointmentId = parseInt(id);
    
    if (isNaN(appointmentId)) {
      return NextResponse.json(
        { error: 'Invalid appointment ID' },
        { status: 400 }
      );
    }
    
    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      include: {
        hospital: true,
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
}); 