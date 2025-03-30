'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import HospitalNavbar from '@/components/HospitalNavbar';
import { useAppDispatch } from '@/app/redux/hooks';
import { setUser, setToken, setError } from '@/app/redux/slices/authSlice';
import { useRouter } from 'next/navigation';
import { registerSchema } from '@/app/lib/schema';

type FormData = z.infer<typeof registerSchema>;

export default function HospitalRegistrationPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
  });

  const dispatch = useAppDispatch();
  const router = useRouter();

  // Geolocation and reverse geocoding effect
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Reverse geocoding using OpenStreetMap Nominatim
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            if (!response.ok) throw new Error('Reverse geocoding failed');
            const data = await response.json();
            const address = data.display_name;
            // Update form values
            setValue('address', address);
            setValue('latitude', latitude);
            setValue('longitude', longitude);
          } catch (error) {
            console.error('Geocoding error:', error);
            dispatch(setError('Could not determine your location'));
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          dispatch(setError('Please enable location access to autofill address'));
        }
      );
    }
  }, [setValue, dispatch]);

  const onSubmit = async (data: FormData) => {
    console.log('Hospital Registration Data:', data);
    try {
      // Call the signup API
      const response = await fetch('/api/auth/hospital/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
  
      // Parse the response only once
      const result = await response.json();
  
      // Check if the response is not OK
      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }
  
      console.log('Signup Response:', result);
  
      // Redirect on success
      router.push("/auth/hospital/login");
    } catch (error: any) {
      console.log('Signup Error:', error.message);
      dispatch(setError(error.message || "Failed to register hospital"));
    }
  };
  
  return (
    <div className="min-h-screen">
      <HospitalNavbar />

      <div className="pt-24 pb-24 lg:pt-0 lg:pb-0 bg-gradient-to-br from-blue-600 to-blue-500 lg:bg-transparent">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="min-h-screen flex flex-col lg:flex-row"
          >
            {/* Blue Section: Info Panel */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-500 flex flex-col justify-center items-center text-white px-8 order-1 lg:order-2">
              <motion.div className="text-center">
                <div className="p-4 bg-white/20 rounded-lg inline-block">
                  <Building2 className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold mt-4">Register Your Hospital</h2>
                <p className="opacity-80 mt-1 text-sm">
                  Join MediConnect and improve healthcare services.
                </p>
                <br />
              </motion.div>
            </div>

            {/* White Section: Registration Form */}
            <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center items-center px-8 order-2 lg:order-1">
              <div className="text-center mb-6 w-3/4">
                <br />
                <h2 className="text-2xl font-bold text-gray-900 pt-8">
                  Hospital Registration
                </h2>
                <p className="text-gray-600 text-sm">
                  Register your healthcare facility with MediConnect
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-3/4">
                {/* Hidden fields for coordinates */}
                <input type="hidden" {...register('latitude', { valueAsNumber: true })} />
                <input type="hidden" {...register('longitude', { valueAsNumber: true })} />

                {/* Hospital Name */}
                <div>
                  <label className="block text-gray-700 text-sm mb-1">
                    Hospital Name
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="General Hospital"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-gray-700 text-sm mb-1">
                    Full Address
                  </label>
                  <input
                    {...register('address')}
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Medical Street, Health City"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
                  )}
                </div>

                {/* Contact Person & Phone Number */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">
                      Contact Person
                    </label>
                    <input
                      {...register('contactPerson')}
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                    />
                    {errors.contactPerson && (
                      <p className="text-red-500 text-xs mt-1">{errors.contactPerson.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-1">
                      Phone Number
                    </label>
                    <input
                      {...register('phone')}
                      type="tel"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="+1 234 567 890"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Email & License Number */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">
                      Email Address
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="admin@hospital.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-1">
                      License Number
                    </label>
                    <input
                      {...register('licenseNumber')}
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="MED-123456"
                    />
                    {errors.licenseNumber && (
                      <p className="text-red-500 text-xs mt-1">{errors.licenseNumber.message}</p>
                    )}
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">
                      Password
                    </label>
                    <input
                      {...register('password')}
                      type="password"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-1">
                      Confirm Password
                    </label>
                    <input
                      {...register('confirmPassword')}
                      type="password"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.confirmPassword.message?.toString()}
                      </p>
                    )}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Register Hospital
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-gray-600 text-sm">
                  Already registered?{' '}
                  <Link href="/auth/hospital/login" className="text-blue-600 hover:underline">
                    Hospital Login
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