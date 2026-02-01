// ===== SNEAKERS CRUD VIA API ROUTES =====

// Charger toutes les sneakers de l'utilisateur
export async function loadSneakers(userId) {
  if (!userId) return []

  try {
    const res = await fetch('/api/data/sneakers')
    if (!res.ok) throw new Error('Failed to load sneakers')
    const data = await res.json()
    return (data || []).map(snakeToCamel)
  } catch (error) {
    console.error('Error loading sneakers:', error)
    return []
  }
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
    if (col in result && (result[col] === '' || result[col] === undefined)) {
      result[col] = null
    }
  }
  return result
}

// Ajouter une sneaker
export async function addSneaker(userId, sneaker) {
  if (!userId) return null

  try {
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

    const res = await fetch('/api/data/sneakers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanRow)
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to add sneaker')
    }

    const data = await res.json()
    return snakeToCamel(data)
  } catch (error) {
    console.error('Error adding sneaker:', error)
    return null
  }
}

// Mettre à jour une sneaker
export async function updateSneaker(userId, sneakerId, updates) {
  if (!userId) return null

  try {
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

    const res = await fetch('/api/data/sneakers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: sneakerId, ...cleanRow })
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to update sneaker')
    }

    const data = await res.json()
    return snakeToCamel(data)
  } catch (error) {
    console.error('Error updating sneaker:', error)
    return null
  }
}

// Supprimer une sneaker
export async function deleteSneaker(userId, sneakerId) {
  if (!userId) return false

  try {
    const res = await fetch('/api/data/sneakers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: sneakerId })
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to delete sneaker')
    }

    return true
  } catch (error) {
    console.error('Error deleting sneaker:', error)
    return false
  }
}

// ===== EXPENSES CRUD VIA API ROUTES =====

// Colonnes valides pour la table expenses
const EXPENSE_COLUMNS = ['user_id', 'name', 'amount', 'date', 'category', 'notes']

// Charger toutes les dépenses de l'utilisateur
export async function loadExpenses(userId) {
  if (!userId) return []

  try {
    const res = await fetch('/api/data/expenses')
    if (!res.ok) throw new Error('Failed to load expenses')
    const data = await res.json()
    return (data || []).map(snakeToCamel)
  } catch (error) {
    console.error('Error loading expenses:', error)
    return []
  }
}

// Ajouter une dépense
export async function addExpense(userId, expense) {
  if (!userId) return null

  try {
    const allFields = camelToSnake({
      ...expense,
      userId: userId,
    })

    const row = {}
    for (const col of EXPENSE_COLUMNS) {
      if (allFields[col] !== undefined) {
        row[col] = allFields[col]
      }
    }

    const cleanRow = sanitizeForSupabase(row)

    const res = await fetch('/api/data/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanRow)
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to add expense')
    }

    const data = await res.json()
    return snakeToCamel(data)
  } catch (error) {
    console.error('Error adding expense:', error)
    return null
  }
}

// Mettre à jour une dépense
export async function updateExpense(userId, expenseId, updates) {
  if (!userId) return null

  try {
    const allFields = camelToSnake(updates)

    const row = {}
    for (const col of EXPENSE_COLUMNS) {
      if (col !== 'user_id' && allFields[col] !== undefined) {
        row[col] = allFields[col]
      }
    }

    const cleanRow = sanitizeForSupabase(row)

    const res = await fetch('/api/data/expenses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: expenseId, ...cleanRow })
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to update expense')
    }

    const data = await res.json()
    return snakeToCamel(data)
  } catch (error) {
    console.error('Error updating expense:', error)
    return null
  }
}

// Supprimer une dépense
export async function deleteExpense(userId, expenseId) {
  if (!userId) return false

  try {
    const res = await fetch('/api/data/expenses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: expenseId })
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to delete expense')
    }

    return true
  } catch (error) {
    console.error('Error deleting expense:', error)
    return false
  }
}

// ===== STATS =====

export async function loadStats(userId) {
  if (!userId) return null

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
    let value = obj[key]

    // Parser les colonnes JSONB qui sont retournées comme string
    if (key === 'listed_on_platforms' && typeof value === 'string') {
      try {
        value = JSON.parse(value)
      } catch (e) {
        value = []
      }
    }

    // S'assurer que listed_on_platforms est toujours un tableau
    if (key === 'listed_on_platforms' && !Array.isArray(value)) {
      value = value ? [value] : []
    }

    result[camelKey] = value
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
    let value = obj[key]

    // S'assurer que listed_on_platforms est un tableau valide
    if (snakeKey === 'listed_on_platforms') {
      if (!Array.isArray(value)) {
        value = value ? [value] : []
      }
    }

    result[snakeKey] = value
  }
  return result
}
