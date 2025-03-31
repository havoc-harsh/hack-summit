
"use client";

import { useState, Dispatch, SetStateAction, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Settings,
  ClipboardList,
  Bed,
  Droplet,
  Ambulance,
  HeartPulse,
  Stethoscope,
  Activity,
  Clock,
  CalendarClock,
  Bell,
  LogOut,
  MapPin,
  Calendar,
  Phone,
} from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { Toaster } from "react-hot-toast";

interface BedData {
  ICU: number;
  General: number;
  Emergency: number;
  Maternity: number;
  Pediatric: number;
}

interface BloodData {
  A_Positive: number;
  B_Positive: number;
  O_Positive: number;
  AB_Positive: number;
}

interface OxygenData {
  "Oxygen Cylinders": number;
  "Liquid Oxygen": number;
}

interface AmbulanceData {
  total: number;
  "In Operation": number;
  "Under Maintenance": number;
}

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  shift: string;
  hospitalId: number;
}

interface Stat {
  satisfaction: number;
  recoveryRate: number;
  emergencyResponse: number;
}

interface EmergencyAlert {
  id: number;
  type: string;
  location: string;
  time: string;
}

interface Announcement {
  id: number;
  title: string;
  message: string;
  date: string;
}

interface Appointment {
  id: number;
  patient: string;
  phone: string;
  symptoms: string;
  date: string;
  time: string;
  location: string;
}

interface EmergencyRequest {
  id: number;
  serviceType: string;
  quantity: number;
  status: string;
  patientName: string;
  patientPhone: string;
  reason: string;
  requestDate: string;
}

const Modal = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
      {children}
    </div>
  </div>
);

const RadialProgress = ({
  percent,
  label,
  color,
}: {
  percent: number;
  label: string;
  color: string;
}) => (
  <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm">
    <div className="relative w-16 h-16">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          className="text-gray-100"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        <circle
          className={color}
          strokeWidth="10"
          strokeDasharray={`${percent * 2.83} 283`}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
        />
      </svg>
      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-semibold">
        {percent}%
      </span>
    </div>
    <div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-xs text-gray-400">Performance metric</p>
    </div>
  </div>
);

