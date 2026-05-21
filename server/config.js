import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.resolve(__dirname, '..');
export const DATA_DIR = path.join(ROOT_DIR, 'server', 'data');
export const DB_PATH = path.join(DATA_DIR, 'igo-nursery.db');
export const API_PORT = Number(process.env.API_PORT || 4000);
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@igo.local';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24;

// Real SMTP Configuration
export const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
export const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
export const SMTP_USER = process.env.SMTP_USER || 'igonursery@gmail.com';
export const SMTP_PASS = process.env.SMTP_PASS || 'biqo eqde vsgu oobw';

// Supabase Configuration (Required for Vercel/Production)
export const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://coeqpwckaepquphacwws.supabase.co';
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
