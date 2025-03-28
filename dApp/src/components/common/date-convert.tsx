// dateFunctions.ts
import { useState, useEffect } from 'react';

/**
 * Ensures the input is a Date object.
 * @param {Date | string} date - The date input, either a Date object or an ISO string.
 * @returns {Date} A Date object.
 */
function ensureDate(date: Date | string): Date {
  return date instanceof Date ? date : new Date(date);
}

/**
 * Converts a Date object or ISO date string to a readable string format.
 * @param {Date | string} date - The Date object or ISO date string to convert.
 * @returns {string} A formatted, readable date string.
 */
export function convertToReadableDate(date: Date | string): string {
  const dateObj = ensureDate(date);
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  };
  return dateObj.toLocaleString('en-US', options);
}

/**
 * Calculates the countdown from now to a target date.
 * @param {Date | string} targetDate - The target Date object or ISO date string.
 * @returns {string} A formatted countdown string or a message if the date has passed.
 */
export function getCountdown(targetDate: Date | string): string {
  const target = ensureDate(targetDate);
  const now = new Date().getTime();
  const difference = target.getTime() - now;

  if (difference < 0) {
    return "The event has passed!";
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

/**
 * A custom hook that provides a live countdown to a target date.
 * @param {Date | string} targetDate - The target Date object or ISO date string.
 * @returns {string} A live updating countdown string.
 */
export function useLiveCountdown(targetDate: Date | string): string {
  const [countdown, setCountdown] = useState(getCountdown(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return countdown;
}