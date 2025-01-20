import { createClient, SupabaseClient } from '@supabase/supabase-js'
 
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)
