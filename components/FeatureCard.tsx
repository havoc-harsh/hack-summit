'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export default function FeatureCard({
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
      text: 'text-blue-600 dark:text-blue-400'
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400'
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-600 dark:text-green-400'
    }
  };

  return (
    <motion.div
      className="p-8 bg-white dark:bg-dark-700 rounded-2xl border border-gray-200 dark:border-dark-600 hover:border-blue-200 dark:hover:border-blue-600 transition-all"
      whileHover={{ y: -5 }}
    >
      <div className={`${colors[color].bg} w-fit p-4 rounded-lg mb-6`}>
        <div className={colors[color].text}>{icon}</div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </motion.div>
  );
}