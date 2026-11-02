// All values come from NEXT_PUBLIC_* env vars (see .env.example).
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://vgreen-assessment.onrender.com/api').replace(/\/$/, '');
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999').replace(/\D/g, '');
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';
export const SITE_NAME = 'Tribe Green';
