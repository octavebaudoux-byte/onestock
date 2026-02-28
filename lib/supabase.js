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

// Upload d'une image vers Supabase Storage
export async function uploadSneakerImage(file, userId) {
  if (!supabase) return { url: null, error: 'Supabase non configuré' }

  const MAX_SIZE = 5 * 1024 * 1024 // 5MB
  if (file.size > MAX_SIZE) return { url: null, error: 'Image trop grande (max 5MB)' }

  const ext = file.name.split('.').pop().toLowerCase()
  const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif']
  if (!allowed.includes(ext)) return { url: null, error: 'Format non supporté (JPG, PNG, WEBP)' }

  const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('sneaker-images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (uploadError) return { url: null, error: uploadError.message }

  const { data } = supabase.storage.from('sneaker-images').getPublicUrl(fileName)
  return { url: data.publicUrl, error: null }
}
