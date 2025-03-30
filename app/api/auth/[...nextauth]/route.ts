import NextAuth, { SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "hospital-credentials",
      name: "Hospital Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        licenseNumber: { label: "License Number", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password || !credentials?.licenseNumber) {
            throw new Error("All fields are required");
          }

          const hospital = await prisma.hospital.findUnique({
            where: { 
              email: credentials.email,
              licenseNumber: credentials.licenseNumber
            }
          });

          if (!hospital) throw new Error("Hospital not found");

          const passwordValid = await bcrypt.compare(
            credentials.password,
            hospital.password
          );

          if (!passwordValid) throw new Error("Invalid credentials");

          return {
            id: hospital.id.toString(),
            email: hospital.email,
            name: hospital.name,
            licenseNumber: hospital.licenseNumber,
            role: "HOSPITAL"
          };
        } catch (error) {
          console.error("Hospital auth error:", error);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: "patient-credentials",
      name: "Patient Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          const patient = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!patient) throw new Error("Patient not found");

          const passwordValid = await bcrypt.compare(
            credentials.password,
            patient.password
          );

          if (!passwordValid) throw new Error("Invalid credentials");

          return {
            id: patient.id.toString(),
            email: patient.email,
            name: patient.name,
            role: "PATIENT"
          };
        } catch (error) {
          console.error("Patient auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt" as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: { token: any, user: any }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        if (user.role === "HOSPITAL") {
          token.licenseNumber = (user as any).licenseNumber;
        }
      }
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      session.user.role = token.role;
      session.user.id = token.id;
      if (token.role === "HOSPITAL") {
        session.user.licenseNumber = token.licenseNumber;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };