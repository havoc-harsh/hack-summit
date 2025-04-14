import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { hospitalId: string; appointmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Authentication check
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Authorization verification
    if (session.user.id !== params.hospitalId) {
      return NextResponse.json(
        { error: "Forbidden - Hospital ID mismatch" },
        { status: 403 }
      );
    }

    // Validate appointment ID
    if (!params.appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    // Delete appointment from database
    const deletedAppointment = await prisma.appointment.delete({
      where: {
        id: parseInt(params.appointmentId),
        hospitalId: parseInt(params.hospitalId)
      }
    });

    return NextResponse.json(
      { message: "Appointment deleted successfully", deletedAppointment },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}