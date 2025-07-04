// Supabase client configuration for bolt-version branch
// This file will be automatically generated once you provide the new credentials

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// These will be updated with your new project credentials
const SUPABASE_URL = "https://your-new-project-ref.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "your-new-anon-key-here";

// Create client for bolt-version branch
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Export for easy switching between environments
export const supabaseBoltVersion = supabase;