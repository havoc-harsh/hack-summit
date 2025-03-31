'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ErrorBoundary from './ErrorBoundary';
// We'll replace date-fns with a simple function since it may not be installed
// import { format } from 'date-fns';

interface Symptom {
  symptom: string;
  count: number;
  frequency: number;
}

interface Alert {
  id: number;
  type: string;
  location: string;
  time: string;
  commonSymptoms: string[];
  symptomCounts: number[];
  symptomFrequencies: number[];
  possibleDiseases: string[];
  severity: string;
  precautions: string[];
  description: string;
  outbreakRadiusKm: number;
  centerLatitude: number;
  centerLongitude: number;
  appointmentsCount: number;
  thresholdUsed: number;
  hospitalId: number;
}

export default function AlertsPageContainer() {
  return (
    <ErrorBoundary>
      <AlertsPage />
    </ErrorBoundary>
  );
}

function AlertsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    
    if (status === 'authenticated' && session?.user?.id) {
      // Fetch alerts for the hospital
      const hospitalId = (session?.user as any)?.id; // Use the ID from the user as the hospital ID
      
      if (!hospitalId) {
        setError('No hospital ID found in session');
        setLoading(false);
        return;
      }
      
      fetchAlerts(hospitalId);
    }
  }, [status, session, router]);
  
  const fetchAlerts = async (hospitalId: string) => {
    try {
      console.log(`Fetching alerts for hospital ID: ${hospitalId}`);
      const response = await fetch(`/api/hospitals/${hospitalId}/alerts`);
      
      if (!response.ok) {
        console.error(`Error response: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch alerts: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Alerts data received:', data);
      
      // Format dates and handle empty fields for safer rendering
      const formattedAlerts = data.map((alert: any) => ({
        ...alert,
        // Ensure arrays are properly initialized if missing
        commonSymptoms: Array.isArray(alert.commonSymptoms) ? alert.commonSymptoms : [],
        symptomCounts: Array.isArray(alert.symptomCounts) ? alert.symptomCounts : [],
        symptomFrequencies: Array.isArray(alert.symptomFrequencies) ? alert.symptomFrequencies : [],
        possibleDiseases: Array.isArray(alert.possibleDiseases) ? alert.possibleDiseases : [],
        precautions: Array.isArray(alert.precautions) ? alert.precautions : []
      }));
      
      console.log('Formatted alerts:', formattedAlerts);
      setAlerts(formattedAlerts);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to load alerts. Please try again later.');
      setLoading(false);
    }
  };
  
  // Function to format the date
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) {
      return 'Unknown date';
    }
    
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
    } catch (e) {
      return 'Invalid date format';
    }
  };
  
  // Function to determine severity color
  const getSeverityColor = (severity: string | undefined) => {
    if (!severity) {
      return 'text-gray-500'; // Default color for undefined severity
    }
    
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-500';
      case 'low':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading alerts...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Outbreak Alerts</h1>
      
      {alerts.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p>No alerts found. You're all clear!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{alert.type || 'Alert'}</h2>
                    <p className="text-gray-500">{formatDate(alert.time)}</p>
                  </div>
                  <div className={`font-bold ${getSeverityColor(alert.severity)}`}>
                    {alert.severity || 'Unknown'} Severity
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="font-medium">Location: {alert.location || 'Unknown location'}</p>
                  <p className="text-sm text-gray-600">
                    Radius: {(alert.outbreakRadiusKm || 0).toFixed(1)} km • 
                    {alert.appointmentsCount || 0} appointments analyzed
                  </p>
                </div>
                
                {alert.description && (
                  <div className="mt-4">
                    <h3 className="font-semibold">Analysis</h3>
                    <p className="text-gray-700">{alert.description}</p>
                  </div>
                )}
                
                {alert.commonSymptoms && alert.commonSymptoms.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold">Common Symptoms</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {alert.commonSymptoms.map((symptom, index) => (
                        <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {symptom} {alert.symptomCounts && alert.symptomCounts[index] && `(${alert.symptomCounts[index]})`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {alert.possibleDiseases && alert.possibleDiseases.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold">Possible Diseases</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {alert.possibleDiseases.map((disease, index) => (
                        <div key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                          {disease}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {alert.precautions && alert.precautions.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold">Recommended Precautions</h3>
                    <ul className="list-disc pl-5 mt-1 text-gray-700">
                      {alert.precautions.map((precaution, index) => (
                        <li key={index}>{precaution}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="mt-6 border-t pt-4">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${alert.centerLatitude || 0},${alert.centerLongitude || 0}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View on map
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 