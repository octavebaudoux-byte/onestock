import { supabaseServer } from '../../../lib/supabaseServer'

// Endpoint pour migrer les données de l'ancien user_id vers le nouveau (email)
// Usage: POST /api/data/migrate-user-id?secret=onestock-debug-2024
// Body: { "email": "ton@email.com" }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Sécurité: nécessite le secret pour accéder à cet endpoint
  const { secret } = req.query
  const debugSecret = process.env.DEBUG_SECRET || 'onestock-debug-2024'

  if (secret !== debugSecret) {
    return res.status(403).json({ error: 'Accès refusé' })
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email requis dans le body' })
  }

  const normalizedEmail = email.trim().toLowerCase()

  try {
    const results = {
      sneakers: { found: 0, migrated: 0 },
      expenses: { found: 0, migrated: 0 },
      accounts: { found: 0, migrated: 0 },
    }

    // 1. Trouver et migrer les sneakers avec user_id contenant 'owner_' ou 'mem_'
    // qui ont probablement l'email dans leurs données
    const { data: allSneakers, error: sneakersError } = await supabaseServer
      .from('sneakers')
      .select('*')
      .or(`user_id.ilike.%owner_%,user_id.ilike.%mem_%`)

    if (sneakersError) {
      console.error('Error fetching sneakers:', sneakersError)
    } else if (allSneakers) {
      results.sneakers.found = allSneakers.length

      // Migrer vers le nouvel email
      for (const sneaker of allSneakers) {
        const { error: updateError } = await supabaseServer
          .from('sneakers')
          .update({ user_id: normalizedEmail })
          .eq('id', sneaker.id)

        if (!updateError) {
          results.sneakers.migrated++
        }
      }
    }

    // 2. Migrer les expenses
    const { data: allExpenses, error: expensesError } = await supabaseServer
      .from('expenses')
      .select('*')
      .or(`user_id.ilike.%owner_%,user_id.ilike.%mem_%`)

    if (expensesError) {
      console.error('Error fetching expenses:', expensesError)
    } else if (allExpenses) {
      results.expenses.found = allExpenses.length

      for (const expense of allExpenses) {
        const { error: updateError } = await supabaseServer
          .from('expenses')
          .update({ user_id: normalizedEmail })
          .eq('id', expense.id)

        if (!updateError) {
          results.expenses.migrated++
        }
      }
    }

    // 3. Migrer les accounts
    const { data: allAccounts, error: accountsError } = await supabaseServer
      .from('accounts')
      .select('*')
      .or(`user_id.ilike.%owner_%,user_id.ilike.%mem_%`)

    if (accountsError) {
      console.error('Error fetching accounts:', accountsError)
    } else if (allAccounts) {
      results.accounts.found = allAccounts.length

      for (const account of allAccounts) {
        const { error: updateError } = await supabaseServer
          .from('accounts')
          .update({ user_id: normalizedEmail })
          .eq('id', account.id)

        if (!updateError) {
          results.accounts.migrated++
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Migration terminée',
      targetEmail: normalizedEmail,
      results,
    })

  } catch (error) {
    console.error('Migration error:', error)
    return res.status(500).json({
      error: 'Migration failed',
      message: error.message
    })
  }
}