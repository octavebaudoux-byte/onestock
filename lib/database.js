import { supabase, isSupabaseConfigured } from './supabase'

// ===== SNEAKERS CRUD =====

// Charger toutes les sneakers de l'utilisateur
export async function loadSneakers(userId) {
  if (!isSupabaseConfigured() || !userId) return []

  const { data, error } = await supabase
    .from('sneakers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading sneakers:', error)
    return []
  }

  // Convertir les noms de colonnes snake_case en camelCase
  return (data || []).map(snakeToCamel)
}

// Colonnes valides pour la table sneakers
const SNEAKER_COLUMNS = [
  'user_id', 'name', 'brand', 'sku', 'size', 'category', 'condition',
  'buy_price', 'buy_date', 'buy_platform',
  'sell_price', 'sell_date', 'sell_platform', 'fees',
  'target_sell_price', 'listed_on_platforms',
  'status', 'image_url', 'invoice_url',
  'source', 'buyer_name', 'notes',
  'item_received', 'payment_status', 'delivery_status'
]

// Colonnes de type date (doivent être null si vides)
const DATE_COLUMNS = ['buy_date', 'sell_date', 'date']

// Nettoyer les valeurs pour Supabase (chaînes vides -> null pour les dates)
function sanitizeForSupabase(row) {
  const result = { ...row }
  for (const col of DATE_COLUMNS) {
    // Seulement modifier si la colonne existe déjà dans row
    if (col in result && (result[col] === '' || result[col] === undefined)) {
      result[col] = null
    }
  }
  return result
}

// Ajouter une sneaker
export async function addSneaker(userId, sneaker) {
  if (!isSupabaseConfigured() || !userId) return null

  // Convertir en snake_case et filtrer les colonnes valides
  const allFields = camelToSnake({
    ...sneaker,
    userId: userId,
  })

  // Ne garder que les colonnes qui existent dans la table
  const row = {}
  for (const col of SNEAKER_COLUMNS) {
    if (allFields[col] !== undefined) {
      row[col] = allFields[col]
    }
  }

  // Nettoyer les dates vides
  const cleanRow = sanitizeForSupabase(row)

  const { data, error } = await supabase
    .from('sneakers')
    .insert(cleanRow)
    .select()
    .single()

  if (error) {
    console.error('Error adding sneaker:', error)
    return null
  }

  return snakeToCamel(data)
}

// Mettre à jour une sneaker
export async function updateSneaker(userId, sneakerId, updates) {
  if (!isSupabaseConfigured() || !userId) return null

  const allFields = camelToSnake(updates)

  // Ne garder que les colonnes valides (sans user_id et id)
  const row = {}
  for (const col of SNEAKER_COLUMNS) {
    if (col !== 'user_id' && allFields[col] !== undefined) {
      row[col] = allFields[col]
    }
  }

  // Nettoyer les dates vides
  const cleanRow = sanitizeForSupabase(row)

  const { data, error } = await supabase
    .from('sneakers')
    .update(cleanRow)
    .eq('id', sneakerId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating sneaker:', error)
    return null
  }

  return snakeToCamel(data)
}

// Supprimer une sneaker
export async function deleteSneaker(userId, sneakerId) {
  if (!isSupabaseConfigured() || !userId) return false

  const { error } = await supabase
    .from('sneakers')
    .delete()
    .eq('id', sneakerId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting sneaker:', error)
    return false
  }

  return true
}

// ===== EXPENSES CRUD =====

// Colonnes valides pour la table expenses
const EXPENSE_COLUMNS = ['user_id', 'name', 'amount', 'date', 'category', 'notes']

// Charger toutes les dépenses de l'utilisateur
export async function loadExpenses(userId) {
  if (!isSupabaseConfigured() || !userId) return []

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error loading expenses:', error)
    return []
  }

  return (data || []).map(snakeToCamel)
}

// Ajouter une dépense
export async function addExpense(userId, expense) {
  if (!isSupabaseConfigured() || !userId) return null

  const allFields = camelToSnake({
    ...expense,
    userId: userId,
  })

  // Ne garder que les colonnes valides
  const row = {}
  for (const col of EXPENSE_COLUMNS) {
    if (allFields[col] !== undefined) {
      row[col] = allFields[col]
    }
  }

  // Nettoyer les dates vides
  const cleanRow = sanitizeForSupabase(row)

  const { data, error } = await supabase
    .from('expenses')
    .insert(cleanRow)
    .select()
    .single()

  if (error) {
    console.error('Error adding expense:', error)
    return null
  }

  return snakeToCamel(data)
}

// Mettre à jour une dépense
export async function updateExpense(userId, expenseId, updates) {
  if (!isSupabaseConfigured() || !userId) return null

  const allFields = camelToSnake(updates)

  // Ne garder que les colonnes valides (sans user_id)
  const row = {}
  for (const col of EXPENSE_COLUMNS) {
    if (col !== 'user_id' && allFields[col] !== undefined) {
      row[col] = allFields[col]
    }
  }

  // Nettoyer les dates vides
  const cleanRow = sanitizeForSupabase(row)

  const { data, error } = await supabase
    .from('expenses')
    .update(cleanRow)
    .eq('id', expenseId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating expense:', error)
    return null
  }

  return snakeToCamel(data)
}

// Supprimer une dépense
export async function deleteExpense(userId, expenseId) {
  if (!isSupabaseConfigured() || !userId) return false

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting expense:', error)
    return false
  }

  return true
}

// ===== STATS =====

export async function loadStats(userId) {
  if (!isSupabaseConfigured() || !userId) return null

  const sneakers = await loadSneakers(userId)

  const inStock = sneakers.filter(s => s.status === 'stock')
  const sold = sneakers.filter(s => s.status === 'sold')

  const totalInvested = inStock.reduce((sum, s) => sum + (s.buyPrice || 0), 0)
  const totalRevenue = sold.reduce((sum, s) => sum + (s.sellPrice || 0), 0)
  const totalCost = sold.reduce((sum, s) => sum + (s.buyPrice || 0), 0)
  const totalFees = sold.reduce((sum, s) => sum + (s.fees || 0), 0)
  const totalProfit = totalRevenue - totalCost - totalFees

  return {
    totalPairs: sneakers.length,
    inStock: inStock.length,
    sold: sold.length,
    totalInvested,
    totalRevenue,
    totalProfit,
    avgProfit: sold.length > 0 ? totalProfit / sold.length : 0,
    profitMargin: totalCost > 0 ? ((totalProfit / totalCost) * 100) : 0,
    sneakers,
  }
}

// ===== HELPERS =====

// Convertir snake_case en camelCase
function snakeToCamel(obj) {
  if (!obj) return obj

  const result = {}
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    result[camelKey] = obj[key]
  }
  return result
}

// Convertir camelCase en snake_case
function camelToSnake(obj) {
  if (!obj) return obj

  const result = {}
  for (const key in obj) {
    // Ignorer les clés qui ne sont pas des propriétés de la DB
    if (['createdAt', 'updatedAt'].includes(key)) continue

    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    result[snakeKey] = obj[key]
  }
  return result
}
