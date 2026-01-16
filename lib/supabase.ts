import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Only create client if we have valid credentials
export const supabase = supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey && supabaseAnonKey !== 'placeholder-key'
  ? createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
    })
  : null

