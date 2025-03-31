// patient/register.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import AuthNavbar from '@/components/AuthNavbar';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { setToken, setUser, setError } from '@/app/redux/slices/userSlice';

const formSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm Password must be at least 8 characters'),
    latitude: z.number().default(0.0),
    longitude: z.number().default(0.0),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof formSchema>;

export default function PatientSignupPage() {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      latitude: 0.0,
      longitude: 0.0,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { data: session, status } = useSession();
  const error = useAppSelector((state) => state.auth.error);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setValue('latitude', latitude);
          setValue('longitude', longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          dispatch(setError('Please enable location access for better services'));
        }
      );
    }
  }, [setValue, dispatch]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    dispatch(setError(null));
    try {
      const response = await fetch('/api/auth/patient/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          latitude: data.latitude,
          longitude: data.longitude,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const signInResult = await signIn('patient-credentials', {
            redirect: false,
            email: data.email,
            password: data.password,
          });
          
          if (!signInResult?.ok) {
            dispatch(setError(signInResult?.error || 'Login failed after registration'));
          }
          router.push("/patient/dashboard");
        }
      } else {
        const errorData = await response.json();
        dispatch(setError(errorData.error || 'Registration failed.'));
      }
    } catch (err) {
      dispatch(setError('An error occurred. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session) {
      dispatch(setUser({
        name: session.user.name || '',
        email: session.user.email,
        password: ""
      }));
      dispatch(setToken(session.accessToken || 'authenticated'));
      router.push(`/patient/dashboard`);
    }
  }, [status, session, dispatch, router]);

  return (
    <div className="min-h-screen">
      <AuthNavbar />

      <div className="pt-24 lg:pt-0 bg-gradient-to-br from-blue-600 to-blue-500 lg:bg-transparent">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="min-h-screen flex flex-col lg:flex-row"
          >
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-500 flex flex-col justify-center items-center text-white px-10">
              <motion.div className="text-center">
                <div className="p-4 bg-white/20 rounded-lg inline-block">
                  <UserPlus className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold mt-4">Join Us</h2>
                <p className="opacity-80 mt-2">
                  Create an account to manage your health records.
                </p>
                <br />
              </motion.div>
            </div>

            <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-12">
              <div className="text-center mb-8">
                <br />
                <h2 className="text-3xl font-bold text-gray-900 mt-20">Patient Signup</h2>
                <p className="text-gray-600">
                  Create your account to access healthcare services
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <input type="hidden" {...register('latitude', { valueAsNumber: true })} />
                <input type="hidden" {...register('longitude', { valueAsNumber: true })} />

                <div>
                  <label className="block text-gray-700 mb-2">Full Name</label>
                  <input
                    {...register('name')}
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message?.toString()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Email Address</label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="patient@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message?.toString()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Password</label>
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

                <div>
                  <label className="block text-gray-700 mb-2">Confirm Password</label>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword.message?.toString()}
                    </p>
                  )}
                </div>

                {error && (
                  <p className="text-blue-500 text-sm text-center">Signup Successful! Please Log In</p>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Signing Up...' : 'Sign Up'}
                  {!isLoading && <ArrowRight className="w-5 h-5" />}
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link
                    href="/auth/patient/login"
                    className="text-blue-600 hover:underline"
                  >
                    Log in here
                  </Link>
                </p>
                <br />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}