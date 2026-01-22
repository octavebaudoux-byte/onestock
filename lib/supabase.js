import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Client Supabase (côté client)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Vérifier si Supabase est configuré
export function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseAnonKey && supabase)
}

// Auth helpers
export async function signUp(email, password) {
  if (!supabase) return { error: { message: 'Supabase non configuré' } }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export async function signIn(email, password) {
  if (!supabase) return { error: { message: 'Supabase non configuré' } }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  if (!supabase) return { error: { message: 'Supabase non configuré' } }

  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getUser() {
  if (!supabase) return { user: null, error: null }

  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export async function getSession() {
  if (!supabase) return { session: null, error: null }

  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

// Écouter les changements d'auth
export function onAuthStateChange(callback) {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } }

  return supabase.auth.onAuthStateChange(callback)
}
