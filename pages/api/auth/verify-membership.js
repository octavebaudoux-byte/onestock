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
    const user = {
      id: normalizedEmail, // Utiliser l'email comme ID stable
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

    // Find valid membership
    let validMembership = null

    if (productId) {
      validMembership = memberships.find(m =>
        m.valid === true && m.product_id === productId
      )

      if (!validMembership) {
        validMembership = memberships.find(m =>
          m.valid === true && m.product_id?.toLowerCase() === productId.toLowerCase()
        )
      }
    }

    if (!validMembership) {
      validMembership = memberships.find(m => m.valid === true)
    }

    if (!validMembership) {
      validMembership = memberships.find(m =>
        m.status === 'active' || m.status === 'trialing' || m.status === 'completed'
      )
    }

    if (validMembership) {
      console.log(`[Whop Auth] SUCCESS - Valid membership found:`, validMembership.id)

      const user = {
        id: normalizedEmail, // Utiliser l'email comme ID stable
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

      let errorMsg = 'Aucun abonnement actif trouvé pour cet email'

      if (memberships.length > 0) {
        const statuses = memberships.map(m => m.status).join(', ')
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