/**
 * Authentication and Persona Detection Utilities for Sahaaya
 * Standardizes reliable detection between demo personas, authenticated real users with a Care Circle,
 * and authenticated real users without a Care Circle.
 */

export const isUserDemoPersona = (user) => {
  if (!user) return true; // Unauthenticated preview defaults to demo persona
  if (user.is_demo) return true;
  if (typeof user.id === 'string' && (user.id.startsWith('demo-') || user.id.startsWith('mock-'))) return true;
  if (user.email && (user.email.endsWith('.demo') || user.email.includes('@sahaaya.demo') || user.email.includes('.demo@'))) return true;
  return false;
};
