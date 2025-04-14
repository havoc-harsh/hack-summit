/**
 * Utility to notify the outbreak detection system about new appointments
 */

// The URL of the outbreak detection service
const OUTBREAK_DETECTION_URL = process.env.OUTBREAK_DETECTION_URL || 'http://localhost:8000';

/**
 * Notify the outbreak detection system about a new appointment
 * 
 * @param appointmentId The ID of the newly created appointment
 * @returns Promise resolving to the notification result
 */
export async function notifyOutbreakSystem(appointmentId: number): Promise<any> {
  try {
    const response = await fetch(`${OUTBREAK_DETECTION_URL}/notify/appointment/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ appointment_id: appointmentId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error notifying outbreak system:', errorData);
      return { success: false, error: errorData };
    }

    const data = await response.json();
    console.log('Outbreak detection notification sent successfully', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to notify outbreak detection system:', error);
    return { success: false, error };
  }
} 