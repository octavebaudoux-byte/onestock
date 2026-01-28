export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email requis' })
  }

  // Owner emails that bypass Whop verification
  const allowedEmails = (process.env.ALLOWED_EMAILS || '').split(',').map(e => e.trim().toLowerCase())

  // Check if email is in allowed list (owner bypass)
  if (allowedEmails.includes(email.toLowerCase())) {
    const user = {
      id: 'owner_' + Date.now(),
      email: email,
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
    const productId = process.env.WHOP_PRODUCT_ID

    // Search for memberships with this email
    const response = await fetch(
      `https://api.whop.com/api/v2/memberships?email=${encodeURIComponent(email)}&valid=true`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Whop API error:', data)
      return res.status(401).json({
        success: false,
        error: 'Aucun abonnement actif trouvé pour cet email'
      })
    }

    // Check if user has an active membership for this product
    const memberships = data.data || []
    const validMembership = memberships.find(m =>
      m.valid === true &&
      (productId ? m.product_id === productId : true)
    )

    if (validMembership) {
      const user = {
        id: validMembership.id,
        email: email,
        membership_id: validMembership.id,
      }

      const maxAge = 30 * 24 * 60 * 60 // 30 days
      res.setHeader('Set-Cookie', [
        `whop_user=${encodeURIComponent(JSON.stringify(user))}; Path=/; SameSite=Lax; Max-Age=${maxAge}`,
      ])

      return res.status(200).json({ success: true, user })
    } else {
      return res.status(401).json({
        success: false,
        error: 'Aucun abonnement actif trouvé pour cet email'
      })
    }
  } catch (error) {
    console.error('Verification error:', error)
    return res.status(401).json({
      success: false,
      error: 'Aucun abonnement actif trouvé pour cet email'
    })
  }
}
