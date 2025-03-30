import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: any, { params }: any) {
  try {
    const hospitalId = parseInt(params.hospitalId);
    if (isNaN(hospitalId)) {
      return new Response(JSON.stringify({ error: 'Invalid hospitalId' }), { status: 400 });
    }

    const doctors = await prisma.doctor.findMany({
      where: { hospitalId },
    });

    return new Response(JSON.stringify(doctors), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function POST(request: { json: () => any; }, { params }: any) {
  try {
    const hospitalId = parseInt(params.hospitalId);
    if (isNaN(hospitalId)) {
      return new Response(JSON.stringify({ error: 'Invalid hospitalId' }), { status: 400 });
    }

    const data = await request.json();
    if (!data.name || !data.specialization) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const doctor = await prisma.doctor.create({
      data: {
        name: data.name,
        specialization: data.specialization,
        shift: data.shift || 'Not Assigned',
        hospitalId: hospitalId,
      },
    });

    return new Response(JSON.stringify(doctor), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if ((error as any).code === 'P2003') {
      return new Response(JSON.stringify({ error: 'Hospital not found' }), { status: 400 });
    }
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// PUT (Update Doctor)
export async function PUT(request: NextRequest, { params }: { params: { hospitalId: string } }) {
  try {
    const hospitalId = parseInt(params.hospitalId);
    if (isNaN(hospitalId)) {
      return new Response(JSON.stringify({ error: 'Invalid hospitalId' }), { status: 400 });
    }

    const data = await request.json();
    const id = parseInt(data.id);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'Invalid doctor id' }), { status: 400 });
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: {
        name: data.name,
        specialization: data.specialization,
        shift: data.shift
      }
    });

    return new Response(JSON.stringify(updatedDoctor), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { hospitalId: string } }) {
  try {
    const hospitalId = parseInt(params.hospitalId);
    if (isNaN(hospitalId)) {
      return new Response(JSON.stringify({ error: 'Invalid hospitalId' }), { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '');
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'Invalid doctor id' }), { status: 400 });
    }

    await prisma.doctor.delete({
      where: { id }
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}