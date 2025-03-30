'use client';

import { motion } from 'framer-motion';
import { Hospital } from '@/types/hospital';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Star, Clock, MapPin, Heart, Share2, ArrowUpRight } from 'lucide-react';

export default function HospitalCard({ hospital }: { hospital: Hospital }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-sky-600/10 to-blue-500/10 rounded-xl filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="p-6 space-y-4">
          {/* Card Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-sky-600 transition-colors duration-300">
                  {hospital.name}
                </h2>
                {hospital.verified && (
                  <span className="bg-emerald-100 text-emerald-600 text-xs px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-gray-500 flex items-center gap-1 mt-1">
                <MapPin size={16} /> {hospital.address}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="hover:text-sky-600">
                <Heart size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-sky-600">
                <Share2 size={20} />
              </Button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-sky-50 p-3 rounded-lg">
              <p className="text-gray-500 text-sm flex items-center gap-1">
                <Star size={16} className="text-amber-400" /> Rating
              </p>
              <p className="font-semibold text-gray-900">4.2</p>
            </div>
            <div className="bg-sky-50 p-3 rounded-lg">
              <p className="text-gray-500 text-sm flex items-center gap-1">
                <Clock size={16} className="text-sky-500" /> Wait Time
              </p>
              <p className="font-semibold text-gray-900">30 mins</p>
            </div>
          </div>

          {/* Specialities */}
          <div>
            <p className="text-gray-500 text-sm">Specialities</p>
            <div className="flex gap-2 mt-1 flex-wrap">
              {hospital.specialities.map((speciality) => (
                <span
                  key={speciality}
                  className="bg-sky-100 text-sky-700 text-sm px-3 py-1 rounded-full"
                >
                  {speciality}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Consultation Fee</p>
              <p className="text-lg font-semibold text-gray-900">
                
              <span>&#8377; 500</span>
              </p>
            </div>
            <Link href={`/hospital/${hospital.id}`} passHref>
              <Button
                className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white transition-all duration-300 flex items-center gap-2"
              >
                View Details
                <motion.span
                  whileHover={{ x: 2, y: -2 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <ArrowUpRight size={16} />
                </motion.span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}