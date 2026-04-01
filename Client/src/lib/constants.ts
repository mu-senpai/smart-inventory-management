/**
 * Centralized constants for the Smart Inventory application.
 * Using a single source of truth for the backend URL prevents synchronization 
 * issues between Server Components and Client-side proxies.
 */

export const BACKEND_URL = 
  process.env.NEXT_PUBLIC_BASE_URL || 
  "https://smart-inventory-api.vercel.app/api/v1"; 

// NOTE: Ensure NEXT_PUBLIC_BASE_URL is set in your Vercel Dashboard for production.
