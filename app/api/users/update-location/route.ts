import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  try {
    // Verify the session to ensure this is a valid authenticated request
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const { userId, latitude, longitude } = await req.json();

    // Validate required fields
    if (!userId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, latitude, longitude' },
        { status: 400 }
      );
    }

    // Validate that this user can only update their own location
    if (session.user.id !== userId) {
      return NextResponse.json(
        { success: false, error: 'You can only update your own location' },
        { status: 403 }
      );
    }

    // Update user's location in database
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        updatedAt: new Date(),
      },
    });

    // Log the update for debugging
    console.log(`Updated location for user ${userId}: ${latitude}, ${longitude}`);

    return NextResponse.json({
      success: true,
      message: 'Location updated successfully',
    });
  } catch (error) {
    console.error('Error updating user location:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update location' },
      { status: 500 }
    );
  }
} 