import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { withApiKeyAuth } from '@/lib/api-middleware';

// Helper function to calculate haversine distance
function haversineDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const GET = withApiKeyAuth(async (req: NextRequest) => {
  try {
    // Get query parameters
    const url = new URL(req.url);
    const lat = url.searchParams.get('lat');
    const lon = url.searchParams.get('lon');
    const radiusParam = url.searchParams.get('radius');
    
    // Get all hospitals from database
    const hospitals = await prisma.hospital.findMany();
    
    // If location filtering parameters are provided, filter hospitals by distance
    if (lat && lon && radiusParam) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      const radius = parseFloat(radiusParam);
      
      if (isNaN(latitude) || isNaN(longitude) || isNaN(radius)) {
        return NextResponse.json(
          { error: 'Invalid location parameters' },
          { status: 400 }
        );
      }
      
      // Filter hospitals by distance
      const hospitalsInRadius = hospitals.filter(hospital => {
        const distance = haversineDistance(
          latitude, 
          longitude, 
          hospital.latitude, 
          hospital.longitude
        );
        
        return distance <= radius;
      });
      
      return NextResponse.json(hospitalsInRadius);
    }
    
    // If no location parameters, return all hospitals
    return NextResponse.json(hospitals);
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hospitals' },
      { status: 500 }
    );
  }
}); 