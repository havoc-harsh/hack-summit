"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import HospitalCard from "@/components/hospital-card";
import { Input } from "@/components/ui/input";
import AuthNavbar from "@/components/AuthNavbar";
import { Button } from "@/components/ui/button";
import { Search, X, MapPin, List } from "lucide-react";
import Link from "next/link";
import { Hospital } from "@/types/hospital";

// Dynamically import MapView with SSR disabled
const MapView = dynamic(() => import("@/components/map-view"), { 
  ssr: false,
  loading: () => <div className="h-[calc(100vh-180px)] flex items-center justify-center">Loading map...</div>
});



export default function HospitalPage() {
  const [mapMode, setMapMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [allHospitals,setAllHospitals] = useState<Hospital[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchHospitals = async () => {
    try {
      const response = await fetch('/api/hospital')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setAllHospitals(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  fetchHospitals()
}, []);

  // Filter hospitals based on search query
  const filteredHospitals = allHospitals.filter((hospital) =>
    hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hospital.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <AuthNavbar />
      <div className="max-w-7xl mx-auto p-4 pt-24">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 mb-8"
        >
          <div className="flex justify-between items-center">
            <motion.h1 
              className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent"
              whileHover={{ scale: 1.02 }}
            >
              Find Premium Healthcare
            </motion.h1>
            <div className="flex items-center gap-2">
              <Link href="/services">
                <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
                  Emergency Services
                </Button>
              </Link>
              <Button
                onClick={() => setMapMode(!mapMode)}
                className="flex items-center gap-2 border-sky-500 text-sky-600 hover:bg-sky-50"
              >
                {mapMode ? <List size={20} /> : <MapPin size={20} />}
                {mapMode ? "List View" : "Map View"}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500" />
              <Input
                placeholder="Search hospitals..."
                className="pl-10 pr-10 h-12 rounded-xl border-sky-100 focus:border-sky-500 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={18} />
                </Button>
              )}
            </div>
          </motion.div>
        </motion.header>

        {/* Fix JSX syntax */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mapMode ? "map" : "list"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {mapMode ? (
              <MapView hospitals={filteredHospitals} />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredHospitals.length > 0 ? (
                  filteredHospitals.map((hospital) => (
                    <HospitalCard key={hospital.id} hospital={hospital} />
                  ))
                ) : (
                  <p className="text-center text-gray-500 col-span-full">No hospitals found.</p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}