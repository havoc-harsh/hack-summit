import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// This endpoint is accessible to authenticated users for retrieving their own alerts
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const userId = parseInt(context.params.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Validate user authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }
    
    // Ensure user can only see their own alerts
    const sessionUserId = typeof session.user.id === 'number'
      ? session.user.id
      : parseInt(session.user.id as string);
    
    const isAdmin = session.user.role === 'admin';
    
    if (sessionUserId !== userId && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Access denied' },
        { status: 403 }
      );
    }

    // Fetch alerts from database
    const alerts = await prisma.alert.findMany({
      take: 1, // Only fetch the most recent alert
      orderBy: { time: 'desc' },
      include: {
        hospital: {
          select: {
            name: true,
            address: true,
          },
        },
      },
    });
    
    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const userId = parseInt(context.params.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }
    
    // Validate user authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }
    
    // Ensure user can only update their own alerts
    const sessionUserId = typeof session.user.id === 'number'
      ? session.user.id
      : parseInt(session.user.id as string);
    
    const isAdmin = session.user.role === 'admin';
    
    if (sessionUserId !== userId && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Access denied' },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    const { alerts } = body;
    
    if (!alerts || !Array.isArray(alerts)) {
      return NextResponse.json(
        { error: 'Alerts must be provided as an array' },
        { status: 400 }
      );
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { alert: alerts },
    });
    
    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        alerts: updatedUser.alert,
      },
    });
  } catch (error) {
    console.error('Error updating user alerts:', error);
    return NextResponse.json(
      { error: 'Failed to update user alerts' },
      { status: 500 }
    );
  }
} 