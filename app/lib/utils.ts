import jwt from 'jsonwebtoken'
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const generateToken = (payload: object) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' })
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!)
}




/**
 * Merges class names using clsx and tailwind-merge
 * @param inputs - Class names or conditional class objects.
 * @returns A merged string of class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to a readable string (e.g., "Jan 1, 2025").
 * @param date - A Date object or a valid date string.
 * @returns Formatted date string.
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(date));
}

/**
 * Debounces a function, ensuring it only runs after a specified delay.
 * Useful for limiting frequent function calls (e.g., search inputs).
 * @param func - Function to debounce.
 * @param delay - Time in milliseconds to delay.
 * @returns A debounced function.
 */
export function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

/**
 * Capitalizes the first letter of a string.
 * @param str - Input string.
 * @returns Capitalized string.
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}