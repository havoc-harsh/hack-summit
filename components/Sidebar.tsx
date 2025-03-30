"use client";
import Link from "next/link";
import React ,{useState} from "react";
import { 
  User, Home, Settings, Hospital, AlertTriangle, Ambulance, 
  Shield, Bed, Droplet, BrainCircuit, ChevronDown, ChevronUp,ChevronRight,ChevronLeft ,Clock, Pill, AlertCircle, HeartPulse, ClipboardList, Star, Stethoscope
} from "lucide-react";
import Navbar from "@/components/Navbar";

const Sidebar = ({ isCollapsed, toggleSidebar }: { isCollapsed: boolean; toggleSidebar: () => void }) => {
    const [isServicesOpen, setIsServicesOpen] = useState(true);
  
    return (
      <div className={`bg-gray-100 border-r border-gray-300 h-screen fixed left-0 top-0 transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}>
        {/* Logo & Toggle Button */}
        <div className="p-4 border-b border-gray-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full" />
            {!isCollapsed && <span className="text-xl font-bold text-gray-900">medicare</span>}
          </div>
          <button onClick={toggleSidebar} className="text-gray-700">
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
  
        <nav className="p-4">
          <div className="space-y-2">
            <Link href="/patient/dashboard">
              <button className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-400/20 rounded-lg transition">
                <Home className="w-5 h-5 text-blue-600" />
                {!isCollapsed && <span>Dashboard</span>}
              </button>
            </Link>
            {/* Services Section */}
            <div className="border-t border-gray-300 mt-3 pt-3">
              <button 
                onClick={() => setIsServicesOpen(!isServicesOpen)} 
                className={`w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-400/20 rounded-lg transition ${isCollapsed ? "justify-center" : ""}`}
              >
                <Shield className="w-5 h-5 text-blue-600" />
                {!isCollapsed && <span>Services</span>}
                {!isCollapsed && (isServicesOpen ? <ChevronUp className="ml-auto w-4 h-4" /> : <ChevronDown className="ml-auto w-4 h-4" />)}
              </button>
  
              {isServicesOpen && !isCollapsed && (
                              <div className="space-y-1 pl-6">
                {[
                  { icon: AlertTriangle, label: "Emergency" ,route:"/services"},
                  { icon: Ambulance, label: "Ambulances" ,route:"/patient/dashboard/ambulances"},
                  { icon: Shield, label: "Oxygen Cylinder" ,route:"/patient/dashboard/oxygen"},
                  { icon: Bed, label: "Available Beds" ,route:"/patient/dashboard/beds"},
                  { icon: Droplet, label: "Blood Bank" ,route:"/patient/dashboard/blood-bank"},
                  { icon: BrainCircuit, label: "AI Assistance" ,route:"/patient/dashboard"},
                ].map(({ icon: Icon, label , route}, idx) => (
                  <Link href={route}>
                  <button
                    className={`w-full flex items-center gap-3 p-2 text-gray-700 hover:bg-blue-400/20 rounded-lg transition ${
                      isCollapsed ? "justify-center" : ""
                    }`}
                  >
                    <Icon className="w-4 h-4 text-blue-600" />
                    {!isCollapsed && label}
                  </button>
                  </Link>
                ))
                
                
                }

              </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    );
  };
  
export default Sidebar;