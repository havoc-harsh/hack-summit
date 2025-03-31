"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from 'axios';
import {
  User,
  Home,
  Settings,
  Hospital,
  AlertTriangle,
  Ambulance,
  Shield,
  Bed,
  Droplet,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  LogOut,
  Pill,
  AlertCircle,
  HeartPulse,
  ClipboardList,
  Star,
  Stethoscope,
  Calendar,
  Clock,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NotificationBell } from "@/components/ui/notification-bell";
import { useNotifications } from "@/context/notifications-context";

// SidebarProps interface
interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  onProfileClick: () => void;
}

// Sidebar component
const Sidebar = ({ isCollapsed, toggleSidebar, onProfileClick }: SidebarProps) => {
  return (
    <div className={`bg-gray-100 border-r border-gray-300 h-screen fixed left-0 top-0 transition-all duration-300 z-20 ${isCollapsed ? "w-20" : "w-64"}`}>
      <div className="p-4 border-b border-gray-300 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full" />
        {!isCollapsed && <span className="text-xl font-bold text-gray-900">MediCare+</span>}
      </div>

      <nav className="p-4">
        <div className="space-y-2">
          <button
            onClick={onProfileClick}
            className={`w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-400/20 rounded-lg transition ${isCollapsed ? "justify-center" : ""}`}
          >
            <User className="w-5 h-5 text-blue-600" />
            {!isCollapsed && "Profile"}
          </button>

          <Link href={`/patient/dashboard`}>
            <button className={`w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-400/20 rounded-lg transition ${isCollapsed ? "justify-center" : ""}`}>
              <Home className="w-5 h-5 text-blue-600" />
              {!isCollapsed && "Home"}
            </button>
          </Link>

          <button className={`w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-400/20 rounded-lg transition ${isCollapsed ? "justify-center" : ""}`}>
            <Settings className="w-5 h-5 text-blue-600" />
            {!isCollapsed && "Settings"}
          </button>

          <Link href={'/hospital'} className={`w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-400/20 rounded-lg transition ${isCollapsed ? "justify-center" : ""}`}>
            <Hospital className="w-5 h-5 text-blue-600" />
            {!isCollapsed && "Hospitals"}
          </Link>
          
          {/* Notification Bell */}
          <div className={`w-full flex items-center gap-3 p-3 text-gray-700 rounded-lg transition ${isCollapsed ? "justify-center" : ""}`}>
            {isCollapsed ? (
              <NotificationBell />
            ) : (
              <div className="flex justify-between items-center w-full">
                <span>Notifications</span>
                <NotificationBell />
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto pt-4">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-400/20 rounded-lg transition ${isCollapsed ? "justify-center" : ""}`}
          >
            <LogOut className="w-5 h-5 text-red-600" />
            {!isCollapsed && "Log Out"}
          </button>
        </div>
      </nav>
    </div>
  );
};

// MedicalProfile interface
interface MedicalProfile {
  id: number;
  bloodType: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
  vaccinations: string[];
  lastCheckup: Date;
  userId: number;
}

// Define Appointment interface for type safety
interface Appointment {
  id: number;
  date: string;
  time: string;
  patient: string;
  hospitalId: number;
  hospitalName: string;
  symptoms: string;
  status: string;
  paymentStatus: string;
}

// AIInstructions interface
interface AIInstructions {
  status: string;
  instructions: {
    dos: string[];
    donts: string[];
  };
  user_id?: number;
}

// PatientDashboard component
export default function PatientDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [medicalProfile, setMedicalProfile] = useState<MedicalProfile | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructions, setInstructions] = useState<AIInstructions | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState('');
  const session = useSession();
  const userId = session.data?.user.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const { notifications, addNotification } = useNotifications();

  // Fetch medical profile on component mount or when userId changes
  useEffect(() => {
    const fetchMedicalProfile = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/medical-profile/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch medical profile');
        const data = await response.json();

        setMedicalProfile({
          ...data,
          lastCheckup: new Date(data.lastCheckup)
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalProfile();
  }, [userId]);

  // Listen for appointment status updates
  useEffect(() => {
    if (!userId) return;
    
    // Function to handle appointment status updates
    const handleAppointmentStatusUpdate = (event: CustomEvent) => {
      // Refresh appointments list when we receive status updates
      fetchAppointments();
    };
    
    // Add event listener
    window.addEventListener(
      'appointment_status_update', 
      handleAppointmentStatusUpdate as EventListener
    );
    
    // Cleanup
    return () => {
      window.removeEventListener(
        'appointment_status_update', 
        handleAppointmentStatusUpdate as EventListener
      );
    };
  }, [userId]);

  // Fetch upcoming appointments
  const fetchAppointments = async () => {
    if (!userId) return;

    try {
      setLoadingAppointments(true);
      const response = await fetch(`/api/appointments/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      const data = await response.json();
      
      // Sort by date (newest first)
      const sortedAppointments = data.sort((a: Appointment, b: Appointment) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      setAppointments(sortedAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Use the fetchAppointments function in the initial fetch useEffect
  useEffect(() => {
    fetchAppointments();
  }, [userId]);

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format appointment date
  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPP'); // Format: May 25, 2023
  };

  // Handle AI advice generation
  const handleAIAdvice = async () => {
    if (!userId) {
      setAiError('Please log in to access this feature');
      return;
    }

    try {
      setLoadingAI(true);
      setAiError('');
      setShowInstructions(true);

      // Start the AI job
      const startResponse = await axios.post(
        `http://localhost:5050/care-instructions/${userId}`,
        {},
        { timeout: 60000 }
      );

      const jobId = startResponse.data.job_id;
      let retries = 0;
      const maxRetries = 12; // 60 seconds total (5s * 12)

      // Poll job status
      const pollStatus = async () => {
        while (retries < maxRetries) {
          try {
            const statusResponse = await axios.get(
              `http://localhost:5050/job-status/${jobId}`,
              { timeout: 5000 }
            );

            if (statusResponse.data.status === 'completed') {
              setInstructions({
                status: 'success',
                instructions: statusResponse.data.instructions
              });
              return;
            }

            if (statusResponse.data.status === 'failed') {
              throw new Error(statusResponse.data.error);
            }

            await new Promise(resolve => setTimeout(resolve, 5000));
            retries++;
          } catch (err) {
            throw err;
          }
        }
        throw new Error('Analysis timeout - please try again later');
      };

      await pollStatus();
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error ? err.message : 'Unknown error';

      setAiError(errorMessage);
      setInstructions(null);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleModalClick = () => setIsProfileModalOpen(false);
  const handleModalContentClick = (e: React.MouseEvent) => e.stopPropagation();

  // Test notification function - for testing only
  const testNotification = () => {
    // This simulates receiving a notification about an appointment status change
    if (typeof window !== 'undefined') {
      const customEvent = new CustomEvent('appointment_status_update', {
        detail: {
          appointmentId: 123,
          status: 'approved',
          hospitalName: 'Test Hospital'
        }
      });
      window.dispatchEvent(customEvent);
      
      // Also directly add a notification for testing
      addNotification(
        'Test notification: Your appointment at Test Hospital has been approved.',
        'success',
        123,
        'Test Hospital'
      );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#eef2f7] to-[#d0d8e5] flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Loading dashboard...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#eef2f7] to-[#d0d8e5] flex items-center justify-center">
        <div className="text-red-500 text-xl font-medium">{error}</div>
      </div>
    );
  }

  // Main dashboard render
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef2f7] to-[#d0d8e5] text-gray-900">
      <Sidebar
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        onProfileClick={() => setIsProfileModalOpen(true)}
      />
      
      <main className={`transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-64"} pt-8 p-8`}>
        <div className="max-w-6xl mx-auto">
          {/* Test Notification Button - Remove in production */}
          <Button 
            onClick={testNotification} 
            className="mb-5 bg-purple-600 hover:bg-purple-700 text-white"
          >
            Test Notification
          </Button>
          
          <div className="flex items-center gap-6 mb-8">
            <img
              className="w-16 h-16 rounded-full border-2 border-blue-200"
              src={`https://ui-avatars.com/api/?name=${session.data?.user.name}&background=3b82f6&color=fff`}
              alt="User avatar"
            />
            <div>
              <h1 className="text-3xl font-bold">Welcome, {session.data?.user.name}</h1>
              <p className="text-gray-600">Your Personal Health Dashboard</p>
            </div>
          </div>
          
          <div className="mb-8">
            <button
              onClick={handleAIAdvice}
              disabled={loadingAI}
              className={`w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white p-4 rounded-xl shadow-lg transition-all
                ${loadingAI ? 'opacity-75 cursor-not-allowed' : 'hover:from-blue-700 hover:to-teal-600'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BrainCircuit className="w-6 h-6" />
                  <span className="text-xl font-semibold">AI Advice Curated For You</span>
                </div>
                {showInstructions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </button>

            {showInstructions && (
              <div className="mt-4 bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100">
                {loadingAI ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Generating personalized recommendations...</p>
                  </div>
                ) : aiError ? (
                  <div className="p-4 bg-red-50 rounded-lg text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <div>
                      <p className="font-medium">Error generating advice:</p>
                      <p>{aiError}</p>
                    </div>
                  </div>
                ) : instructions ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">
                      Personalized Care Instructions
                    </h3>
                    <div className="prose max-w-none text-gray-700">
                      <h4>Do's:</h4>
                      <ul>
                        {instructions.instructions.dos.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                      <h4>Don'ts:</h4>
                      <ul>
                        {instructions.instructions.donts.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {medicalProfile && [
              {
                title: "Blood Type",
                value: medicalProfile.bloodType || "Unknown",
                icon: User,
                hoverBg: "hover:bg-indigo-100",
                borderColor: "border-indigo-500",
              },
              {
                title: "Last Checkup",
                value: medicalProfile.lastCheckup.toLocaleDateString(),
                icon: ClipboardList,
                hoverBg: "hover:bg-green-100",
                borderColor: "border-green-500",
              },
              {
                title: "Active Allergies",
                value: medicalProfile.allergies.length,
                icon: AlertCircle,
                hoverBg: "hover:bg-teal-100",
                borderColor: "border-teal-500",
              },
              {
                title: "Current Medications",
                value: medicalProfile.medications.length,
                icon: Pill,
                hoverBg: "hover:bg-yellow-100",
                borderColor: "border-yellow-500",
              },
              {
                title: "Medical Conditions",
                value: medicalProfile.conditions.length,
                icon: HeartPulse,
                hoverBg: "hover:bg-pink-100",
                borderColor: "border-pink-500",
              },
              {
                title: "Vaccinations",
                value: medicalProfile.vaccinations.length,
                icon: Shield,
                hoverBg: "hover:bg-orange-100",
                borderColor: "border-orange-500",
              },
            ].map(({ title, value, icon: Icon, hoverBg, borderColor }, index) => (
              <div
                key={index}
                className={`bg-white p-6 rounded-xl shadow-lg border-2 transition-all ${hoverBg} ${borderColor}`}
              >
                <div className="flex items-center gap-4">
                  <Icon className="w-6 h-6 text-gray-700" />
                  <div>
                    <p className="text-gray-700">{title}</p>
                    <p className="text-lg font-semibold">{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-red-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-500" />
                Allergies
              </h2>
              <ul className="space-y-2">
                {medicalProfile?.allergies.map((allergy, idx) => (
                  <li key={idx} className="p-3 bg-red-50 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    {allergy}
                  </li>
                ))}
                {medicalProfile?.allergies.length === 0 && <p className="text-gray-500">No allergies recorded</p>}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Pill className="w-6 h-6 text-blue-500" />
                Current Medications
              </h2>
              <ul className="space-y-2">
                {medicalProfile?.medications.map((medication, idx) => (
                  <li key={idx} className="p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                    <Pill className="w-4 h-4 text-blue-600" />
                    {medication}
                  </li>
                ))}
                {medicalProfile?.medications.length === 0 && <p className="text-gray-500">No current medications</p>}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-green-100 col-span-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-green-500" />
                  Upcoming Appointments
                </h2>
                <Link href="/hospital">
                  <button className="text-sm px-3 py-1 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition">
                    Book New
                  </button>
                </Link>
              </div>
              
              {loadingAppointments ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : appointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {appointments.map((appointment) => (
                    <Card key={appointment.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex flex-col">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-semibold">{appointment.hospitalName}</h3>
                            <Badge 
                              variant={
                                appointment.status === 'approved' ? 'default' : 
                                appointment.status === 'declined' ? 'destructive' :
                                appointment.status === 'completed' ? 'outline' : 
                                'secondary'
                              }
                              className={
                                appointment.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                appointment.status === 'declined' ? 'bg-red-100 text-red-800' :
                                appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                                'bg-amber-100 text-amber-800'
                              }
                            >
                              {appointment.status === 'scheduled' ? 'Pending' : 
                               appointment.status === 'approved' ? 'Confirmed' : 
                               appointment.status === 'declined' ? 'Declined' : 
                               appointment.status === 'cancelled' ? 'Cancelled' : 
                               appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>
                              <span className="font-medium text-primary">Date:</span> {formatAppointmentDate(appointment.date)}
                            </p>
                            <p>
                              <span className="font-medium text-primary">Time:</span> {appointment.time}
                            </p>
                            <p>
                              <span className="font-medium text-primary">Symptoms:</span> {appointment.symptoms}
                            </p>
                          </div>

                          {/* Status indicators */}
                          {appointment.status === 'scheduled' && (
                            <div className="mt-3 w-full bg-amber-50 border border-amber-200 rounded-md p-2 text-center text-sm text-amber-700">
                              <div className="flex items-center justify-center">
                                <span className="animate-pulse mr-2 h-2 w-2 rounded-full bg-amber-500"></span>
                                Waiting for hospital confirmation
                              </div>
                            </div>
                          )}

                          {appointment.status === 'approved' && (
                            <div className="mt-3 w-full bg-green-50 border border-green-200 rounded-md p-2 text-center text-sm text-green-700">
                              <div className="flex items-center justify-center">
                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Appointment confirmed
                              </div>
                            </div>
                          )}

                          {appointment.status === 'declined' && (
                            <div className="mt-3 w-full bg-red-50 border border-red-200 rounded-md p-2 text-center text-sm text-red-700">
                              <div className="flex items-center justify-center">
                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Appointment declined
                              </div>
                            </div>
                          )}

                          {appointment.status === 'cancelled' && (
                            <div className="mt-3 w-full bg-gray-50 border border-gray-200 rounded-md p-2 text-center text-sm text-gray-700">
                              <div className="flex items-center justify-center">
                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Appointment cancelled
                              </div>
                            </div>
                          )}

                          {appointment.status === 'completed' && (
                            <div className="mt-3 w-full bg-blue-50 border border-blue-200 rounded-md p-2 text-center text-sm text-blue-700">
                              <div className="flex items-center justify-center">
                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Appointment completed
                              </div>
                            </div>
                          )}
                          
                          {/* Payment button - only show for approved appointments with pending payment */}
                          {appointment.paymentStatus === "pending" && appointment.status === "approved" && (
                            <Link href={`/payment/${appointment.id}`}>
                              <Button className="mt-3 w-full" variant="outline">
                                Complete Payment
                              </Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No upcoming appointments</p>
                  <p className="text-sm mt-1">Visit the hospitals section to book an appointment</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleModalClick}>
          <div className="bg-white rounded-lg p-8 max-w-md w-full" onClick={handleModalContentClick}>
            <h2 className="text-2xl font-bold mb-4">Medical Profile</h2>
            {medicalProfile && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Blood Type</label>
                  <p className="font-medium">{medicalProfile.bloodType || "Not specified"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Last Checkup</label>
                  <p className="font-medium">{medicalProfile.lastCheckup.toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Allergies</label>
                  <p className="font-medium">{medicalProfile.allergies.join(", ") || "None"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Medications</label>
                  <p className="font-medium">{medicalProfile.medications.join(", ") || "None"}</p>
                </div>
                <button 
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    router.push(`/patient/medical-profile-edit/${userId}`);
                  }}
                  className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}