const AppointmentCard = ({ 
  appointment,
  onDelete 
}: { 
  appointment: Appointment;
  onDelete: (id: number) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={false}
      animate={{ height: isExpanded ? "auto" : "80px" }}
      className="overflow-hidden"
    >
      <div
        className={`p-4 bg-gray-50 rounded-xl cursor-pointer transition-colors ${
          isExpanded ? "bg-blue-50" : "hover:bg-blue-50"
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-800">{appointment.patient}</h3>
            <p className="text-sm text-gray-500">{appointment.time}</p>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="text-gray-400"
          >
            ▼
          </motion.div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 space-y-3 pt-4 border-t border-gray-200"
            >
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Symptoms</p>
                  <p className="text-gray-500 text-sm">{appointment.symptoms}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p className="text-gray-500 text-sm">{appointment.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Date</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(appointment.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Contact</p>
                  <p className="text-gray-500 text-sm">{appointment.phone}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => onDelete(appointment.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                >
                  Done
                </button>
                <button
                  onClick={() => onDelete(appointment.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                  Denied
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const Sidebar = ({
  isCollapsed,
  toggleSidebar,
  bedData,
  setBedData,
  bloodData,
  setBloodData,
  oxygenData,
  setOxygenData,
  ambulanceData,
  setAmbulanceData,
}: {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  bedData: BedData;
  setBedData: Dispatch<SetStateAction<BedData>>;
  bloodData: BloodData;
  setBloodData: Dispatch<SetStateAction<BloodData>>;
  oxygenData: OxygenData;
  setOxygenData: Dispatch<SetStateAction<OxygenData>>;
  ambulanceData: AmbulanceData;
  setAmbulanceData: Dispatch<SetStateAction<AmbulanceData>>;
}) => {
  const [activeModal, setActiveModal] = useState<
    "beds" | "blood" | "oxygen" | "ambulance" | "settings" | null
  >(null);
  const session = useSession();

  const updateResource = async (
    endpoint: string,
    data: BedData | BloodData | OxygenData | AmbulanceData
  ) => {
    try {
      const hospitalId = session.data?.user.id;
      if (!hospitalId) throw new Error("Hospital ID not found");

      const response = await fetch(`/api/hospital/${hospitalId}/${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`Failed to update ${endpoint}`);
      return await response.json();
    } catch (error) {
      console.error(`Error updating ${endpoint}:`, error);
      throw error;
    }
  };

  return (
    <div className={`bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 h-screen fixed left-0 top-0 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}>
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <Link href="/">
          <Image
            src="/medicare-logo-final.svg"
            alt="Medicare+"
            width={50}
            height={50}
            className="rounded-full"
          />
        </Link>
        {!isCollapsed && (
          <span className="text-xl font-bold text-gray-900">
            {session.data?.user.name}
          </span>
        )}
      </div>

      <nav className="p-4">
        <div className="space-y-2">
          <button
            onClick={() => setActiveModal("settings")}
            className={`w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-100/50 rounded-xl transition ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <Settings className="w-5 h-5 text-blue-600" />
            {!isCollapsed && "Settings"}
          </button>

          <div className="border-t border-gray-200 mt-3 pt-3 space-y-2">
            <button
              onClick={() => setActiveModal("beds")}
              className={`w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-100/50 rounded-xl transition ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <Bed className="w-5 h-5 text-blue-600" />
              {!isCollapsed && "Available Beds"}
            </button>

            <button
              onClick={() => setActiveModal("blood")}
              className={`w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-100/50 rounded-xl transition ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <Droplet className="w-5 h-5 text-blue-600" />
              {!isCollapsed && "Blood Bank"}
            </button>

            <button
              onClick={() => setActiveModal("oxygen")}
              className={`w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-100/50 rounded-xl transition ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <HeartPulse className="w-5 h-5 text-green-600" />
              {!isCollapsed && "Oxygen Supply"}
            </button>

            <button
              onClick={() => setActiveModal("ambulance")}
              className={`w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-100/50 rounded-xl transition ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <Ambulance className="w-5 h-5 text-purple-600" />
              {!isCollapsed && "Ambulance Details"}
            </button>

            <button
              onClick={() => signOut({ callbackUrl: "/auth/hospital/login" })}
              className={`w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-100/50 rounded-xl transition ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <LogOut className="w-5 h-5 text-red-600" />
              {!isCollapsed && "SignOut"}
            </button>
          </div>
        </div>
      </nav>

      {activeModal === "settings" && (
        <Modal onClose={() => setActiveModal(null)}>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" /> Hospital Settings
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Hospital Name</p>
              <input
                className="text-2xl font-bold text-blue-600 w-full bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-blue-500"
                defaultValue={session.data?.user.name ?? ""}
              />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Contact Number</p>
              <input
                className="text-2xl font-bold text-blue-600 w-full bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-blue-500"
                defaultValue={(session.data?.user as any)?.phone || "No phone number"}
              />
            </div>
          </div>
        </Modal>
      )}

      {activeModal === "beds" && (
        <Modal onClose={() => setActiveModal(null)}>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Bed className="w-5 h-5 text-blue-600" /> Bed Management
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(bedData).map(([type, count]) => (
              <div key={type} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">{type} Beds</p>
                <input
                  type="number"
                  value={count}
                  placeholder=".."
                  onChange={(e) => {
                    const updatedBedData = {
                      ...bedData,
                      [type]: parseInt(e.target.value) || 0,
                    };
                    setBedData(updatedBedData);
                    updateResource("beds", updatedBedData);
                  }}
                  className="text-2xl font-bold text-blue-600 w-full bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>
        </Modal>
      )}

      {activeModal === "blood" && (
        <Modal onClose={() => setActiveModal(null)}>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Droplet className="w-5 h-5 text-red-600" /> Blood Inventory
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(bloodData).map(([type, units]) => (
              <div key={type} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">
                  Type {type.replace("_", "+")}
                </p>
                <input
                  type="number"
                  value={units}
                  placeholder=".."
                  onChange={(e: any) => {
                    const updatedBloodData = {
                      ...bloodData,
                      [type]: parseInt(e.target.value) || 0,
                    };
                    setBloodData(updatedBloodData);
                    updateResource("blood", updatedBloodData);
                  }}
                  className="text-2xl font-bold text-red-600 w-full bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-red-500"
                />
              </div>
            ))}
          </div>
        </Modal>
      )}

      {activeModal === "oxygen" && (
        <Modal onClose={() => setActiveModal(null)}>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-green-600" /> Oxygen Supply
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(oxygenData).map(([type, quantity]) => (
              <div key={type} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">{type}</p>
                <input
                  type="number"
                  value={quantity}
                  placeholder=".."
                  onChange={(e) => {
                    const updatedOxygenData = {
                      ...oxygenData,
                      [type]: parseInt(e.target.value) || 0,
                    };
                    setOxygenData(updatedOxygenData);
                    updateResource("oxygen", updatedOxygenData);
                  }}
                  className="text-2xl font-bold text-green-600 w-full bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-green-500"
                />
              </div>
            ))}
          </div>
        </Modal>
      )}

      {activeModal === "ambulance" && (
        <Modal onClose={() => setActiveModal(null)}>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Ambulance className="w-5 h-5 text-purple-600" /> Ambulance Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(ambulanceData).map(([detail, value]) => (
              <div key={detail} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">{detail}</p>
                <input
                  type="number"
                  value={value}
                  placeholder=".."
                  onChange={(e) => {
                    const updatedAmbulanceData = {
                      ...ambulanceData,
                      [detail]: parseInt(e.target.value) || 0,
                    };
                    setAmbulanceData(updatedAmbulanceData);
                    updateResource("ambulance", updatedAmbulanceData);
                  }}
                  className="text-2xl font-bold text-purple-600 w-full bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-purple-500"
                />
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default function HospitalDashboard() {
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [bedData, setBedData] = useState<BedData>({
    ICU: 0,
    General: 0,
    Emergency: 0,
    Maternity: 0,
    Pediatric: 0,
  });
  const [bloodData, setBloodData] = useState<BloodData>({
    A_Positive: 0,
    B_Positive: 0,
    O_Positive: 0,
    AB_Positive: 0,
  });
  const [oxygenData, setOxygenData] = useState<OxygenData>({
    "Oxygen Cylinders": 0,
    "Liquid Oxygen": 0,
  });
  const [ambulanceData, setAmbulanceData] = useState<AmbulanceData>({
    total: 0,
    "In Operation": 0,
    "Under Maintenance": 0,
  });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [stats] = useState<Stat>({
    satisfaction: 92,
    recoveryRate: 85,
    emergencyResponse: 76,
  });
  const [emergencyAlerts] = useState<EmergencyAlert[]>([
    { id: 1, type: "Code Blue", location: "ER Room 3", time: "2 mins ago" },
    { id: 2, type: "Equipment Alert", location: "MRI Machine #2", time: "15 mins ago" },
  ]);
  const [announcements] = useState<Announcement[]>([
    {
      id: 1,
      title: "New COVID-19 Protocols",
      message: "All staff must wear masks at all times and follow social distancing guidelines.",
      date: "Today",
    },
    {
      id: 2,
      title: "Upcoming Maintenance",
      message: "The MRI machine will be undergoing maintenance tomorrow.",
      date: "Tomorrow",
    },
  ]);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>([]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      signIn();
    } else {
      console.log("Hospital dashboard loaded with user ID:", session.user.id);
      
      fetch(`/api/hospital/${session.user.id}/appointments`)
        .then((res) => res.json())
        .then((data) => setAppointments(data))
        .catch(console.error);
      fetchData("beds", setBedData);
      fetchData("blood", setBloodData);
      fetchData("oxygen", setOxygenData);
      fetchData("ambulance", setAmbulanceData);
      fetchData("doctors", setDoctors);
      
      // Load emergency requests
      const hospitalId = session.user.id;
      console.log("Loading emergency requests for hospital:", hospitalId);
      
      // First try to load from localStorage for immediate display
      if (typeof window !== 'undefined') {
        try {
          // Check both storage locations
          const primary = JSON.parse(localStorage.getItem('emergencyRequests') || '[]');
          const backup = JSON.parse(localStorage.getItem('emergencyRequestsBackup') || '[]');
          
          // Filter valid requests for this hospital
          const validRequests = [...primary, ...backup].filter(req => 
            Number(req.hospitalId) === Number(hospitalId) && 
            ["ambulances", "blood", "oxygen", "icu"].includes(req.serviceType)
          );
          
          // Remove duplicates by ID
          const uniqueRequests = Array.from(
            new Map(validRequests.map(item => [item.id, item])).values()
          );
          
          if (uniqueRequests.length > 0) {
            // Sort by date
            uniqueRequests.sort((a, b) => 
              new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
            );
            
            console.log(`Found ${uniqueRequests.length} emergency requests in localStorage`);
            setEmergencyRequests(uniqueRequests);
          }
        } catch (error) {
          console.error("Error loading emergency requests from localStorage:", error);
        }
      }
      
      // Then fetch from the API
      fetchEmergencyRequests();
      
      // Set up polling for emergency requests
      const intervalId = setInterval(fetchEmergencyRequests, 10000);
      
      // Set up event listener for refresh events
      const handleRefreshEvent = (event: any) => {
        const { hospitalId } = event.detail;
        if (hospitalId && hospitalId.toString() === session.user.id.toString()) {
          console.log("Refreshing emergency requests from event");
          fetchEmergencyRequests();
        }
      };
      
      window.addEventListener("refreshEmergencyRequests", handleRefreshEvent);
      
      return () => {
        clearInterval(intervalId);
        window.removeEventListener("refreshEmergencyRequests", handleRefreshEvent);
      };
    }
  }, [session, status]);

  const fetchData = async (endpoint: string, setData: (data: any) => void) => {
    try {
      const hospitalId = session?.user?.id;
      if (!hospitalId) throw new Error("Hospital ID not found");

      const response = await fetch(`/api/hospital/${hospitalId}/${endpoint}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch ${endpoint}`);
      }

      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    }
  };

  const debugLocalStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        console.log("============== EMERGENCY REQUESTS DEBUG ==============");
        
        // Check primary storage
        const storedRequests = JSON.parse(localStorage.getItem('emergencyRequests') || '[]');
        console.log("Total stored requests (primary):", storedRequests.length);
        
        // Check backup storage
        const backupRequests = JSON.parse(localStorage.getItem('emergencyRequestsBackup') || '[]');
        console.log("Total stored requests (backup):", backupRequests.length);
        
        const hospitalId = session?.user?.id;
        console.log("Current hospital ID:", hospitalId, "(type:", typeof hospitalId, ")");
        
        // Log all requests from primary storage
        console.log("--- PRIMARY STORAGE ---");
        storedRequests.forEach((req: any, index: number) => {
          console.log(`Request ${index + 1}:`, {
            id: req.id,
            hospitalId: req.hospitalId,
            type: req.serviceType,
            status: req.status,
            matches: Number(req.hospitalId) === Number(hospitalId)
          });
        });
        
        // Log all requests from backup storage
        console.log("--- BACKUP STORAGE ---");
        backupRequests.forEach((req: any, index: number) => {
          console.log(`Backup ${index + 1}:`, {
            id: req.id,
            hospitalId: req.hospitalId,
            type: req.serviceType,
            status: req.status,
            matches: Number(req.hospitalId) === Number(hospitalId)
          });
        });
        
        // Filter for current hospital from both storage locations
        const forCurrentHospital = [
          ...storedRequests.filter((req: any) => Number(req.hospitalId) === Number(hospitalId)),
          ...backupRequests.filter((req: any) => Number(req.hospitalId) === Number(hospitalId))
        ];
        
        // Remove duplicates by ID
        const uniqueRequests = Array.from(
          new Map(forCurrentHospital.map(item => [item.id, item])).values()
        );
        
        console.log("Unique requests for current hospital:", uniqueRequests.length);
        console.log("============================================");
        
        // Add these requests to the state if we found some
        if (uniqueRequests.length > 0) {
          // Sort by date, newest first
          uniqueRequests.sort((a: any, b: any) => {
            return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime();
          });
          
          setEmergencyRequests(uniqueRequests);
          toast.success(`Loaded ${uniqueRequests.length} emergency requests`);
        }
      } catch (error) {
        console.error("Error debugging localStorage:", error);
      }
    }
  };

  const fetchEmergencyRequests = async () => {
    try {
      const hospitalId = session?.user?.id;
      console.log(`[${new Date().toISOString()}] Fetching emergency requests for hospital ${hospitalId}`);
      
      // Get requests from server API
      const response = await fetch(`/api/emergency-request/submit?hospitalId=${hospitalId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store" // Ensure fresh data
      });
      
      console.log("Emergency requests API response status:", response.status);
      
      // Get requests from both localStorage locations
      let localRequests: any[] = [];
      if (typeof window !== 'undefined') {
        try {
          // Get from primary storage
          const storedRequests = JSON.parse(localStorage.getItem('emergencyRequests') || '[]');
          console.log("Raw localStorage requests (primary):", storedRequests.length);
          
          // Get from backup storage
          const backupRequests = JSON.parse(localStorage.getItem('emergencyRequestsBackup') || '[]');
          console.log("Raw localStorage requests (backup):", backupRequests.length);
          
          // Log all requests to help debug
          [...storedRequests, ...backupRequests].forEach((req: any, index: number) => {
            console.log(`LocalStorage Request #${index + 1}:`, {
              id: req.id,
              hospitalId: req.hospitalId,
              type: req.serviceType,
              patient: req.patientName,
              status: req.status,
              date: req.requestDate
            });
          });
          
          // Filter requests from both sources
          const primaryFiltered = storedRequests.filter((req: any) => {
            const reqHospitalId = Number(req.hospitalId);
            const currentHospitalId = Number(hospitalId);
            return reqHospitalId === currentHospitalId;
          });
          
          const backupFiltered = backupRequests.filter((req: any) => {
            const reqHospitalId = Number(req.hospitalId);
            const currentHospitalId = Number(hospitalId);
            return reqHospitalId === currentHospitalId;
          });
          
          // Combine both filtered lists
          localRequests = [...primaryFiltered, ...backupFiltered];
          
          // Remove duplicates by ID
          localRequests = Array.from(
            new Map(localRequests.map(item => [item.id, item])).values()
          );
          
          console.log("Combined filtered localStorage requests:", localRequests.length);
        } catch (localError) {
          console.error("Error reading from localStorage:", localError);
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("API error:", errorData || response.statusText);
        toast.error("Failed to fetch emergency requests from server");
        
        // Fall back to localStorage data only if API failed
        if (localRequests.length > 0) {
          console.log("Using localStorage requests as fallback");
          setEmergencyRequests(localRequests);
        }
        return;
      }
      
      // Combine server data with localStorage data
      const serverData = await response.json();
      console.log("Fetched emergency requests from server:", serverData, "Count:", serverData.length);
      
      // Merge requests from both sources (prefer server data for duplicates)
      const serverIds = serverData.map((req: any) => req.id);
      const uniqueLocalRequests = localRequests.filter((req: any) => !serverIds.includes(req.id));
      
      const allRequests = [...serverData, ...uniqueLocalRequests];
      console.log("Combined emergency requests:", allRequests.length);
      
      // Filter out any potential hardcoded test data by ensuring we only accept real service types
      const validServiceTypes = ["ambulances", "blood", "oxygen", "icu"];
      const filteredRequests = allRequests.filter((req: any) => {
        const isValidService = validServiceTypes.includes(req.serviceType);
        if (!isValidService) {
          console.log(`Filtering out request with invalid service type: ${req.serviceType}`);
        }
        return isValidService;
      });
      
      // Sort by date, newest first
      filteredRequests.sort((a: any, b: any) => {
        return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime();
      });
      
      console.log("Final filtered emergency requests:", filteredRequests.length);
      setEmergencyRequests(filteredRequests);
    } catch (error) {
      console.error("Error fetching emergency requests:", error);
      toast.error("Failed to fetch emergency requests");
      
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        try {
          const storedRequests = JSON.parse(localStorage.getItem('emergencyRequests') || '[]');
          const hospitalId = session?.user?.id;
          const localRequests = storedRequests.filter((req: any) => {
            const reqHospitalId = Number(req.hospitalId);
            const currentHospitalId = Number(hospitalId);
            return reqHospitalId === currentHospitalId;
          });
          
          if (localRequests.length > 0) {
            console.log("Using localStorage requests as fallback after error");
            setEmergencyRequests(localRequests);
          }
        } catch (localError) {
          console.error("Error reading from localStorage fallback:", localError);
        }
      }
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    try {
      const hospitalId = session?.user?.id;
      if (!hospitalId) throw new Error("Hospital ID not found");

      const response = await fetch(
        `/api/hospital/${hospitalId}/appointments/${appointmentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete appointment");
      setAppointments(appointments.filter((a) => a.id !== appointmentId));
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  const handleDeleteDoctor = async (id: number) => {
    try {
      const hospitalId = session?.user?.id;
      if (!hospitalId) throw new Error("Hospital ID not found");

      const response = await fetch(
        `/api/hospital/${hospitalId}/doctors?id=${id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Failed to delete doctor");
      setDoctors(doctors.filter((doc) => doc.id !== id));
    } catch (error) {
      console.error("Error deleting doctor:", error);
    }
  };

  const handleUpdateDoctor = async (updatedDoctor: Doctor) => {
    try {
      const hospitalId = session?.user?.id;
      if (!hospitalId) throw new Error("Hospital ID not found");

      const response = await fetch(`/api/hospital/${hospitalId}/doctors`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updatedDoctor.id,
          name: updatedDoctor.name,
          specialization: updatedDoctor.specialization,
          shift: updatedDoctor.shift,
        }),
      });

      if (!response.ok) throw new Error("Failed to update doctor");
      const data = await response.json();
      setDoctors(doctors.map((doc) => (doc.id === data.id ? data : doc)));
      setEditingDoctor(null);
    } catch (error) {
      console.error("Error updating doctor:", error);
    }
  };

  const handleSaveDoctor = async () => {
    if (!editingDoctor) return;

    try {
      const hospitalId = session?.user?.id;
      if (!hospitalId) throw new Error("Hospital ID not found");

      if (editingDoctor.id === 0) {
        const response = await fetch(`/api/hospital/${hospitalId}/doctors`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...editingDoctor,
            hospitalId: Number(hospitalId),
          }),
        });

        if (!response.ok) throw new Error("Failed to add doctor");
        const newDoctor = await response.json();
        setDoctors([...doctors, newDoctor]);
      } else {
        await handleUpdateDoctor(editingDoctor);
      }
      setEditingDoctor(null);
    } catch (error) {
      console.error("Error saving doctor:", error);
    }
  };

  // Add these functions to handle request status updates
  const handleUpdateRequestStatus = async (requestId: number, status: string) => {
    try {
      const response = await fetch(`/api/emergency-request/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Update the UI by refetching emergency requests
        fetchEmergencyRequests();
      } else {
        console.error('Failed to update request status');
      }
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  // Add these functions to the HospitalDashboard component where other handler functions are defined
  const handleApproveRequest = async (id: number) => {
    try {
      const response = await fetch(`/api/emergency-request/submit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "approved" }),
      });

      // Also update in localStorage for persistence
      if (typeof window !== 'undefined') {
        try {
          const storedRequests = JSON.parse(localStorage.getItem('emergencyRequests') || '[]');
          const updatedRequests = storedRequests.map((req: any) => {
            if (Number(req.id) === Number(id)) {
              return { ...req, status: "approved", updatedAt: new Date() };
            }
            return req;
          });
          localStorage.setItem('emergencyRequests', JSON.stringify(updatedRequests));
          console.log("Updated request status in localStorage");
        } catch (localError) {
          console.error("Error updating localStorage:", localError);
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("API error:", errorData || response.statusText);
        toast.error("Failed to approve request");
        return;
      }

      // Update the UI by refreshing the requests
      fetchEmergencyRequests();
      toast.success("Request approved successfully");
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request");
      // Still update the UI since we updated localStorage
      fetchEmergencyRequests();
    }
  };

  const handleRejectRequest = async (id: number) => {
    try {
      const response = await fetch(`/api/emergency-request/submit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "rejected" }),
      });

      // Also update in localStorage for persistence
      if (typeof window !== 'undefined') {
        try {
          const storedRequests = JSON.parse(localStorage.getItem('emergencyRequests') || '[]');
          const updatedRequests = storedRequests.map((req: any) => {
            if (Number(req.id) === Number(id)) {
              return { ...req, status: "rejected", updatedAt: new Date() };
            }
            return req;
          });
          localStorage.setItem('emergencyRequests', JSON.stringify(updatedRequests));
          console.log("Updated request status in localStorage");
        } catch (localError) {
          console.error("Error updating localStorage:", localError);
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("API error:", errorData || response.statusText);
        toast.error("Failed to reject request");
        return;
      }

      // Update the UI by refreshing the requests
      fetchEmergencyRequests();
      toast.success("Request rejected successfully");
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
      // Still update the UI since we updated localStorage
      fetchEmergencyRequests();
    }
  };

  // Add this function to create a test emergency request
  const createTestRequest = () => {
    const hospitalId = session?.user?.id;
    if (!hospitalId) {
      toast.error("Hospital ID not found");
      return;
    }
    
    const testRequest = {
      id: Date.now(),
      hospitalId: Number(hospitalId),
      serviceType: ["ambulances", "blood", "oxygen", "icu"][Math.floor(Math.random() * 4)],
      quantity: Math.floor(Math.random() * 5) + 1,
      status: "pending",
      patientName: "Test Patient",
      patientId: null,
      patientPhone: "555-123-4567",
      reason: "Test emergency request",
      latitude: 30.7333,
      longitude: 76.7794,
      requestDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        const storedRequests = JSON.parse(localStorage.getItem('emergencyRequests') || '[]');
        storedRequests.push(testRequest);
        localStorage.setItem('emergencyRequests', JSON.stringify(storedRequests));
        console.log("Added test request to localStorage");
        
        // Update UI
        fetchEmergencyRequests();
        toast.success("Test request created");
      } catch (localError) {
        console.error("Error adding test request:", localError);
        toast.error("Failed to create test request");
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <Toaster position="top-right" />
      
      <header className="border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 bg-white dark:bg-gray-900">
        <Sidebar
          isCollapsed={isCollapsed}
          toggleSidebar={() => setIsCollapsed(!isCollapsed)}
          bedData={bedData}
          setBedData={setBedData}
          bloodData={bloodData}
          setBloodData={setBloodData}
          oxygenData={oxygenData}
          setOxygenData={setOxygenData}
          ambulanceData={ambulanceData}
          setAmbulanceData={setAmbulanceData}
        />
      </header>

      <main className={`transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-64"} pt-20 p-8`}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Hospital Command Center</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl shadow-sm border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Bed className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available Beds</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {Object.values(bedData).reduce((a, b) => a + b, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-2xl shadow-sm border border-red-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Droplet className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blood Units</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {Object.values(bloodData).reduce((a, b) => a + b, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-2xl shadow-sm border border-green-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Stethoscope className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Doctors</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {doctors.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-2xl shadow-sm border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Ambulance className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ambulances</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {ambulanceData.total}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-5">
                <Bell className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-semibold">Emergency Alerts</h2>
              </div>
              <div className="space-y-4">
                {emergencyAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 bg-red-50 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-red-700">
                        {alert.type}
                      </span>
                      <span className="text-xs text-red-500">{alert.time}</span>
                    </div>
                    <p className="text-sm text-red-600">{alert.location}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-5">
                <CalendarClock className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
              </div>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onDelete={handleDeleteAppointment}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <Bell className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-semibold">
                    Emergency Requests
                  </h2>
                </div>
                <button 
                  onClick={() => {
                    const hospitalId = session?.user?.id;
                    // Only show real patient emergency requests, not test or hardcoded data
                    if (typeof window !== 'undefined') {
                      try {
                        // Check both localStorage locations for emergency requests
                        const primary = JSON.parse(localStorage.getItem('emergencyRequests') || '[]');
                        const backup = JSON.parse(localStorage.getItem('emergencyRequestsBackup') || '[]');
                        
                        // Combine and filter by this hospital ID
                        const combined = [...primary, ...backup].filter(req => 
                          Number(req.hospitalId) === Number(hospitalId) && 
                          ["ambulances", "blood", "oxygen", "icu"].includes(req.serviceType)
                        );
                        
                        // Remove duplicates
                        const unique = Array.from(
                          new Map(combined.map(item => [item.id, item])).values()
                        );
                        
                        // Sort by date
                        unique.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
                        
                        // Update state
                        if (unique.length > 0) {
                          setEmergencyRequests(unique);
                          toast.success(`Found ${unique.length} emergency requests`);
                        } else {
                          toast.error("No emergency requests found for this hospital");
                        }
                      } catch (error) {
                        console.error("Error refreshing emergency requests:", error);
                      }
                    }
                    
                    // Also try the API endpoint
                    fetchEmergencyRequests();
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>Refresh</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 2v6h-6"></path>
                    <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                    <path d="M3 22v-6h6"></path>
                    <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                {emergencyRequests && emergencyRequests.length > 0 ? (
                  emergencyRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-4 bg-gray-50 rounded-xl border-l-4 border-red-500"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {request.serviceType?.charAt(0).toUpperCase() + request.serviceType?.slice(1) || "Service"} Request - {request.quantity || 0} units
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{request.reason || "Emergency request"}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === "approved" ? "bg-green-100 text-green-800" : 
                              request.status === "rejected" ? "bg-red-100 text-red-800" : 
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {request.status || "pending"}
                            </div>
                            <p className="text-xs text-gray-400">
                              {request.requestDate ? new Date(request.requestDate).toLocaleString() : "Unknown date"}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                            disabled={request.status === "approved" || request.status === "rejected"}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                            disabled={request.status === "approved" || request.status === "rejected"}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-gray-400 text-xs flex flex-col">
                          <span className="inline-block">{request.patientName || "Anonymous"}</span>
                          {request.patientPhone && (
                            <span className="inline-block">{request.patientPhone}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No emergency requests at this time</p>
                    <p className="text-sm text-gray-400 mt-2">When patients submit emergency service requests, they will appear here</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-6 h-6 text-amber-600" />
                <h2 className="text-xl font-semibold">Performance Metrics</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RadialProgress
                  percent={stats.satisfaction}
                  label="Patient Satisfaction"
                  color="text-amber-500"
                />
                <RadialProgress
                  percent={stats.recoveryRate}
                  label="Recovery Rate"
                  color="text-green-500"
                />
                <RadialProgress
                  percent={stats.emergencyResponse}
                  label="Emergency Response"
                  color="text-red-500"
                />
              </div>
            </div>

            <div
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <div className="flex items-center gap-3 mb-5">
                <Stethoscope className="w-6 h-6 text-teal-600" />
                <h2 className="text-xl font-semibold">Medical Team</h2>
              </div>
              <div className="space-y-4">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-medium">{doctor.name}</h3>
                    <p className="text-sm text-gray-600">
                      {doctor.specialization}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {doctor.shift}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-2xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Manage Doctors
            </h2>
            <div className="flex justify-between mb-4">
              <button
                onClick={() =>
                  setEditingDoctor({
                    id: 0,
                    name: "",
                    specialization: "",
                    shift: "",
                    hospitalId: Number(session?.user?.id) || 0,
                  })
                }
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Add Doctor
              </button>
              <input
                type="text"
                placeholder="Search doctors by name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            {editingDoctor?.id === 0 && (
              <div className="p-4 bg-gray-50 rounded-xl mb-4 border border-teal-200">
                <input
                  type="text"
                  value={editingDoctor.name}
                  onChange={(e) =>
                    setEditingDoctor({ ...editingDoctor, name: e.target.value })
                  }
                  placeholder="Name"
                  className="w-full p-2 mb-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={editingDoctor.specialization}
                  onChange={(e) =>
                    setEditingDoctor({
                      ...editingDoctor,
                      specialization: e.target.value,
                    })
                  }
                  placeholder="Specialization"
                  className="w-full p-2 mb-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={editingDoctor.shift}
                  onChange={(e) =>
                    setEditingDoctor({ ...editingDoctor, shift: e.target.value })
                  }
                  placeholder="Shift (e.g., 08:00 - 16:00)"
                  className="w-full p-2 mb-2 border border-gray-300 rounded-lg"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveDoctor}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingDoctor(null)}
                    className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {doctors
                .filter((doctor) =>
                  doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((doctor) => (
                  <div
                    key={doctor.id}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    {editingDoctor?.id === doctor.id ? (
                      <div>
                        <input
                          type="text"
                          value={editingDoctor.name}
                          onChange={(e) =>
                            setEditingDoctor({
                              ...editingDoctor,
                              name: e.target.value,
                            })
                          }
                          placeholder="Name"
                          className="w-full p-2 mb-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          value={editingDoctor.specialization}
                          onChange={(e) =>
                            setEditingDoctor({
                              ...editingDoctor,
                              specialization: e.target.value,
                            })
                          }
                          placeholder="Specialization"
                          className="w-full p-2 mb-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          value={editingDoctor.shift}
                          onChange={(e) =>
                            setEditingDoctor({
                              ...editingDoctor,
                              shift: e.target.value,
                            })
                          }
                          placeholder="Shift (e.g., 08:00 - 16:00)"
                          className="w-full p-2 mb-2 border border-gray-300 rounded-lg"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveDoctor}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingDoctor(null)}
                            className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-medium text-lg">{doctor.name}</h3>
                        <p className="text-sm text-gray-600">
                          {doctor.specialization}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {doctor.shift}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => setEditingDoctor(doctor)}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDoctor(doctor.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}