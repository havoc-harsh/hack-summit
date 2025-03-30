import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const hospitals = await prisma.hospital.findMany({
      include: {
        doctors: true
      }
    })

    // Convert Date to ISO string for serialization
    const serializedHospitals = hospitals.map(hospital => ({
      ...hospital,
      nextAvailable: hospital.nextAvailable.toISOString(),
      doctors: hospital.doctors
    }))

    return NextResponse.json(serializedHospitals, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json',
      }
    })

  } catch (error) {
    console.error('Prisma error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch hospitals' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}