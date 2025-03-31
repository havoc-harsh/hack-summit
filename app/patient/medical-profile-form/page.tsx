"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

export default function MedicalProfileForm() {
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [vaccinations, setVaccinations] = useState<string[]>([]);
  const [lastCheckup, setLastCheckup] = useState("");
  const [phone, setPhone] = useState("+91");
  const [phoneError, setPhoneError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    
    if (status === "loading") return;
    
    if (!session) {
      setError("You need to be logged in to create a medical profile. Redirecting to login...");
      setTimeout(() => router.push("/auth/patient/login"), 2000);
      return;
    }
    
    if (!session.user?.id) {
      setError("Your user account is missing required information. Please contact support.");
      console.error("Session exists but user ID is missing", session);
    }
  }, [session, status, router]);

  const validatePhone = (value: string) => {
    const phoneRegex = /^\+91[6-9]\d{9}$/;
    if (!phoneRegex.test(value)) {
      setPhoneError("Invalid Indian phone number format (+91 followed by 10 digits)");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value.startsWith("+91")) {
      setPhone("+91" + value.replace("+91", ""));
    } else {
      setPhone(value);
    }
  };

  const handleInput = (
    e: React.KeyboardEvent<HTMLInputElement>,
    maxLength: number
  ) => {
    if (e.currentTarget.value.length >= maxLength) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!validatePhone(phone)) {
      setSubmitting(false);
      return;
    }

    if (!session?.user?.id) {
      setError("User not authenticated. Redirecting to login...");
      setTimeout(() => router.push("/auth/patient/login"), 2000);
      setSubmitting(false);
      return;
    }

    const data = {
      userId: session.user.id,
      bloodType,
      allergies,
      medications,
      conditions,
      vaccinations,
      lastCheckup,
      phone,
    };

    try {
      const res = await fetch("/api/medical-profile/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(responseData.error || "Failed to submit profile");
      }

      router.push("/patient/dashboard");
    } catch (error) {
      console.error("Submission error:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const removeItem = (array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    const newArray = [...array];
    newArray.splice(index, 1);
    setArray(newArray);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full p-6 bg-white rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-bold mb-4">Complete Your Medical Profile</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
            {error.includes("User not found") && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="bg-red-100 text-red-800 hover:bg-red-200 py-1 px-3 rounded-md text-sm ml-2"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Blood Type</label>
            <select
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Select</option>
              {["A+","B+", "AB+", "O+"].map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              onKeyDown={(e) => handleInput(e, 13)}
              onBlur={() => validatePhone(phone)}
              className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 ${
                phoneError ? 'border-red-500' : ''
              }`}
              placeholder="+91XXXXXXXXXX"
              maxLength={13}
            />
            {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
            <p className="text-xs text-gray-500 mt-1">Format: +91 followed by 10 digits starting with 6-9</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Allergies</label>
            <input
              type="text"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  e.preventDefault();
                  setAllergies([...allergies, e.currentTarget.value.trim()]);
                  e.currentTarget.value = "";
                }
              }}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Type and press Enter"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {allergies.map((allergy, index) => (
                <span key={index} className="bg-gray-200 rounded-full px-3 py-1 text-sm flex items-center">
                  {allergy}
                  <button 
                    type="button"
                    onClick={() => removeItem(allergies, setAllergies, index)}
                    className="ml-1 text-gray-500 hover:text-red-500 focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Medications</label>
            <input
              type="text"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  e.preventDefault();
                  setMedications([...medications, e.currentTarget.value.trim()]);
                  e.currentTarget.value = "";
                }
              }}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Type and press Enter"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {medications.map((med, index) => (
                <span key={index} className="bg-gray-200 rounded-full px-3 py-1 text-sm flex items-center">
                  {med}
                  <button 
                    type="button"
                    onClick={() => removeItem(medications, setMedications, index)}
                    className="ml-1 text-gray-500 hover:text-red-500 focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Conditions</label>
            <input
              type="text"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  e.preventDefault();
                  setConditions([...conditions, e.currentTarget.value.trim()]);
                  e.currentTarget.value = "";
                }
              }}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Type and press Enter"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {conditions.map((condition, index) => (
                <span key={index} className="bg-gray-200 rounded-full px-3 py-1 text-sm flex items-center">
                  {condition}
                  <button 
                    type="button"
                    onClick={() => removeItem(conditions, setConditions, index)}
                    className="ml-1 text-gray-500 hover:text-red-500 focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Vaccinations</label>
            <input
              type="text"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  e.preventDefault();
                  setVaccinations([...vaccinations, e.currentTarget.value.trim()]);
                  e.currentTarget.value = "";
                }
              }}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Type and press Enter"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {vaccinations.map((vaccine, index) => (
                <span key={index} className="bg-gray-200 rounded-full px-3 py-1 text-sm flex items-center">
                  {vaccine}
                  <button 
                    type="button"
                    onClick={() => removeItem(vaccinations, setVaccinations, index)}
                    className="ml-1 text-gray-500 hover:text-red-500 focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Last Checkup</label>
            <input
              type="date"
              value={lastCheckup}
              onChange={(e) => setLastCheckup(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-2 px-4 bg-blue-500 text-white rounded-md ${
              submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}