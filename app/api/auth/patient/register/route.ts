import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingPatient = await prisma.user.findUnique({
      where: { email },
    });

    if (existingPatient) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    const patient = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Patient registered successfully', patient }, { status: 201 });
  } catch (error) {
    console.error('Error registering patient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}