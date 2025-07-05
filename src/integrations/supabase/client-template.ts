// Template for updating Supabase client configuration
// Copy this file to client.ts and update with your credentials

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Replace these with your own Supabase project credentials
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";

// Validation to ensure environment variables are set
if (!SUPABASE_URL || SUPABASE_URL === "YOUR_SUPABASE_PROJECT_URL") {
  console.error("❌ VITE_SUPABASE_URL is not set in environment variables");
}

if (!SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY === "YOUR_SUPABASE_ANON_KEY") {
  console.error("❌ VITE_SUPABASE_ANON_KEY is not set in environment variables");
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Optional: Add development helpers
if (import.meta.env.DEV) {
  console.log("🔗 Supabase client initialized for development");
  console.log("📍 Project URL:", SUPABASE_URL);
  console.log("🔑 Using anon key:", SUPABASE_PUBLISHABLE_KEY ? "✅ Set" : "❌ Missing");
}