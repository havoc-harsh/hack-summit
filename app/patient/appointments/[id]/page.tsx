"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon, ArrowLeft, Hospital, CreditCard } from "lucide-react";
import Link from "next/link";

interface AppointmentDetails {
  id: number;
  patient: string;
  phone: string;
  symptoms: string;
  date: string;
  time: string;
  status: string;
  statusReason?: string;
  paymentStatus: string;
  hospitalId: number;
  hospitalName: string;
  createdAt: string;
}

export default function AppointmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!params.id || !session?.user?.id) return;

      try {
        setLoading(true);
        const res = await fetch(`/api/appointments/${params.id}`);
        
        if (!res.ok) {
          throw new Error("Failed to fetch appointment details");
        }
        
        const data = await res.json();
        setAppointment(data);
      } catch (err) {
        console.error("Error fetching appointment:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [params.id, session?.user?.id]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'declined':
        return 'destructive';
      case 'completed':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusDisplayText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-9v4a1 1 0 11-2 0v-4a1 1 0 112 0zm0-4a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error || "Appointment not found. It may have been removed or you don't have access."}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => router.push("/patient/dashboard")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Button
        variant="outline"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Appointment Details</CardTitle>
            <Badge 
              variant={getStatusBadgeVariant(appointment.status) as any}
              className="text-sm px-3 py-1"
            >
              {getStatusDisplayText(appointment.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {appointment.statusReason && (
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <h3 className="font-medium text-blue-800">Status Reason:</h3>
              <p className="text-blue-700 mt-1">{appointment.statusReason}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Hospital</h3>
                <div className="flex items-center mt-1">
                  <Hospital className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-lg font-medium">{appointment.hospitalName}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                <div className="flex flex-col mt-1 space-y-1">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <p>{formatAppointmentDate(appointment.date)}</p>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <p>{appointment.time}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Patient Details</h3>
                <div className="flex items-center mt-1">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <p>{appointment.patient}</p>
                </div>
                <p className="text-sm text-gray-500 ml-7">{appointment.phone}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Symptoms</h3>
                <p className="mt-1 text-gray-700">{appointment.symptoms}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Payment Status</h3>
                <div className="flex items-center mt-1">
                  <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                  <Badge 
                    variant={appointment.paymentStatus === "completed" ? "outline" : "secondary"}
                    className={appointment.paymentStatus === "completed" ? "bg-green-100 text-green-800" : ""}
                  >
                    {appointment.paymentStatus === "completed" ? "Paid" : "Payment Pending"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-gray-50/50 border-t p-6">
          {appointment.paymentStatus !== "completed" && (
            <Button
              className="ml-auto"
              onClick={() => router.push(`/payment/${appointment.id}`)}
            >
              Complete Payment
            </Button>
          )}
          
          {appointment.status === "scheduled" && (
            <Button
              variant="outline"
              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 mr-auto"
              onClick={() => {
                // TODO: Implement cancellation functionality
                alert("Cancellation feature will be implemented soon");
              }}
            >
              Cancel Appointment
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 