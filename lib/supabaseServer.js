import { createClient } from '@supabase/supabase-js'

// Client Supabase pour le SERVEUR SEULEMENT avec clé service_role
// Cette clé bypass le RLS - NE JAMAIS exposer au client !
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabaseServer = null

if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export { supabaseServer }
