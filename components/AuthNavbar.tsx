// components/Navbar.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { X, Menu, ChevronDown, Building2, User, ArrowRight } from 'lucide-react';
import Image from "next/image";
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [showGetStartedOptions, setShowGetStartedOptions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const links = [
    { name: 'Dashboard', href: '/patient/dashboard' },
    { 
      name: 'Features', 
      href: '#features',
      subLinks: [
        { name: 'Bed Tracking', href: '/services' },
        { name: 'Doctor Search', href: '/services' },
        { name: 'Emergency Services', href: '/services' },
      ]
    },
    { name: 'Hospitals', href: '/hospital' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowGetStartedOptions(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 backdrop-blur-md transition-all  ${
        isScrolled 
          ? 'bg-white/95 shadow-lg'
          : 'bg-white/90'
      }`}
      
    >
      <div className="flex items-center justify-between h-16 lg:h-20">
        {/* Logo */}
       {/* Logo */}
       <Link href="/" className="flex items-center gap-2">
          <Image src="/medicare-logo-final.svg" alt="Medicare+" width={50} height={50} className="rounded-full" />
          <span className="text-xl font-bold text-gray-900 drop-shadow-md">
            Medicare+
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {links.map((link) => (
              <div 
                key={link.name}
                className="relative group"
                onMouseEnter={() => link.subLinks && setIsFeaturesOpen(true)}
                onMouseLeave={() => link.subLinks && setIsFeaturesOpen(false)}
              >
                <Link 
                  href={link.href}
                  className="flex items-center gap-1 text-gray-900/90 hover:text-blue-600 transition-colors drop-shadow-md"
                >
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-blue-600 hover:after:w-full after:transition-all"
                  >
                    {link.name}
                  </motion.span>
                  {link.subLinks && (
                    <ChevronDown className="w-4 h-4 text-gray-900/80 transition-transform group-hover:rotate-180" />
                  )}
                </Link>

                {link.subLinks && (
                  <AnimatePresence>
                    {isFeaturesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-48 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl border-[0.5px] border-blue-950"
                      >
                        <div className="p-2 space-y-2">
                          {link.subLinks.map((subLink) => (
                            <Link
                              key={subLink.name}
                              href={subLink.href}
                              className="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              <motion.span
                                whileHover={{ x: 5 }}
                                className="flex items-center gap-2"
                              >
                                <ArrowRight className="w-4 h-4 text-cyan-500" />
                                {subLink.name}
                              </motion.span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>

          
          {/* Uncomment below if you want the "Get Started" options. */}
          {/* <div className="flex items-center gap-4 ml-6" ref={dropdownRef}>
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowGetStartedOptions(!showGetStartedOptions)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full font-semibold hover:shadow-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-blue-400/30"
              >
                Get Started
                <ChevronDown className={`w-4 h-4 transition-transform ${showGetStartedOptions ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {showGetStartedOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl border-[0.5px] border-blue-950"
                  >
                    <div className="p-2 space-y-2">
                      <Link
                        href="/auth/hospital/register"
                        className="flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                        onClick={() => setShowGetStartedOptions(false)}
                      >
                        <Building2 className="w-5 h-5 text-cyan-500" />
                        <span>Register Hospital</span>
                      </Link>
                      <Link
                        href="/auth/patient/login"
                        className="flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                        onClick={() => setShowGetStartedOptions(false)}
                      >
                        <User className="w-5 h-5 text-blue-600" />
                        <span>Patient Login</span>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div> */}
         
        </div>

        {/* Mobile Menu Button */}
        <motion.button 
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 text-gray-900 hover:text-blue-600 rounded-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden bg-white/90 backdrop-blur-sm border-b-[0.5px] border-blue-950"
          >
            <div className="pt-4 pb-6 space-y-4">
              {links.map((link) => (
                <div key={link.name} className="px-4">
                  <Link
                    href={link.href}
                    className="block py-2 text-gray-800 hover:text-blue-600"
                    onClick={() => setIsOpen(false)}
                  >
                    <motion.span
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2"
                    >
                      {link.name}
                    </motion.span>
                  </Link>
                  {link.subLinks?.map((subLink) => (
                    <Link
                      key={subLink.name}
                      href={subLink.href}
                      className="block py-2 pl-6 text-gray-600 hover:text-blue-600"
                      onClick={() => setIsOpen(false)}
                    >
                      <motion.span
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-2"
                      >
                        <ArrowRight className="w-4 h-4 text-cyan-500" />
                        {subLink.name}
                      </motion.span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}