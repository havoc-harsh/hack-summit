// types/hospital.ts

import { DefaultSession } from "next-auth";
export interface Doctor {
  name: string;
  specialty: string;
  experience: string;
}

export interface Hospital {
  id: number;
  name: string;
  address: string;
  consultationFee: string;
  rating: string;
  experience?: string;
  waitTime: string;
  contact: string;
  ambulance: number;
  blood: number;
  oxygen: number;
  beds: number;
  latitude: number;
  longitude: number;
  specialities: string[];
  about?: string;
  nextAvailable?: string;
  verified?: boolean;
  amenities?: string[];
  doctors: Doctor[];
}

export interface BookingData {
  date: string;
  time: string;
  name: string;
  phone: string;
  reason: string;
  latitude:any,
  longitude:any
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      licenseNumber: string;
    } & DefaultSession["user"];
    accessToken?: string; // Add accessToken to session
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    licenseNumber: string;
    accessToken?: string; // Add accessToken to JWT
  }
}