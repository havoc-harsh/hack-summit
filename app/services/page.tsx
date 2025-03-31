"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, ArrowLeft, Heart, Wind, Droplet, User } from "lucide-react";
import AuthNavbar from "@/components/AuthNavbar";
import { getHospitals} from "@/data/hospital";
import { Hospital } from "@/types/hospital";

// Define service configurations for UI styling
const serviceConfig = {
  ambulances: {
    color: "bg-green-100 text-green-800",
    border: "border-green-200",
    hover: "hover:bg-green-50",
    icon: <User size={18} className="mr-2" />
  },
  blood: {
    color: "bg-red-100 text-red-800",
    border: "border-red-200",
    hover: "hover:bg-red-50",
    icon: <Droplet size={18} className="mr-2" />
  },
  oxygen: {
    color: "bg-blue-100 text-blue-800",
    border: "border-blue-200",
    hover: "hover:bg-blue-50",
    icon: <Wind size={18} className="mr-2" />
  },
  icu: {
    color: "bg-purple-100 text-purple-800",
    border: "border-purple-200",
    hover: "hover:bg-purple-50",
    icon: <Heart size={18} className="mr-2" />
  },
} as const;

// Define valid services
const validServices = ["ambulances", "blood", "oxygen", "icu"] as const;
type ServiceKey = typeof validServices[number];

export default function ServicesPage() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allProviders, setAllProviders] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const data = await getHospitals();
        console.log("Fetched hospital data:", data);
        setAllProviders(data);
      } catch (err) {
        console.error('Error fetching hospitals:', err);
        setError(err instanceof Error ? err.message : 'Failed to load hospitals');
        setAllProviders([]); // Set empty array if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  // ✅ **Fixed Filtering Logic**
  const filteredProviders = allProviders.filter((provider) => {
    const matchesSearch =
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.location.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesService = true;
    if (selectedService && validServices.includes(selectedService as ServiceKey)) {
      const serviceKey = selectedService as ServiceKey;
      
      // Convert undefined/null to 0 to prevent filtering issues
      const availableQuantity = Number(provider[serviceKey] ?? 0);
      matchesService = availableQuantity > 0;
    }

    return matchesSearch && matchesService;
  });

  const handleServiceClick = (service: string) => {
    setSelectedService(selectedService === service ? "" : service);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <AuthNavbar />
      <div className="max-w-7xl mx-auto p-4 pt-24">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 mb-8">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.back()} variant="outline" className="text-sky-600 hover:bg-sky-50">
              <ArrowLeft size={20} className="mr-2" />
              Back to Hospitals
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              Emergency Services
            </h1>
          </div>

          {/* Service Selection Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(serviceConfig).map(([service, config]) => (
              <Button
                key={service}
                onClick={() => handleServiceClick(service)}
                className={`${config.border} ${selectedService === service ? config.color : ""} ${config.hover} h-14 text-lg font-semibold transition-colors`}
                variant="outline"
              >
                {service.charAt(0).toUpperCase() + service.slice(1)}
              </Button>
            ))}
          </div>

          {/* Search Bar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500" />
              <Input
                placeholder="Search providers..."
                className="pl-10 pr-10 h-12 rounded-xl border-sky-100 focus:border-sky-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button title="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" onClick={() => setSearchQuery("")}>
                  <X size={18} />
                </button>
              )}
            </div>
          </motion.div>
        </motion.header>

        {/* Display Filtered Results */}
        <AnimatePresence mode="wait">
          <motion.div key={selectedService + searchQuery} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full flex justify-center items-center p-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-12 w-12 border-4 border-t-sky-500 border-sky-200 rounded-full animate-spin"></div>
                  <p className="text-sky-600 font-medium">Loading hospitals...</p>
                </div>
              </div>
            ) : error ? (
              <div className="col-span-full text-center p-8">
                <p className="text-red-500 mb-2">Error loading hospitals</p>
                <p className="text-gray-500">{error}</p>
              </div>
            ) : filteredProviders.length > 0 ? (
              filteredProviders.map((provider) => (
                <ServiceProviderCard key={provider.id} provider={provider} service={selectedService} />
              ))
            ) : (
              <p className="text-center text-gray-500 col-span-full">
                No providers found for {selectedService || "this service"}.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// **Service Provider Card Component**
function ServiceProviderCard({ provider, service }: { provider: Hospital; service: string }) {
  const serviceData = service ? serviceConfig[service as ServiceKey] : null;
  
  // Get the quantity based on the selected service
  let quantity = null;
  if (service && validServices.includes(service as ServiceKey)) {
    const serviceKey = service as ServiceKey;
    quantity = provider[serviceKey] || 0;
  }

  return (
    <Link href={`/services/${service}/${provider.id}`}>
      <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 bg-white overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{provider.name}</h3>
              <p className="text-gray-500">{provider.location}</p>
            </div>
            {serviceData && quantity !== null && (
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${serviceData.color}`}>
                {serviceData.icon}
                {quantity} available
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-gray-600">Rating: 4.2</p>
            {service && <Button variant="link" className="text-sky-600 hover:underline">View Details</Button>}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}