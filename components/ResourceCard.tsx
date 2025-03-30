// components/ResourceCard.tsx
'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export default function ResourceCard({
  icon,
  title,
  description,
  color = 'blue'
}: {
  icon: ReactNode;
  title: string;
  description: string;
  color?: 'blue' | 'purple' | 'green';
}) {
  const colors = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800'
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800'
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800'
    }
  };

  return (
    <motion.div
      className={`p-6 bg-white dark:bg-dark-800 rounded-xl border ${colors[color].border} hover:shadow-lg transition-all`}
      whileHover={{ scale: 1.05 }}
    >
      <div className="flex items-center gap-4">
        <div className={`${colors[color].bg} p-3 rounded-lg`}>
          <span className={colors[color].text}>{icon}</span>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}