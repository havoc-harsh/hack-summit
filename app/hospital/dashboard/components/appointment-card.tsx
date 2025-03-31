"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { Check, X, Clock, Calendar, MapPin, Phone, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AppointmentCardProps {
  appointment: {
    id: number;
    patient: string;
    date: string;
    time: string;
    status: string;
    symptoms: string;
    phone: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  onStatusChange: (id: number, status: string) => Promise<void>;
}

export function AppointmentCard({ appointment, onStatusChange }: AppointmentCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleStatusChange = async (status: string) => {
    try {
      setIsLoading(true);
      await onStatusChange(appointment.id, status);
    } catch (error) {
      console.error('Error updating appointment status:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP');
  };
  
  const getStatusBadge = () => {
    switch (appointment.status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'declined':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Declined</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{appointment.status}</Badge>;
    }
  };

  // Check if appointment date is in the past (expired)
  const isExpired = () => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    return appointmentDate < today;
  };
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">{appointment.patient}</h3>
          {getStatusBadge()}
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>{formatDate(appointment.date)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{appointment.time}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <span>{appointment.phone}</span>
          </div>
          
          {appointment.latitude && appointment.longitude && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <a 
                href={`https://maps.google.com/?q=${appointment.latitude},${appointment.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Location
              </a>
            </div>
          )}
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700">Symptoms:</p>
          <p className="text-sm text-gray-600 mt-1">{appointment.symptoms || "No symptoms provided"}</p>
        </div>
      </CardContent>
      
      {appointment.status === 'scheduled' && (
        <CardFooter className="p-4 bg-gray-50 border-t flex justify-between">
          <Button
            variant="outline"
            size="sm"
            className="border-red-500 text-red-500 hover:bg-red-50"
            onClick={() => handleStatusChange('declined')}
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-1" />
            Decline
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="border-green-500 text-green-500 hover:bg-green-50"
            onClick={() => handleStatusChange('approved')}
            disabled={isLoading}
          >
            <Check className="w-4 h-4 mr-1" />
            Approve
          </Button>
        </CardFooter>
      )}

      {/* Cancel option for approved appointments */}
      {appointment.status === 'approved' && !isExpired() && (
        <CardFooter className="p-4 bg-gray-50 border-t flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-600 hover:bg-gray-100"
            onClick={() => {
              if (confirm('Are you sure you want to cancel this appointment?')) {
                handleStatusChange('cancelled');
              }
            }}
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Cancel Appointment
          </Button>
        </CardFooter>
      )}
      
      {/* Mark as completed option for approved appointments */}
      {appointment.status === 'approved' && isExpired() && (
        <CardFooter className="p-4 bg-gray-50 border-t flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="border-blue-500 text-blue-500 hover:bg-blue-50"
            onClick={() => handleStatusChange('completed')}
            disabled={isLoading}
          >
            <Check className="w-4 h-4 mr-1" />
            Mark Completed
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 