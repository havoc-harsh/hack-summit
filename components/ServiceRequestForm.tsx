// components/ServiceRequestForm.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Hospital } from "@/types/hospital";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function ServiceRequestForm({
  service,
  provider
}: {
  service: "ambulances" | "blood" | "oxygen" | "icu" | null;
  provider: Hospital;
}) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  if (!service) return null;

  const serviceNames = {
    ambulances: "Ambulance",
    blood: "Blood Units",
    oxygen: "Oxygen Cylinders",
    icu: "ICU Beds"
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Basic validation
      if (quantity <= 0 || quantity > provider[service]) {
        setError(`Please select a valid quantity (1-${provider[service]})`);
        return;
      }

      // Get user location (could use browser geolocation in a real app)
      const userLocation = {
        latitude: 30.7333, // Example coordinates (could be from user's profile)
        longitude: 76.7794
      };

      // Make sure hospitalId is a number
      const hospitalId = typeof provider.id === 'string' 
        ? parseInt(provider.id, 10) 
        : Number(provider.id);

      console.log("Hospital provider:", provider);
      console.log("Hospital ID normalized:", hospitalId);

      const requestData = {
        hospitalId,
        serviceType: service,
        quantity,
        status: "pending",
        patientName: session?.user?.name || "Anonymous",
        patientId: session?.user?.id || null,
        patientPhone: "Not provided", // Could be fetched from user profile
        reason: `Emergency ${serviceNames[service]} request`,
        location: userLocation,
        requestDate: new Date().toISOString()
      };

      console.log("Sending request data:", requestData);
      console.log("Hospital ID (type):", typeof hospitalId, hospitalId);

      // Try the simplified endpoint first
      const response = await fetch("/api/emergency-request/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      let responseData;
      try {
        responseData = await response.json();
        console.log("API response:", responseData);
        
        if (responseData.data) {
          console.log("Created request ID:", responseData.data.id, "for hospital:", responseData.data.hospitalId);
          
          // Save to localStorage for persistence
          const storedRequests = JSON.parse(localStorage.getItem('emergencyRequests') || '[]');
          
          // Ensure hospital ID is a number
          const requestToStore = {
            ...responseData.data,
            hospitalId: Number(responseData.data.hospitalId)
          };
          
          // Add request to localStorage
          storedRequests.push(requestToStore);
          localStorage.setItem('emergencyRequests', JSON.stringify(storedRequests));
          console.log("Saved request to localStorage, total requests:", storedRequests.length);
          
          // Log all emergency requests in localStorage for debugging
          console.log("Current localStorage emergency requests:");
          storedRequests.forEach((req: any, index: number) => {
            console.log(`Request #${index + 1}:`, {
              id: req.id,
              hospitalId: req.hospitalId,
              serviceType: req.serviceType,
              quantity: req.quantity,
              status: req.status,
              patient: req.patientName
            });
          });
        }
      } catch (jsonError) {
        console.error("Error parsing response JSON:", jsonError);
        throw new Error("Failed to parse server response");
      }

      if (!response.ok) {
        throw new Error(
          responseData?.details || 
          responseData?.error || 
          "Failed to submit request"
        );
      }

      // Create a direct backup in localStorage as an emergency request
      if (typeof window !== 'undefined') {
        try {
          // Additional backup to ensure the request is stored even if response.data is missing
          const now = new Date();
          const backupRequest = {
            id: Date.now(), 
            hospitalId: Number(hospitalId),
            serviceType: service,
            quantity,
            status: "pending",
            patientName: session?.user?.name || "Anonymous",
            patientId: session?.user?.id || null,
            patientPhone: "Not provided",
            reason: `Emergency ${serviceNames[service]} request`,
            requestDate: now.toISOString(),
            createdAt: now,
            updatedAt: now
          };
          
          const storedRequests = JSON.parse(localStorage.getItem('emergencyRequestsBackup') || '[]');
          storedRequests.push(backupRequest);
          localStorage.setItem('emergencyRequestsBackup', JSON.stringify(storedRequests));
          console.log("Created backup request in localStorage:", backupRequest);
        } catch (backupError) {
          console.error("Failed to create backup request:", backupError);
        }
      }

      // Navigate to confirmation page
      router.push(`/request-confirmation?service=${service}&hospitalName=${encodeURIComponent(provider.name)}&hospitalId=${hospitalId}`);
    } catch (err) {
      console.error("Error submitting request:", err);
      setError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4">Request {serviceNames[service]}</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-200">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Quantity Needed
          </label>
          <input
            id="quantity"
            type="number"
            min="1"
            max={provider[service]}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="border rounded-lg p-2 w-full"
            placeholder="Quantity"
          />
          <p className="mt-1 text-sm text-gray-500">
            Available: {provider[service]} {serviceNames[service]}
          </p>
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-sky-600 hover:bg-sky-700"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
    </div>
  );
}
