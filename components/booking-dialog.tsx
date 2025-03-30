"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Hospital } from '@/types/hospital';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Calendar, Clock, User, MapPin, Phone, Bitcoin, CreditCard, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function BookingDialog({
  hospital,
  open,
  onOpenChange,
}: {
  hospital: Hospital;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLatitude(latitude);
          setLongitude(longitude);
          fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          )
            .then((response) => {
              if (!response.ok) throw new Error('Network response was not ok');
              return response.json();
            })
            .then((data) => {
              setLocation(`${data.locality}, ${data.countryName}`);
            })
            .catch(() => {
              setError('Unable to fetch location details.');
            });
        },
        () => {
          setError('Unable to retrieve your location.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      if (!appointmentDate || !appointmentTime) {
        throw new Error('Please select a valid date and time.');
      }

      const payload = {
        patient: name,
        phone,
        symptoms,
        latitude,
        longitude,
        date: new Date(appointmentDate),
        time: appointmentTime,
        hospitalId: hospital.id,
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to book appointment');
      }

      setAppointmentId(data.id);
      setSuccess(true);
      setShowPaymentOptions(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handlePayment = (method: 'stripe' | 'crypto') => {
    if (!appointmentId) return;
    router.push(`/payment/${method}/${appointmentId}`);
    onOpenChange(false);
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setSymptoms('');
    setAppointmentDate('');
    setAppointmentTime('');
    setShowPaymentOptions(false);
    setSuccess(false);
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <LayoutGroup>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {showPaymentOptions ? 'Secure Payment' : 'Book Appointment'}
              </DialogTitle>
            </DialogHeader>

            <AnimatePresence mode="wait">
              {!showPaymentOptions ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6 py-4"
                >
                  {/* Hospital Information */}
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-sky-100 rounded-xl">
                      <User className="text-sky-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{hospital.name}</h3>
                      <p className="text-gray-500 text-sm">{hospital.address}</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <motion.div
                      className="flex items-center gap-3 p-4 bg-sky-50 rounded-xl"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <User className="text-sky-600" size={20} />
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-transparent font-medium focus:outline-none w-full"
                      />
                    </motion.div>

                    <motion.div
                      className="flex items-center gap-3 p-4 bg-sky-50 rounded-xl"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Phone className="text-sky-600" size={20} />
                      <input
                        type="tel"
                        placeholder="Your Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-transparent font-medium focus:outline-none w-full"
                      />
                    </motion.div>

                    <motion.div
                      className="flex items-center gap-3 p-4 bg-sky-50 rounded-xl"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <MapPin className="text-sky-600" size={20} />
                      <input
                        type="text"
                        placeholder="Your Location"
                        value={location}
                        readOnly
                        className="bg-transparent font-medium focus:outline-none w-full"
                      />
                    </motion.div>

                    <motion.div
                      className="flex items-center gap-3 p-4 bg-sky-50 rounded-xl"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <User className="text-sky-600" size={20} />
                      <textarea
                        placeholder="Describe your symptoms"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        className="bg-transparent font-medium focus:outline-none w-full"
                      />
                    </motion.div>

                    <motion.div
                      className="flex items-center gap-3 p-4 bg-sky-50 rounded-xl"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Calendar className="text-sky-600" size={20} />
                      <input
                        type="date"
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="bg-transparent font-medium focus:outline-none"
                      />
                    </motion.div>

                    <motion.div
                      className="flex items-center gap-3 p-4 bg-sky-50 rounded-xl"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Clock className="text-sky-600" size={20} />
                      <select
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        className="bg-transparent font-medium focus:outline-none w-full"
                      >
                        <option value="">Select time</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="10:30 AM">10:30 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                      </select>
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-red-500 text-sm text-center"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white py-6 text-lg relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-10 transition-opacity" />
                      Confirm Appointment
                    </Button>
                  </motion.div>
                </motion.form>
              ) : (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center mb-6"
                  >
                    <p className="text-green-500 text-sm mb-2">
                      Appointment confirmed!
                    </p>
                    <h3 className="font-semibold text-gray-800">Select Payment Method</h3>
                  </motion.div>

                  <div className="space-y-4">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <Link href={`/stripepayment`}>
                      <Button
                        onClick={() => handlePayment('stripe')}
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-lg relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-10 transition-opacity" />
                        <div className="flex items-center justify-center w-full">
                          <CreditCard className="w-6 h-6 mr-3" />
                          <span>Credit/Debit Card</span>
                          <span className="ml-2 text-blue-100 text-sm font-normal">
                            (Powered by Stripe)
                          </span>
                        </div>
                      </Button>
                      </Link>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    >
                      <Button
                        onClick={() => handlePayment('crypto')}
                        size="lg"
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-6 text-lg relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-10 transition-opacity" />
                        <div className="flex items-center justify-center w-full">
                          <Bitcoin className="w-6 h-6 mr-3" />
                          <span>Crypto Payment</span>
                          <span className="ml-2 text-purple-100 text-sm font-normal">
                            (BTC, ETH, USDC)
                          </span>
                        </div>
                      </Button>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-sm text-gray-400 space-y-1"
                  >
                    <p>256-bit SSL encrypted transactions</p>
                    <p>Secured by blockchain technology</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <button
                      onClick={() => setShowPaymentOptions(false)}
                      className="text-sky-600 hover:text-sky-700 text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to appointment details
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </LayoutGroup>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}