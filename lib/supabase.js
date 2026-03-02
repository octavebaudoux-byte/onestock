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

// ─── Communauté ───────────────────────────────────────────────────────────────

// Lire les préférences communauté d'un utilisateur
export async function getCommunityPrefs(userId) {
  if (!supabase || !userId) return null
  const { data } = await supabase
    .from('community_prefs')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data
}

// Sauvegarder les préférences communauté
export async function updateCommunityPrefs(userId, prefs) {
  if (!supabase || !userId) return { error: 'Non configuré' }
  const { error } = await supabase
    .from('community_prefs')
    .upsert({ user_id: userId, ...prefs, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  return { error: error?.message || null }
}

// Récupérer les ventes communautaires pour un sneaker (par nom ou SKU)
export async function getCommunitySales(name, sku) {
  if (!supabase) return []

  // Récupérer les user_ids qui ont activé le partage
  const { data: prefs } = await supabase
    .from('community_prefs')
    .select('user_id, show_name, display_name')
    .eq('share_sales', true)

  if (!prefs || prefs.length === 0) return []

  const userIds = prefs.map(p => p.user_id)

  // Construire le filtre par nom ou SKU
  let query = supabase
    .from('sneakers')
    .select('name, brand, size, sell_price, buy_price, fees, sell_date, sell_platform, user_id, sku')
    .eq('status', 'sold')
    .in('user_id', userIds)
    .order('sell_date', { ascending: false })
    .limit(50)

  if (sku) {
    query = query.ilike('sku', `%${sku}%`)
  } else if (name) {
    query = query.ilike('name', `%${name}%`)
  } else {
    return []
  }

  const { data: sales } = await query
  if (!sales) return []

  // Joindre avec les prefs pour le nom
  return sales.map(s => {
    const pref = prefs.find(p => p.user_id === s.user_id)
    const profit = (s.sell_price || 0) - (s.buy_price || 0) - (s.fees || 0)
    return {
      name: s.name,
      brand: s.brand,
      size: s.size,
      sellPrice: s.sell_price,
      buyPrice: s.buy_price,
      fees: s.fees || 0,
      profit,
      sellDate: s.sell_date,
      platform: s.sell_platform,
      seller: pref?.show_name && pref?.display_name ? pref.display_name : 'Anonyme',
    }
  })
}

// ─── Upload Image ──────────────────────────────────────────────────────────────

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
