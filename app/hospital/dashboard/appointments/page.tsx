"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AppointmentCard } from '../components/appointment-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationBell } from '@/components/ui/notification-bell';

interface Appointment {
  id: number;
  patient: string;
  phone: string;
  symptoms: string;
  date: string;
  time: string;
  status: string;
  hospitalId: number;
  userId: number;
  latitude?: number | null;
  longitude?: number | null;
}

export default function HospitalAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const hospitalId = session?.user?.hospitalId || 1; // Default to hospital ID 1 for simplicity

  // Function to fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/hospital/${hospitalId}/appointments`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const data = await response.json();
      setAppointments(data);
      setError(null);
    } catch (err) {
      setError('Error loading appointments. Please try again.');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch appointments on mount and when hospital ID changes
  useEffect(() => {
    fetchAppointments();
  }, [hospitalId]);

  // Handle appointment status changes
  const handleStatusChange = async (appointmentId: number, status: string) => {
    try {
      setLoading(true);
      console.log(`Updating appointment ${appointmentId} to status: ${status}`);
      
      // Send the status update to the server
      const response = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update appointment');
      }
      
      const updatedAppointment = await response.json();
      console.log('Appointment updated:', updatedAppointment);
      
      // Immediately update the UI with the new status
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status } 
            : appointment
        )
      );

      // Show a success message
      alert(`Appointment ${status} successfully`);
      
      // Fetch appointments again to ensure everything is up-to-date
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Error updating appointment status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter appointments by status
  const pendingAppointments = appointments.filter(app => app.status === 'scheduled');
  const approvedAppointments = appointments.filter(app => app.status === 'approved');
  const declinedAppointments = appointments.filter(app => app.status === 'declined');
  const completedAppointments = appointments.filter(app => app.status === 'completed');
  const cancelledAppointments = appointments.filter(app => app.status === 'cancelled');

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Appointments</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Appointments</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Appointments</h1>
        <NotificationBell />
      </div>
      
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingAppointments.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {pendingAppointments.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          {pendingAppointments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No pending appointments</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingAppointments.map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-4">
          {approvedAppointments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No approved appointments</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedAppointments.map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="declined" className="space-y-4">
          {declinedAppointments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No declined appointments</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {declinedAppointments.map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {completedAppointments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No completed appointments</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedAppointments.map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="cancelled" className="space-y-4">
          {cancelledAppointments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No cancelled appointments</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cancelledAppointments.map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 