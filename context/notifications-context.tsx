"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: Date;
  hospitalName?: string;
  appointmentId?: number;
}

interface NotificationsContextType {
  notifications: Notification[];
  addNotification: (message: string, type: NotificationType, appointmentId?: number, hospitalName?: string) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  unreadCount: number;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const STORAGE_KEY = 'medicare_notifications';

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Calculate unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Load notifications from localStorage on mount
  useEffect(() => {
    const loadNotifications = () => {
      try {
        const storedNotifications = localStorage.getItem(STORAGE_KEY);
        if (storedNotifications) {
          const parsed = JSON.parse(storedNotifications);
          console.log('Loaded notifications from localStorage:', parsed);
          // Convert string dates back to Date objects
          const notificationsWithDates = parsed.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          }));
          setNotifications(notificationsWithDates);
        }
      } catch (error) {
        console.error('Error loading notifications from localStorage:', error);
      }
    };

    loadNotifications();
    
    // Set up an event listener for storage changes in other tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        console.log('Storage event detected, reloading notifications');
        loadNotifications();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Set up an event listener for appointment status updates
    const handleStatusUpdate = (event: CustomEvent) => {
      console.log('Appointment status update event received:', event.detail);
      const { status, hospitalName, appointmentId } = event.detail;
      
      let message = '';
      let type: NotificationType = 'info';
      
      if (status === 'approved') {
        message = `Your appointment at ${hospitalName} has been approved. You can now proceed to payment.`;
        type = 'success';
      } else if (status === 'declined') {
        message = `Your appointment at ${hospitalName} has been declined.`;
        type = 'error';
      } else if (status === 'scheduled') {
        message = `Your appointment at ${hospitalName} has been scheduled. Waiting for confirmation.`;
        type = 'info';
      } else if (status === 'completed' && event.detail.payment) {
        message = `Payment for your appointment at ${hospitalName} has been completed.`;
        type = 'success';
      }
      
      if (message) {
        console.log('Adding notification:', message);
        addNotification(message, type, appointmentId, hospitalName);
      }
    };
    
    console.log('Setting up appointment_status_update event listener');
    window.addEventListener('appointment_status_update', handleStatusUpdate as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('appointment_status_update', handleStatusUpdate as EventListener);
      console.log('Removed event listeners');
    };
  }, []);

  // Function to save notifications to localStorage
  const saveNotifications = (updatedNotifications: Notification[]) => {
    try {
      console.log('Saving notifications to localStorage:', updatedNotifications);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotifications));
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error);
    }
  };

  // Add a new notification
  const addNotification = (
    message: string, 
    type: NotificationType = 'info', 
    appointmentId?: number,
    hospitalName?: string
  ) => {
    console.log('Adding notification:', { message, type, appointmentId, hospitalName });
    
    // First check if we already have this notification to avoid duplicates
    // Using appointmentId and status type to identify potential duplicates
    if (appointmentId) {
      const existingNotification = notifications.find(
        n => n.appointmentId === appointmentId && n.type === type && !n.read
      );
      
      if (existingNotification) {
        console.log('Notification already exists, not adding duplicate');
        return;
      }
    }
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      read: false,
      timestamp: new Date(),
      appointmentId,
      hospitalName
    };
    
    // For consistency, we read the latest state from localStorage before saving
    try {
      const storedNotifications = localStorage.getItem(STORAGE_KEY);
      let currentNotifications: Notification[] = [];
      
      if (storedNotifications) {
        const parsed = JSON.parse(storedNotifications);
        currentNotifications = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      }
      
      const updatedNotifications = [newNotification, ...currentNotifications];
      saveNotifications(updatedNotifications);
      
      // Dispatch a custom event to notify other tabs/windows
      const customEvent = new Event('storage');
      window.dispatchEvent(customEvent);
    } catch (error) {
      console.error('Error updating notifications:', error);
      // Fallback to the state we have
      const updatedNotifications = [newNotification, ...notifications];
      saveNotifications(updatedNotifications);
    }
  };

  // Mark a notification as read
  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    saveNotifications(updatedNotifications);
  };

  // Clear all notifications
  const clearNotifications = () => {
    saveNotifications([]);
  };

  return (
    <NotificationsContext.Provider 
      value={{ 
        notifications, 
        addNotification, 
        markAsRead, 
        clearNotifications,
        unreadCount
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}; 