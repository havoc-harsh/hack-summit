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
  const router = useRouter();
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      userId: session?.user.id,
      bloodType,
      allergies,
      medications,
      conditions,
      vaccinations,
      lastCheckup,
    };

    try {
      const res = await fetch("/api/medical-profile/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        router.push("/patient/dashboard");
      } else {
        console.error("Failed to submit form");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
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
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Submit
          </button>
        </form>
      </motion.div>
    </div>
  );
}