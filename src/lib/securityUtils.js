/**
 * SAHAAYA SECURITY & VALIDATION UTILITIES
 * Client-side sanitization, format verification, and accessibility mathematics.
 */

/**
 * Sanitizes untrusted user input to prevent XSS injection.
 * Strips HTML tags, script blocks, and dangerous javascript: protocols.
 * @param {string} input - Raw user input string
 * @returns {string} Sanitized plain-text string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Validates whether a given string is a valid RFC 4122 UUID v4.
 * @param {string} str - Candidate string
 * @returns {boolean} True if string is a valid UUID
 */
export function validateUUID(str) {
  if (typeof str !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Validates standard 24-hour time format (HH:mm or HH:mm:ss).
 * @param {string} timeStr - Candidate time string
 * @returns {boolean} True if time string is valid
 */
export function validateTimeFormat(timeStr) {
  if (typeof timeStr !== 'string') return false;
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;
  return timeRegex.test(timeStr);
}

/**
 * Validates whether an email address conforms to standard format without malicious characters.
 * @param {string} email - Candidate email string
 * @returns {boolean} True if email is valid
 */
export function validateEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Computes the relative luminance of an sRGB color per WCAG 2.1 specifications.
 * Formula: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 * @param {number} r - Red channel (0-255)
 * @param {number} g - Green channel (0-255)
 * @param {number} b - Blue channel (0-255)
 * @returns {number} Relative luminance value (0 to 1)
 */
export function calculateRelativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Computes the WCAG contrast ratio between two relative luminance values.
 * Formula: (L1 + 0.05) / (L2 + 0.05) where L1 is the lighter color.
 * @param {number} lum1 - Relative luminance of color 1
 * @param {number} lum2 - Relative luminance of color 2
 * @returns {number} Contrast ratio (e.g. 7.5 for 7.5:1)
 */
export function calculateContrastRatio(lum1, lum2) {
  const l1 = Math.max(lum1, lum2);
  const l2 = Math.min(lum1, lum2);
  return Number(((l1 + 0.05) / (l2 + 0.05)).toFixed(2));
}
