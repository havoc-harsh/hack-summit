'use client';
import AboutSection from '@/components/About';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  User,
  ArrowRight,
  Bed,
  Stethoscope,
  Ambulance,
  HeartPulse,
  Check,
  Shield,
  Calendar,
  Activity,
  Clipboard
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function LandingPage() {
  const [showOptions, setShowOptions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white pt-20 lg:pt-0">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[calc(100vh-64px)] lg:h-screen flex items-center px-4 overflow-hidden">
        {/* Desktop Background: Video */}
        <div className="absolute inset-0 z-0 hidden lg:block">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="https://cdn.pixabay.com/video/2022/09/08/130591-747868243_large.mp4" type="video/mp4" />
          </video>
        </div>
        {/* Mobile/Tablet Background: Light Blue Gradient */}
        <div className="absolute inset-0 z-0 lg:hidden bg-gradient-to-br from-blue-50 to-cyan-50"></div>

        {/* Grid Container */}
        <div className="container mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
          {/* Stats Cards Column */}
          <motion.div
            className="flex flex-col justify-center order-2 lg:order-none lg:col-span-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="grid grid-cols-1 gap-8">
              <div style={{ width: '60%' }} className="mx-auto">
                <StatCard
                  icon={<Bed className="w-8 h-8 text-blue-600" />}
                  value="2,345+"
                  label="Available Beds"
                />
              </div>
              <div style={{ width: '70%' }} className="mx-auto">
                <StatCard
                  icon={<Stethoscope className="w-8 h-8 text-cyan-600" />}
                  value="850+"
                  label="Medical Experts"
                />
              </div>
              <div style={{ width: '80%' }} className="mx-auto">
                <StatCard
                  icon={<Ambulance className="w-8 h-8 text-green-600" />}
                  value="112"
                  label="Active Ambulances"
                />
              </div>
            </div>
          </motion.div>

          {/* Main Content Column */}
          <motion.div
            className="flex flex-col justify-center pr-10 order-1 lg:order-none lg:col-start-3 lg:col-span-1 text-center lg:text-right"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl pb-3 font-bold mb-6 bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">
              Modern Healthcare Management
            </h1>
            <p className="text-base md:text-xl text-gray-700 mb-8 font-medium max-w-2xl mx-auto">
              Transform healthcare delivery with real-time resource tracking and intelligent patient coordination
            </p>

            <div className="relative inline-block">
              <div className="flex flex-col items-center gap-4 min-h-[56px]">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col md:flex-row gap-4"
                >
                  <motion.div initial={{ x: -20 }} animate={{ x: 0 }} transition={{ delay: 0.1 }}>
                    <Link
                      href="/auth/hospital/register"
                      className="flex items-center gap-3 px-6 py-4 bg-white border-2 border-blue-100 rounded-xl hover:border-blue-200 hover:shadow-lg transition-all"
                    >
                      <Building2 className="w-6 h-6 text-blue-600" />
                      <span className="text-gray-900 font-medium">Register Hospital</span>
                      <ArrowRight className="w-5 h-5 ml-2 text-blue-600" />
                    </Link>
                  </motion.div>

                  <motion.div initial={{ x: 20 }} animate={{ x: 0 }} transition={{ delay: 0.2 }}>
                    <Link
                      href="/auth/patient/login"
                      className="flex items-center gap-3 px-6 py-4 bg-white border-2 border-blue-100 rounded-xl hover:border-blue-200 hover:shadow-lg transition-all"
                    >
                      <User className="w-6 h-6 text-cyan-600" />
                      <span className="text-gray-900 font-medium">Patient Login</span>
                      <ArrowRight className="w-5 h-5 ml-2 text-cyan-600" />
                    </Link>
                  </motion.div>
                </motion.div>

                {/* New "Doctor Bera AI" Button, centered below the above buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mx-auto"
                >
                  <Link
                    href="/drbera"
                    className="flex items-center gap-3 px-6 py-4 bg-white border-2 border-blue-100 rounded-xl hover:border-blue-200 hover:shadow-lg transition-all"
                  >
                    <Stethoscope className="w-6 h-6 text-green-600" />
                    <span className="text-gray-900 font-medium">Doctor Bera AI</span>
                    <ArrowRight className="w-5 h-5 ml-2 text-green-600" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-cyan-50">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Healthcare Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform healthcare delivery with our modular solution stack
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[minmax(300px,auto)]">
            <motion.div
              className="md:col-span-2 md:row-span-2 relative group p-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl text-white overflow-hidden shadow-xl"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative z-10">
                <div className="mb-6 p-3 w-fit rounded-lg bg-white/10 backdrop-blur-sm">
                  <Activity className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Real-time Operations Dashboard</h3>
                <p className="text-lg mb-6 opacity-90">
                  Centralized monitoring of all hospital resources with AI-powered insights
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    Live bed availability tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    Emergency resource alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    Staff allocation heatmaps
                  </li>
                </ul>
                <div className="flex items-center gap-2 font-medium">
                  <Link href="/auth/patient/login">
                    <span>Explore Dashboard</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 backdrop-blur-sm" />
            </motion.div>

            <motion.div
              className="md:row-span-2 bg-white rounded-2xl border-2 border-gray-100 p-8 hover:border-blue-200 hover:shadow-lg transition-all shadow-sm"
              whileHover={{ y: -5 }}
            >
              <div className="h-full flex flex-col">
                <div className="mb-6 p-3 w-fit rounded-lg bg-blue-50 text-blue-600">
                  <Clipboard className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Digital Health Records</h3>
                <p className="text-gray-600 mb-6 flex-1">
                  Secure, interoperable EHR system with patient-controlled access
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-600" />
                    <span className="text-blue-600">HIPAA Compliant</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-cyan-50 rounded-lg">
                    <User className="w-6 h-6 text-cyan-600" />
                    <span className="text-cyan-600">Patient Portal Integration</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="md:col-span-2 bg-white rounded-2xl border-2 border-gray-100 p-8 hover:border-blue-200 hover:shadow-lg transition-all shadow-sm"
              whileHover={{ y: -5 }}
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="mb-6 p-3 w-fit rounded-lg bg-cyan-50 text-cyan-600">
                    <Stethoscope className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Hospitals</h3>
                  <p className="text-gray-600 mb-6">
                    Virtual care platform with integrated diagnostics and prescription management
                  </p>
                </div>
                <div className="flex-1 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6">
                  <div className="space-y-4">
                    <Link href="/hospital">
                      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                        <h4 className="font-semibold mb-2">Book Appointment</h4>
                        <p className="text-sm text-gray-600">Consult the doctor hastle free</p>
                      </div>
                    </Link>
                    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                      <h4 className="font-semibold mb-2">AI Diagnostics</h4>
                      <p className="text-sm text-gray-600">Symptom analysis and triage</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            <Link href="/services">
              <FeatureCard
                icon={<Ambulance className="w-8 h-8" />}
                title="Emergency Response"
                description="Integrated emergency dispatch system with live tracking"
                color="red"
              />
            </Link>

            <FeatureCard
              icon={<Check className="w-8 h-8" />}
              title="Advanced Analytics"
              description="Predictive modeling for resource optimization"
              color="blue"
            />
            <Link href="/hospital">
              <FeatureCard
                icon={<Calendar className="w-8 h-8" />}
                title="Smart Scheduling"
                description="Schedule appointment by nearby providers"
                color="green"
              />
            </Link>
            <Link href="/auth/hospital/login">
              <FeatureCard
                icon={<HeartPulse className="w-8 h-8" />}
                title="Patient Monitoring"
                description="24/7 remote patient monitoring with real-time alerts"
                color="cyan"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="container mx-auto text-center">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Transform Healthcare?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join hundreds of hospitals already improving patient care with our platform
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link
                href="/register-hospital"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center"
              >
                <Building2 className="w-5 h-5" />
                Register Hospital
              </Link>
              <Link
                href="/patient-login"
                className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold border-2 border-gray-200 hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-2 justify-center"
              >
                <User className="w-5 h-5" />
                Patient Portal
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

const StatCard = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string; }) => (
  <motion.div
    className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all"
    whileHover={{ y: -5 }}
  >
    <div className="flex items-center gap-4">
      <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
        {icon}
      </div>
      <div className="text-left">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-gray-600 text-sm">{label}</div>
      </div>
    </div>
  </motion.div>
);

const FeatureCard = ({ icon, title, description, color = 'blue' }: { icon: React.ReactNode; title: string; description: string; color?: 'blue' | 'green' | 'red' | 'cyan'; }) => {
  const colors = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' }
  };

  return (
    <motion.div
      className={`group bg-white rounded-xl border-2 ${colors[color].border} hover:border-blue-300 hover:shadow-lg transition-all p-8 shadow-sm`}
      whileHover={{ y: -5 }}
    >
      <div className={`mb-6 p-3 w-fit rounded-lg ${colors[color].bg} ${colors[color].text}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <div className="flex items-center gap-2 text-blue-600 font-medium">
        <span>Learn more</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>
    </motion.div>
  );
};