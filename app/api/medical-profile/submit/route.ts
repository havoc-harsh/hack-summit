import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("Received profile data:", data);
    
    // Validate required fields
    if (!data.userId) {
      return NextResponse.json({ 
        error: "User ID is required",
        details: "Missing user ID in request data" 
      }, { status: 400 });
    }
    
    // Handle both string and number user IDs
    let userId: number;
    if (typeof data.userId === 'string') {
      userId = parseInt(data.userId, 10);
      if (isNaN(userId)) {
        return NextResponse.json({ 
          error: "Invalid user ID format",
          details: "User ID must be a valid number" 
        }, { status: 400 });
      }
    } else if (typeof data.userId === 'number') {
      userId = data.userId;
    } else {
      return NextResponse.json({ 
        error: "Invalid user ID type",
        details: "User ID must be a string or number" 
      }, { status: 400 });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    console.log("User lookup result:", user ? { id: user.id, email: user.email } : 'User not found');
    
    // Log authentication info for debugging
    try {
      // This is a development-only log to help troubleshoot auth issues
      const authHeader = request.headers.get("authorization");
      console.log("Auth header present:", !!authHeader);
      console.log("Request cookies:", request.cookies.getAll().map(c => c.name));
    } catch (e) {
      console.log("Unable to log auth info:", e);
    }

    // If user doesn't exist, create one for development purposes
    if (!user) {
      try {
        const userCreateData = {
          id: userId,
          email: `user_${userId}@example.com`,
          name: `Test User ${userId}`,
          password: "password123", // Required by the schema
          updatedAt: new Date(), // Required by the schema
          alert: [] // Default empty array
        };

        user = await prisma.user.create({
          data: userCreateData
        });
        
        console.log("Created new user for development:", user);
      } catch (userCreateError) {
        console.error("Failed to create user:", userCreateError);
        
        // Log existing users for debugging
        const users = await prisma.user.findMany({ take: 5 });
        console.log("Available users (first 5):", users.map(u => ({ id: u.id, email: u.email })));
        
        return NextResponse.json({ 
          error: "User creation failed",
          details: "Could not create a new user. Check database schema compatibility."
        }, { status: 500 });
      }
    }

    // Prepare data object with proper defaults
    const profileData = {
      userId,
      bloodType: data.bloodType || "",
      allergies: Array.isArray(data.allergies) ? data.allergies : [],
      medications: Array.isArray(data.medications) ? data.medications : [],
      conditions: Array.isArray(data.conditions) ? data.conditions : [],
      vaccinations: Array.isArray(data.vaccinations) ? data.vaccinations : [],
      lastCheckup: data.lastCheckup ? new Date(data.lastCheckup) : new Date(),
      care_instructions: [] // Default empty array for care_instructions
    };

    // Check if a medical profile already exists for this user
    const existingProfile = await prisma.medicalProfile.findUnique({
      where: { userId }
    });

    let result;
    try {
      if (existingProfile) {
        // Update existing profile
        result = await prisma.medicalProfile.update({
          where: { userId },
          data: profileData,
        });
      } else {
        // Create new profile
        result = await prisma.medicalProfile.create({
          data: profileData,
        });
      }
    } catch (profileError) {
      console.error("Error creating/updating profile:", profileError);
      
      // Try to get the underlying database schema
      try {
        const dmmf = (prisma as any)._dmmf;
        console.log("Database schema for MedicalProfile:", dmmf?.mappingsMap?.MedicalProfile);
      } catch (e) {
        console.log("Could not log schema information");
      }
      
      throw profileError; // Rethrow to be caught by the outer catch
    }

    return NextResponse.json({
      success: true,
      message: existingProfile ? "Medical profile updated" : "Medical profile created",
      data: result
    });
    
  } catch (error) {
    console.error("Error submitting medical profile:", error);
    
    // Handle Prisma specific errors
    if (error instanceof PrismaClientKnownRequestError) {
      // P2002 is Prisma's error code for unique constraint violations
      if (error.code === 'P2002') {
        return NextResponse.json({ 
          error: "Profile creation failed",
          details: "A profile for this user already exists" 
        }, { status: 409 });
      }
      
      // P2003 is for foreign key constraint failures
      if (error.code === 'P2003') {
        return NextResponse.json({ 
          error: "Profile creation failed", 
          details: "Referenced user does not exist"
        }, { status: 400 });
      }
    }
    
    // Generic error response for other errors
    return NextResponse.json({ 
      error: "Failed to submit profile",
      details: error instanceof Error ? error.message : "Unknown error occurred" 
    }, { status: 500 });
  }
}