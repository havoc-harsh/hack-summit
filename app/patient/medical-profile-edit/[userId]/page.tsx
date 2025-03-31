"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { AlertCircle } from "lucide-react";

export default function EditMedicalProfileForm() {
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [vaccinations, setVaccinations] = useState<string[]>([]);
  const [lastCheckup, setLastCheckup] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
  const router = useRouter();
  const params = useParams<{ userId: string }>();
  const { data: session } = useSession();
  const userId = params.userId;

  // Fetch existing profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Debug session ID vs URL ID
        console.log("Session ID:", session?.user.id, "Type:", typeof session?.user.id);
        console.log("URL userId:", userId, "Type:", typeof userId);
        
        const response = await fetch(`/api/medical-profile/${userId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }
        
        const data = await response.json();
        
        // Populate form fields
        setBloodType(data.bloodType || "");
        setAllergies(data.allergies || []);
        setMedications(data.medications || []);
        setConditions(data.conditions || []);
        setVaccinations(data.vaccinations || []);
        setLastCheckup(data.lastCheckup ? new Date(data.lastCheckup).toISOString().split('T')[0] : "");
      } catch (err) {
        setError("Failed to load profile data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert both values to strings for comparison
    if (String(session?.user.id) !== String(userId)) {
      setError("You don't have permission to edit this profile");
      return;
    }

    try {
      const response = await fetch("/api/medical-profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(userId),
          bloodType,
          allergies,
          medications,
          conditions,
          vaccinations,
          lastCheckup,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      router.push("/patient/dashboard");
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      console.error(err);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    // Convert both values to strings for comparison
    if (String(session?.user.id) !== String(userId)) {
      setError("You don't have permission to delete this profile");
      return;
    }

    try {
      const response = await fetch(`/api/medical-profile/delete?userId=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete profile");
      }

      router.push("/patient/dashboard");
    } catch (err) {
      setError("Failed to delete profile. Please try again.");
      console.error(err);
    }
  };

  const removeItem = (array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    const newArray = [...array];
    newArray.splice(index, 1);
    setArray(newArray);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <p>Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full p-6 bg-white rounded-lg shadow-md"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Medical Profile</h2>
          <button
            type="button"
            onClick={() => router.push("/patient/dashboard")}
            className="text-blue-500 hover:text-blue-700"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
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
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
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

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex-grow"
            >
              Update Profile
            </button>
            
            {!deleteConfirm ? (
              <button
                type="button"
                onClick={() => setDeleteConfirm(true)}
                className="py-2 px-4 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
              >
                Delete
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDelete}
                className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 animate-pulse"
              >
                Confirm Delete
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
} 