/**
 * Utility functions for media URL validation and handling.
 */

/**
 * Checks if a URL is a temporary local blob URL (e.g. `blob:http://localhost:3000/...`).
 * Local blob URLs cannot be loaded across browser sessions or on production deployments.
 */
export function isLocalBlobUrl(url?: string): boolean {
  if (!url) return false;
  return url.startsWith("blob:");
}

/**
 * Validates if a media URL is renderable in browser elements without throwing security errors.
 */
export function isValidMediaUrl(url?: string): boolean {
  if (!url) return false;
  if (url.startsWith("blob:")) return false;
  return true;
}
