
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jlrebhhlcnedlgxyfoci.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpscmViaGhsY25lZGxneHlmb2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NTgzNTMsImV4cCI6MjA4NjEzNDM1M30.bMrVLGN3wVvqSLW4GhxDOpfm64Sc4RVHbu9h9Bau7HY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
