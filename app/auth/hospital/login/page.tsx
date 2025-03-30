'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import AuthNavbar from '@/components/AuthNavbar';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { setToken, setUser, setError } from '@/app/redux/slices/authSlice';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from "next-auth/react";
import { useEffect } from 'react';

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  licenseNumber: z.string().min(5, "License number must be at least 5 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof formSchema>;

export default function HospitalLoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { error } = useAppSelector((state) => state.auth);
  const { data: session, status } = useSession();

  const onSubmit = async (data: FormData) => {
    console.log('Hospital Login Data:', data);
    try {
      const result = await signIn("hospital-credentials", {
        redirect: true,
        email: data.email,
        password: data.password,
        licenseNumber: data.licenseNumber,
        
      });

      if (result?.ok) {
        // Wait for session to update before proceeding
        // No immediate dispatch here; useEffect will handle it
      } else {
        dispatch(setError(result?.error || "Invalid credentials"));
      }
    } catch (error: any) {
      console.log(error);
      dispatch(setError(error.message || "Login failed"));
    }
  };

  // Fetch token and user data from session after successful login
  useEffect(() => {
    if (status === "authenticated" && session) {
      dispatch(setUser({
        name: "",
        address: "",
        contactPerson: "",
        phone: "",
        email: session.user.email,
        licenseNumber: session.user.licenseNumber || "",
        password: "",
      }));
      dispatch(setToken(session.accessToken || "authenticated")); // Use token from session
      console.log("Logged In Successfully");
      dispatch(setError(null));
      router.push(`/hospital/${session.user.id}/dashboard`); // Or session.user.licenseNumber
    }
  }, [status, session, dispatch, router]);

  return (
    <div className="min-h-screen">
      <AuthNavbar />

      {/* Wrapper with top padding and blue background on mobile */}
      <div className="pt-24 lg:pt-0 bg-gradient-to-br from-blue-600 to-blue-500 lg:bg-transparent">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="min-h-screen flex flex-col lg:flex-row"
          >
            {/* Left Side - Blue Background */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-500 flex flex-col justify-center items-center text-white px-10">
              <motion.div className="text-center">
                <div className="p-4 bg-white/20 rounded-lg inline-block">
                  <Building2 className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold mt-4">Welcome Back</h2>
                <p className="opacity-80 mt-2">
                  Log in to manage your hospital services.
                </p>
                <br></br>
              </motion.div>
            </div>

            {/* Right Side - White Background */}
            <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-12">
              <div className="text-center mb-8">
                <br></br>
                <h2 className="text-3xl font-bold text-gray-900">Hospital Login</h2>
                <p className="text-gray-600">
                  Sign in to access your hospital dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="admin@hospital.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message?.toString()}
                    </p>
                  )}
                </div>

                {/* License Number Field */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    License Number
                  </label>
                  <input
                    {...register('licenseNumber')}
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="MED-123456"
                  />
                  {errors.licenseNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.licenseNumber.message?.toString()}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    {...register('password')}
                    type="password"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password.message?.toString()}
                    </p>
                  )}
                </div>

                {/* Error Display */}
                {error && (
                  <p className="text-red-500 text-sm text-center">
                    {error}
                  </p>
                )}

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </form>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    href="/auth/hospital/register"
                    className="text-blue-600 hover:underline"
                  >
                    Register here
                  </Link>
                </p>
                <br></br>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}