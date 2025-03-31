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

    // Fetch notifications for the user
    const notifications = await prisma.notification.findMany({
      where: { 
        userId: userIdNumber 
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        appointment: {
          select: {
            hospitalId: true,
            date: true,
            time: true,
            hospital: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      take: 20, // Limit to most recent 20 notifications
    });

    // Format the notifications for display
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
      appointmentId: notification.appointmentId,
      appointmentDetails: notification.appointment ? {
        hospitalName: notification.appointment.hospital.name,
        date: notification.appointment.date,
        time: notification.appointment.time,
      } : null,
    }));

    return NextResponse.json(formattedNotifications);
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// Mark notifications as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const body = await request.json();
    
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

    // Check if specific notification IDs were provided
    if (body.notificationIds && Array.isArray(body.notificationIds)) {
      // Mark specific notifications as read
      await prisma.notification.updateMany({
        where: {
          id: {
            in: body.notificationIds.map((id: number) => id),
          },
          userId: userIdNumber,
        },
        data: {
          read: true,
        },
      });
    } else {
      // Mark all user's notifications as read
      await prisma.notification.updateMany({
        where: {
          userId: userIdNumber,
          read: false,
        },
        data: {
          read: true,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
} 