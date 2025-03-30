// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { registerSchema } from "@/app/lib/schema";
import { z } from "zod";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const data = registerSchema.parse(body);


    const existingUser = await prisma.hospital.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await prisma.hospital.create({
      data: {
        name: data.name,
        address: data.address,
        contactPerson: data.contactPerson,
        phone: data.phone,
        email: data.email,
        licenseNumber: data.licenseNumber,
        password: hashedPassword,
        longitude:data.longitude,
        latitude:data.latitude
      },
    });

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}