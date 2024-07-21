import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zauzsrufnptndqzwosti.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)