"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Appointment {
  id: number;
  patient: string;
  phone: string;
  symptoms: string;
  date: string;
  time: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  userId: number | null;
}

export default function HospitalAppointments() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusReason, setStatusReason] = useState("");
  const [actionType, setActionType] = useState<"approve" | "decline">("approve");
  const [activeTab, setActiveTab] = useState("pending");
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user?.id) {
      fetchAppointments();
    }
  }, [session?.user?.id]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // In a real app, you would fetch appointments for the hospital
      // This is a placeholder endpoint - you'd need to create it
      const res = await fetch(`/api/hospital/appointments`);
      
      if (!res.ok) {
        throw new Error("Failed to fetch appointments");
      }
      
      const data = await res.json();
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Error",
        description: "Failed to load appointments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusAction = (appointment: Appointment, action: "approve" | "decline") => {
    setSelectedAppointment(appointment);
    setActionType(action);
    setStatusReason("");
    setStatusDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedAppointment) return;
    
    try {
      console.log(`Updating appointment ${selectedAppointment.id} status to ${actionType}`);
      
      const res = await fetch(`/api/appointments/${selectedAppointment.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: actionType === "approve" ? "approved" : "declined",
          reason: statusReason,
        }),
      });
      
      const responseData = await res.json();
      console.log("API response:", responseData);
      
      if (!res.ok) {
        throw new Error(responseData.error || "Failed to update appointment status");
      }
      
      // Update local state
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === selectedAppointment.id
            ? { ...app, status: actionType === "approve" ? "approved" : "declined" }
            : app
        )
      );
      
      toast({
        title: actionType === "approve" ? "Appointment Approved" : "Appointment Declined",
        description: `Successfully ${actionType === "approve" ? "approved" : "declined"} the appointment for ${selectedAppointment.patient}.`,
        variant: actionType === "approve" ? "default" : "destructive",
      });
      
      setStatusDialogOpen(false);
      
      // Refresh the appointments list after a short delay
      setTimeout(() => {
        fetchAppointments();
      }, 500);
      
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update appointment status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "PPP");
  };

  const filteredAppointments = appointments.filter((appointment) => {
    if (activeTab === "pending") {
      return appointment.status === "scheduled";
    } else if (activeTab === "approved") {
      return appointment.status === "approved";
    } else if (activeTab === "declined") {
      return appointment.status === "declined";
    } else if (activeTab === "completed") {
      return appointment.status === "completed";
    }
    return true;
  });

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Appointment Management</h1>
      
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center p-12 bg-muted/20 rounded-lg border">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No appointments found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {activeTab === "pending"
                  ? "There are no pending appointment requests."
                  : activeTab === "approved"
                  ? "You haven't approved any appointments yet."
                  : activeTab === "declined"
                  ? "You haven't declined any appointments yet."
                  : "There are no completed appointments yet."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Symptoms</TableHead>
                    <TableHead>Payment</TableHead>
                    {activeTab === "pending" && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{appointment.patient}</div>
                          <div className="text-sm text-muted-foreground">{appointment.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{formatDate(appointment.date)}</div>
                          <div className="text-sm text-muted-foreground">{appointment.time}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {appointment.symptoms}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={appointment.paymentStatus === "completed" ? "outline" : "secondary"}
                          className={appointment.paymentStatus === "completed" ? "bg-green-100 text-green-800" : ""}
                        >
                          {appointment.paymentStatus === "completed" ? "Paid" : "Pending"}
                        </Badge>
                      </TableCell>
                      {activeTab === "pending" && (
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => handleStatusAction(appointment, "approve")}
                            >
                              <Check className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleStatusAction(appointment, "decline")}
                            >
                              <X className="mr-1 h-4 w-4" />
                              Decline
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Appointment" : "Decline Appointment"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Are you sure you want to approve this appointment? This will notify the patient."
                : "Please provide a reason for declining this appointment. The patient will be notified."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder={actionType === "approve" ? "Optional: Add notes for the patient" : "Reason for declining (required)"}
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              className="min-h-[100px]"
              required={actionType === "decline"}
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmStatusChange}
              disabled={actionType === "decline" && !statusReason.trim()}
              variant={actionType === "approve" ? "default" : "destructive"}
            >
              {actionType === "approve" ? "Approve" : "Decline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 