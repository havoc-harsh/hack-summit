"use client";

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/context/notifications-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

// Fix the TypeScript error for webkitAudioContext
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export function NotificationBell() {
  const { notifications, markAsRead, unreadCount, clearNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  // Log notifications when they change
  useEffect(() => {
    console.log('Notifications in bell component:', notifications);
    console.log('Unread count:', unreadCount);
  }, [notifications, unreadCount]);

  // Add listener for ESC key to close popup
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setActiveNotification(null);
      }
    };

    if (isOpen || activeNotification) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, activeNotification]);

  // Add this improved click outside handler to replace the existing one
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Don't close if clicking inside the notification panel or bell
      if (isOpen && 
         !target.closest('.notification-panel') && 
         !target.closest('.notification-bell')) {
        setIsOpen(false);
      }

      // Don't close if clicking inside the notification detail popup
      if (activeNotification && !target.closest('.notification-detail-popup')) {
        setActiveNotification(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, activeNotification]);

  const toggleNotifications = () => {
    console.log('Toggling notifications panel, current state:', isOpen);
    setIsOpen(!isOpen);
    // Close any active notification when toggling the panel
    setActiveNotification(null);
  };

  const handleNotificationClick = (id: string) => {
    console.log('Notification clicked:', id);
    markAsRead(id);
    setActiveNotification(id);
  };

  // Format notification time
  const formatNotificationTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    
    return `${diffDays}d ago`;
  };

  // Play notification sound (from the code in notification.js)
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 880; // A5 note
      
      gainNode.gain.value = 0.1;
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
      
      return true;
    } catch (error) {
      console.error("Error playing notification sound:", error);
      return false;
    }
  };

  const activeNotificationData = activeNotification 
    ? notifications.find(n => n.id === activeNotification) 
    : null;

  return (
    <div className="relative z-50">
      <button 
        className="notification-bell relative flex items-center justify-center p-2 rounded-full hover:bg-gray-100"
        onClick={toggleNotifications}
        aria-label={`${unreadCount} unread notifications`}
      >
        <Bell className="h-5 w-5 text-gray-600" />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Background overlay */}
      {(isOpen || activeNotification) && (
        <div 
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity ${
            activeNotification ? 'opacity-80' : 'opacity-40'
          }`} 
          onClick={() => {
            console.log('Background overlay clicked');
            setIsOpen(false);
            setActiveNotification(null);
          }}
        />
      )}

      {/* Notification List Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="notification-panel fixed z-50 inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white/95 backdrop-blur-sm w-[95%] max-w-lg rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-sky-50 to-indigo-50">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-indigo-500" />
                  Notifications
                </h3>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        console.log('Clearing all notifications');
                        clearNotifications();
                      }}
                      className="text-xs h-7 text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-7 w-7 p-0 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    aria-label="Close notifications"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-[70vh]">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${notification.read ? 'opacity-60' : ''}`}
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`h-2.5 w-2.5 mt-2 rounded-full flex-shrink-0 ${notification.read ? 'bg-gray-300' : 
                          notification.type === 'success' ? 'bg-green-500' : 
                          notification.type === 'error' ? 'bg-red-500' : 
                          'bg-blue-500'}`} 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 break-words">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatNotificationTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                    <Bell className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-400">No notifications</p>
                  </div>
                )}
              </div>
              
              {/* Footer with close button */}
              <div className="p-4 border-t border-gray-100 flex justify-center">
                <Button
                  onClick={() => setIsOpen(false)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-2 rounded-full transition-all"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Detail Popup */}
      <AnimatePresence>
        {activeNotificationData && (
          <motion.div 
            className="notification-detail-popup fixed z-50 inset-0 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div 
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] max-w-lg w-full p-6 max-h-[80vh] overflow-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  activeNotificationData.type === 'success' ? 'bg-green-100 text-green-500' : 
                  activeNotificationData.type === 'error' ? 'bg-red-100 text-red-500' : 
                  'bg-blue-100 text-blue-500'}`}
                >
                  {activeNotificationData.type === 'success' ? 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg> : 
                    activeNotificationData.type === 'error' ?
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg> :
                    <Bell className="h-6 w-6" />
                  }
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {activeNotificationData.type === 'success' ? 'Success' : 
                     activeNotificationData.type === 'error' ? 'Alert' : 
                     'Notification'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatNotificationTime(activeNotificationData.timestamp)}
                  </p>
                </div>
              </div>
              
              <p className="text-base mb-6 text-gray-700 leading-relaxed">{activeNotificationData.message}</p>
              
              {activeNotificationData.hospitalName && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-4">
                  <p className="text-sm font-medium text-gray-700">Hospital</p>
                  <p className="text-sm text-gray-800 font-medium">{activeNotificationData.hospitalName}</p>
                </div>
              )}
              
              {activeNotificationData.appointmentId && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Appointment ID</p>
                  <p className="text-sm text-gray-800 font-medium">#{activeNotificationData.appointmentId}</p>
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={() => setActiveNotification(null)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-2 rounded-full transition-all"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}