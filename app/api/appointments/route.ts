import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received appointment data:', body);

    // Validate required fields and types
    const requiredFields = [
      { key: 'patient', type: 'string' },
      { key: 'phone', type: 'string' },
      { key: 'symptoms', type: 'string' },
      { key: 'latitude', type: 'number' },
      { key: 'longitude', type: 'number' },
      { key: 'date', type: 'string' }, // expecting ISO date string
      { key: 'time', type: 'string' },
      { key: 'hospitalId', type: 'number' },
    ];

    const missingFields = requiredFields.filter(field => {
      // If the field doesn't exist or its type doesn't match
      return !(field.key in body) || typeof body[field.key] !== field.type;
    });

    if (missingFields.length > 0) {
      console.error('Validation failed. Missing/invalid fields:', missingFields);
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: missingFields.map(f => `${f.key} (expected ${f.type})`)
        },
        { status: 400 }
      );
    }

    // Additional check: ensure latitude and longitude are not null
    if (body.latitude === null || body.longitude === null) {
      return NextResponse.json(
        { error: 'Location data missing (latitude and longitude are required).' },
        { status: 400 }
      );
    }

    // Convert date string to Date object
    const appointmentDate = new Date(body.date);
    if (isNaN(appointmentDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Ensure hospital exists
    const hospitalExists = await prisma.hospital.findUnique({
      where: { id: body.hospitalId },
    });
    if (!hospitalExists) {
      return NextResponse.json(
        { error: 'Hospital not found' },
        { status: 400 }
      );
    }

    // Create appointment using Prisma
    const appointment = await prisma.appointment.create({
      data: {
        patient: body.patient,
        phone: body.phone,
        symptoms: body.symptoms,
        latitude: body.latitude,
        longitude: body.longitude,
        date: appointmentDate,
        time: body.time,
        // Use provided alert if available; otherwise, default to an empty array
        alert: body.alert && Array.isArray(body.alert) ? body.alert : [],
        hospitalId: body.hospitalId,
      },
    });

    console.log('Created appointment:', appointment);
    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // For example, if the hospitalId violates a foreign key constraint
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Invalid hospital ID. Hospital not found.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Database error', code: error.code },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
