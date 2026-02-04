import { supabaseServer } from '../../../lib/supabaseServer'

// ADMIN ONLY: Corriger les données mal assignées
// Usage: POST /api/admin/fix-user-data?secret=YOUR_SECRET
// Body: { "fromEmail": "wrong@email.com", "toEmail": "correct@email.com" }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Sécurité: nécessite le secret admin
  const { secret } = req.query
  const adminSecret = process.env.ADMIN_SECRET || 'onestock-admin-fix-2024'

  if (secret !== adminSecret) {
    return res.status(403).json({ error: 'Accès refusé' })
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  const { fromEmail, toEmail } = req.body

  if (!fromEmail || !toEmail) {
    return res.status(400).json({ error: 'fromEmail et toEmail requis' })
  }

  const normalizedFrom = fromEmail.trim().toLowerCase()
  const normalizedTo = toEmail.trim().toLowerCase()

  try {
    const results = {
      sneakers: 0,
      expenses: 0,
      accounts: 0,
    }

    // Réassigner les sneakers
    const { data: sneakers, error: sneakersErr } = await supabaseServer
      .from('sneakers')
      .update({ user_id: normalizedTo })
      .eq('user_id', normalizedFrom)
      .select('id')

    if (!sneakersErr && sneakers) {
      results.sneakers = sneakers.length
    }

    // Réassigner les expenses
    const { data: expenses, error: expensesErr } = await supabaseServer
      .from('expenses')
      .update({ user_id: normalizedTo })
      .eq('user_id', normalizedFrom)
      .select('id')

    if (!expensesErr && expenses) {
      results.expenses = expenses.length
    }

    // Réassigner les accounts
    const { data: accounts, error: accountsErr } = await supabaseServer
      .from('accounts')
      .update({ user_id: normalizedTo })
      .eq('user_id', normalizedFrom)
      .select('id')

    if (!accountsErr && accounts) {
      results.accounts = accounts.length
    }

    return res.status(200).json({
      success: true,
      message: `Données transférées de ${normalizedFrom} vers ${normalizedTo}`,
      results,
    })

  } catch (error) {
    console.error('Fix user data error:', error)
    return res.status(500).json({
      error: 'Erreur lors de la correction',
      message: error.message
    })
  }
}