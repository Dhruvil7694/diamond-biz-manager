// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://moxgvggrykayzxassahv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1veGd2Z2dyeWtheXp4YXNzYWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMTk5ODIsImV4cCI6MjA1OTc5NTk4Mn0.3fjfe22AgLcHPrRXmhtid0KMsXQB5eIVZEPtxOnSttw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);