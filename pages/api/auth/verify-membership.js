import { supabaseServer } from '../../../lib/supabaseServer'

// Fonction pour migrer les anciennes données vers le nouvel email
async function migrateUserData(email) {
  if (!supabaseServer) return { migrated: false }

  const normalizedEmail = email.trim().toLowerCase()

  try {
    let totalMigrated = 0

    // Migrer les sneakers avec ancien user_id (owner_xxx ou mem_xxx)
    const { data: oldSneakers } = await supabaseServer
      .from('sneakers')
      .select('id')
      .or(`user_id.ilike.%owner_%,user_id.ilike.%mem_%`)

    if (oldSneakers && oldSneakers.length > 0) {
      const { error } = await supabaseServer
        .from('sneakers')
        .update({ user_id: normalizedEmail })
        .or(`user_id.ilike.%owner_%,user_id.ilike.%mem_%`)

      if (!error) totalMigrated += oldSneakers.length
    }

    // Migrer les expenses
    const { data: oldExpenses } = await supabaseServer
      .from('expenses')
      .select('id')
      .or(`user_id.ilike.%owner_%,user_id.ilike.%mem_%`)

    if (oldExpenses && oldExpenses.length > 0) {
      const { error } = await supabaseServer
        .from('expenses')
        .update({ user_id: normalizedEmail })
        .or(`user_id.ilike.%owner_%,user_id.ilike.%mem_%`)

      if (!error) totalMigrated += oldExpenses.length
    }

    // Migrer les accounts
    const { data: oldAccounts } = await supabaseServer
      .from('accounts')
      .select('id')
      .or(`user_id.ilike.%owner_%,user_id.ilike.%mem_%`)

    if (oldAccounts && oldAccounts.length > 0) {
      const { error } = await supabaseServer
        .from('accounts')
        .update({ user_id: normalizedEmail })
        .or(`user_id.ilike.%owner_%,user_id.ilike.%mem_%`)

      if (!error) totalMigrated += oldAccounts.length
    }

    if (totalMigrated > 0) {
      console.log(`[Migration] Migré ${totalMigrated} éléments vers ${normalizedEmail}`)
    }

    return { migrated: true, count: totalMigrated }
  } catch (error) {
    console.error('[Migration] Erreur:', error)
    return { migrated: false, error: error.message }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email requis' })
  }

  const normalizedEmail = email.trim().toLowerCase()

  // Owner emails that bypass Whop verification
  const allowedEmails = (process.env.ALLOWED_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

  // Check if email is in allowed list (owner bypass)
  if (allowedEmails.includes(normalizedEmail)) {
    // Migrer les anciennes données vers cet email
    await migrateUserData(normalizedEmail)

    const user = {
      id: normalizedEmail, // IMPORTANT: Utiliser l'email comme ID stable
      email: normalizedEmail,
      isOwner: true,
    }

    const maxAge = 30 * 24 * 60 * 60 // 30 days
    res.setHeader('Set-Cookie', [
      `whop_user=${encodeURIComponent(JSON.stringify(user))}; Path=/; SameSite=Lax; Max-Age=${maxAge}`,
    ])

    return res.status(200).json({ success: true, user })
  }

  try {
    // Check membership using Whop API
    const apiKey = process.env.WHOP_API_KEY
    const productId = process.env.WHOP_PRODUCT_ID?.trim()

    if (!apiKey) {
      console.error('[Whop Auth] WHOP_API_KEY not configured')
      return res.status(500).json({
        success: false,
        error: 'Configuration serveur incomplète'
      })
    }

    console.log(`[Whop Auth] Checking membership for: ${normalizedEmail}`)
    console.log(`[Whop Auth] Product ID: ${productId || 'NOT SET'}`)

    // Search for memberships with this email
    const response = await fetch(
      `https://api.whop.com/api/v2/memberships?email=${encodeURIComponent(normalizedEmail)}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('[Whop Auth] API error:', response.status, data)
      return res.status(401).json({
        success: false,
        error: 'Erreur de vérification Whop. Contacte le support.'
      })
    }

    const memberships = data.data || []
    console.log(`[Whop Auth] Found ${memberships.length} memberships for ${normalizedEmail}`)

    // Log all memberships for debugging
    memberships.forEach((m, i) => {
      console.log(`[Whop Auth] Membership ${i + 1}:`, {
        id: m.id,
        product_id: m.product_id,
        plan_id: m.plan_id,
        status: m.status,
        valid: m.valid,
        email: m.email,
        created_at: m.created_at
      })
    })

    // Find valid membership
    // First try to match by product ID if configured
    let validMembership = null

    if (productId) {
      // Try exact match
      validMembership = memberships.find(m =>
        m.valid === true && m.product_id === productId
      )

      // If not found, try case-insensitive match
      if (!validMembership) {
        validMembership = memberships.find(m =>
          m.valid === true && m.product_id?.toLowerCase() === productId.toLowerCase()
        )
      }
    }

    // If still not found and no product ID or no match, accept any valid membership
    if (!validMembership) {
      validMembership = memberships.find(m => m.valid === true)

      if (validMembership && productId) {
        console.log(`[Whop Auth] WARNING: Found valid membership but product_id mismatch!`)
        console.log(`[Whop Auth] Expected: ${productId}, Got: ${validMembership.product_id}`)
        // Still accept it but log the warning
      }
    }

    // Also check by status if valid flag is not set
    if (!validMembership) {
      validMembership = memberships.find(m =>
        m.status === 'active' || m.status === 'trialing' || m.status === 'completed'
      )

      if (validMembership) {
        console.log(`[Whop Auth] Found membership by status: ${validMembership.status}`)
      }
    }

    if (validMembership) {
      console.log(`[Whop Auth] SUCCESS - Valid membership found:`, validMembership.id)

      // Migrer les anciennes données vers cet email
      await migrateUserData(normalizedEmail)

      const user = {
        id: normalizedEmail, // IMPORTANT: Utiliser l'email comme ID stable
        email: normalizedEmail,
        membership_id: validMembership.id,
        product_id: validMembership.product_id,
      }

      const maxAge = 30 * 24 * 60 * 60 // 30 days
      res.setHeader('Set-Cookie', [
        `whop_user=${encodeURIComponent(JSON.stringify(user))}; Path=/; SameSite=Lax; Max-Age=${maxAge}`,
      ])

      return res.status(200).json({ success: true, user })
    } else {
      console.log(`[Whop Auth] FAILED - No valid membership found for ${normalizedEmail}`)

      // More helpful error message
      let errorMsg = 'Aucun abonnement actif trouvé pour cet email'

      if (memberships.length > 0) {
        const statuses = memberships.map(m => m.status).join(', ')
        console.log(`[Whop Auth] Found memberships with statuses: ${statuses}`)
        errorMsg = `Abonnement trouvé mais non actif (${statuses}). Vérifie ton paiement sur Whop.`
      }

      return res.status(401).json({
        success: false,
        error: errorMsg
      })
    }
  } catch (error) {
    console.error('[Whop Auth] Verification error:', error)
    return res.status(500).json({
      success: false,
      error: 'Erreur de connexion au serveur. Réessaie dans quelques instants.'
    })
  }
}
