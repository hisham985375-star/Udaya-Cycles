import slugifyLib from "slugify";

/**
 * Generate URL-safe slug from text
 */
export function generateSlug(text: string): string {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}

/**
 * Generate unique order number
 * Format: UC-YYYY-XXXXX (5-digit sequential, padded)
 */
export function generateOrderNumber(sequenceNumber: number): string {
  const year = new Date().getFullYear();
  const padded = sequenceNumber.toString().padStart(5, "0");
  return `UC-${year}-${padded}`;
}

/**
 * Generate a cryptographically random token
 */
export function generateToken(length = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Truncate text to given length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(text: string): string {
  return text.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if value is a valid MongoDB ObjectId string
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Paginate query params
 */
export function getPaginationParams(
  page: string | null,
  limit: string | null
): { skip: number; limit: number; page: number } {
  const pageNum = Math.max(1, parseInt(page ?? "1", 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit ?? "20", 10)));
  return { page: pageNum, skip: (pageNum - 1) * limitNum, limit: limitNum };
}
