'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BellIcon, CalendarIcon, UsersIcon, HomeIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/hospital', icon: HomeIcon },
  { name: 'Appointments', href: '/hospital/appointments', icon: CalendarIcon },
  { name: 'Patients', href: '/hospital/patients', icon: UsersIcon },
  { name: 'Alerts', href: '/hospital/alerts', icon: BellIcon },
  { name: 'Analytics', href: '/hospital/stats', icon: ChartBarIcon },
];

export default function HospitalNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 px-2 py-4 bg-blue-700">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`${
              isActive
                ? 'bg-blue-800 text-white'
                : 'text-blue-100 hover:bg-blue-600'
            } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
          >
            <item.icon
              className={`${
                isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'
              } mr-3 flex-shrink-0 h-6 w-6`}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
} 