'use client';

import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { Hospital } from '@/types/hospital';
import { BookingDialog } from '../../../components/booking-dialog';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Clock, MapPin, User, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HospitalDetailsPage() {

  const [hospitals,setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch('/api/hospital')
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setHospitals(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
  
    fetchHospitals()
  }, []);

  const params = useParams();
  const id = parseInt(params.id as string);
  const hospital = hospitals.find(h => h.id === id);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  if (!hospital) return <div>Hospital not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-7xl mx-auto p-4 pt-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/hospital" className="inline-block mb-6">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft size={16} /> Back to Hospitals
            </Button>
          </Link>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-8">
              <motion.div
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                className="flex-1"
              >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {hospital.name}
                </h1>
                <p className="text-lg text-gray-600 flex items-center gap-2">
                  <MapPin className="text-sky-600" /> {hospital.address}
                </p>
                <div className="flex gap-2 mt-4">
                  <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-sm">
                    {hospital.experience} Experience
                  </span>
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">
                    4.2 Rating
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 20 }}
                animate={{ x: 0 }}
                className="md:w-1/3"
              >
                <div className="bg-sky-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <Button
                    onClick={() => setShowBookingDialog(true)}
                    className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white py-6 text-lg"
                  >
                    Book Appointment
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Detailed Sections */}
            <div className="mt-12 grid gap-12">
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose max-w-none"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  About {hospital.name}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                A multi-specialty hospital providing quality healthcare services.
                </p>
              </motion.section>

              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Our Specialists
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {hospital.doctors.map((doctor, index) => (
                    <div
                      key={index}
                      className="bg-sky-50 rounded-xl p-6 hover:bg-sky-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-sky-600 text-white p-3 rounded-lg">
                          <User size={24} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{doctor.name}</h4>
                          <p className="text-gray-600">{doctor.specialization}</p>
                          {/* <p className="text-sm text-gray-500 mt-1">
                            {doctor.experience} experience
                          </p> */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>
          </div>
        </motion.div>
      </div>

      <BookingDialog
        open={showBookingDialog}
        onOpenChange={setShowBookingDialog}
        hospital={hospital}
      />
    </div>
  );
}