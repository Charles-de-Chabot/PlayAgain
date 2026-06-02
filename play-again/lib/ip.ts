import { headers } from 'next/headers';

/**
 * Robustly retrieves the client IP address from the request headers.
 * Accounts for various proxies (Vercel, Cloudflare, AWS, Nginx, etc.).
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  
  // Standard header used by most reverse proxies (e.g. Vercel, Cloudflare)
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    // The first IP in the list is the actual client IP
    return forwardedFor.split(',')[0].trim();
  }
  
  // Alternative real IP headers
  const realIp = headersList.get('x-real-ip');
  if (realIp) return realIp;
  
  // Fallback for local development
  return '127.0.0.1';
}
