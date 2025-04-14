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
                defaultValue={session.data?.user.phone ?? ""}
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

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      signIn();
    } else {
      fetch(`/api/hospital/${session.user.id}/appointments`)
        .then((res) => res.json())
        .then((data) => setAppointments(data))
        .catch(console.error);
      fetchData("beds", setBedData);
      fetchData("blood", setBloodData);
      fetchData("oxygen", setOxygenData);
      fetchData("ambulance", setAmbulanceData);
      fetchData("doctors", setDoctors);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
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
              <div className="flex items-center gap-3 mb-5">
                <Bell className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-semibold">
                  Hospital Announcements
                </h2>
              </div>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-4 bg-gray-50 rounded-xl"
                  >
                    <h3 className="text-md font-bold text-gray-800">
                      {announcement.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {announcement.message}
                    </p>
                    <p className="text-xs text-gray-400">{announcement.date}</p>
                  </div>
                ))}
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