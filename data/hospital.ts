import { Hospital } from "@/types/hospital";

export async function getHospitals(): Promise<Hospital[]> {
  try {
    const response = await fetch('/api/hospital', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch hospitals: ${response.status}`);
    }

    const data = await response.json();
    
    // Ensure all service fields exist and are numbers
    const processedData = data.map((hospital: any) => ({
      ...hospital,
      ambulances: typeof hospital.ambulances === 'number' ? hospital.ambulances : 0,
      blood: typeof hospital.blood === 'number' ? hospital.blood : 0,
      oxygen: typeof hospital.oxygen === 'number' ? hospital.oxygen : 0,
      icu: typeof hospital.icu === 'number' ? hospital.icu : 0,
    }));
    
    return processedData;
  } catch (error) {
    console.error('Error fetching hospital data:', error);
    return [];
  }
}

// For backward compatibility with components still using the hospitals import
export const hospitals: Hospital[] = [];

// Helper function to get a hospital by ID
export async function getHospitalById(id: string | number): Promise<Hospital | undefined> {
  const hospitals = await getHospitals();
  return hospitals.find(h => String(h.id) === String(id));
}