"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function RequestConfirmation() {
  const searchParams = useSearchParams();
  const service = searchParams.get("service");
  const hospitalName = searchParams.get("hospitalName");
  const hospitalId = searchParams.get("hospitalId");

  // Trigger an event to notify other components that a new request was submitted
  useEffect(() => {
    // Ensure localStorage requests are properly loaded in the confirmation page
    if (typeof window !== 'undefined') {
      // Make sure the event is only dispatched once
      const alreadyDispatched = sessionStorage.getItem('dispatchedRefresh');
      if (!alreadyDispatched && hospitalId) {
        console.log("Dispatching refreshEmergencyRequests event for hospital:", hospitalId);
        
        // Save the flag to session storage to prevent duplicate events
        sessionStorage.setItem('dispatchedRefresh', 'true');
        
        // Additional check to make sure requests exist in localStorage
        try {
          const storedRequests = JSON.parse(localStorage.getItem('emergencyRequests') || '[]');
          console.log("Confirmation page found", storedRequests.length, "requests in localStorage");
          
          // Filter for current hospital
          const forCurrentHospital = storedRequests.filter((req: any) => 
            Number(req.hospitalId) === Number(hospitalId)
          );
          
          console.log("Requests for hospital", hospitalId, ":", forCurrentHospital.length);
        } catch (error) {
          console.error("Error checking localStorage:", error);
        }
        
        // Dispatch the event for the dashboard to listen
        const event = new CustomEvent("refreshEmergencyRequests", { 
          detail: { hospitalId } 
        });
        window.dispatchEvent(event);
        
        // Dispatch multiple times with delays to ensure it's received
        setTimeout(() => {
          console.log("Sending follow-up refresh event...");
          window.dispatchEvent(new CustomEvent("refreshEmergencyRequests", { 
            detail: { hospitalId } 
          }));
        }, 1000);
        
        setTimeout(() => {
          console.log("Sending final refresh event...");
          window.dispatchEvent(new CustomEvent("refreshEmergencyRequests", { 
            detail: { hospitalId } 
          }));
          
          // Clear the flag
          sessionStorage.removeItem('dispatchedRefresh');
        }, 3000);
      }
    }
  }, [hospitalId]);

  // Service display names
  const serviceNames = {
    ambulances: "Ambulance",
    blood: "Blood Units",
    oxygen: "Oxygen Cylinders",
    icu: "ICU Beds",
  };

  const serviceName = service ? serviceNames[service as keyof typeof serviceNames] || service : "Service";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center relative"
      >
        {/* Close button */}
        <button 
          onClick={() => window.history.back()}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <X size={20} className="text-gray-500" />
        </button>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-12 h-12 text-green-600" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Request Submitted!</h1>
        
        <p className="text-gray-600 mb-6">
          Your emergency request for {serviceName} has been sent to {hospitalName || "the hospital"}. 
          They will review it shortly and contact you if needed.
        </p>

        <Button 
          onClick={() => window.history.back()}
          className="w-full bg-sky-600 hover:bg-sky-700 text-white"
        >
          Go Back
        </Button>
      </motion.div>
    </div>
  );
} 