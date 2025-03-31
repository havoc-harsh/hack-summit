"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { setToken, setUser, setError } from "@/app/redux/slices/userSlice";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof formSchema>;

export default function PatientLoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { error } = useAppSelector((state) => state.auth);
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const result = await signIn("patient-credentials", {
        redirect: false, // Handle redirect manually
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        dispatch(setError(result.error));
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      dispatch(setError(error.message || "Login failed"));
      setIsLoading(false);
    }
  };

  // Handle redirect based on medical profile after authentication
  useEffect(() => {
    if (status === "authenticated" && session) {
      dispatch(
        setUser({
          name: session.user.name || "",
          email: session.user.email,
          password: "",
        })
      );
      dispatch(setToken(session.accessToken || "authenticated"));
      dispatch(setError(null));

      // Check medical profile
      fetch("/api/medical-profile/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.exists) {
            router.push("/patient/dashboard");
          } else {
            router.push("/patient/medical-profile-form");
          }
        })
        .catch((error) => {
          console.error("Error checking medical profile:", error);
          dispatch(setError("Failed to check medical profile"));
        });
    }
  }, [status, session, dispatch, router]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen">
      <div className="pt-24 lg:pt-0 bg-gradient-to-br from-blue-600 to-blue-500 lg:bg-transparent">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="min-h-screen flex flex-col lg:flex-row"
          >
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-500 flex flex-col justify-center items-center text-white px-10">
              <motion.div className="text-center">
                <div className="p-4 bg-white/20 rounded-lg inline-block">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold mt-4">Welcome Back</h2>
                <p className="opacity-80 mt-2">
                  Log in to manage your health records.
                </p>
              </motion.div>
            </div>

            <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Patient Login</h2>
                <p className="text-gray-600">
                  Sign in to access your patient dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2">Email Address</label>
                  <input
                    {...register("email")}
                    type="email"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="patient@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Password</label>
                  <input
                    {...register("password")}
                    type="password"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                {error && <p className="text-red-500 text-sm text-center"></p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                  {!isLoading && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/patient/register" className="text-blue-600 hover:underline">
                    Register here
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}