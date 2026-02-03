// Debug endpoint to check Whop memberships - ONLY FOR ADMIN USE
// Access: /api/auth/debug-membership?email=test@example.com&secret=YOUR_SECRET

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, secret } = req.query

  // Security: require a secret to access this endpoint
  const debugSecret = process.env.DEBUG_SECRET || 'onestock-debug-2024'
  if (secret !== debugSecret) {
    return res.status(403).json({ error: 'Accès refusé' })
  }

  if (!email) {
    return res.status(400).json({ error: 'Email requis (?email=xxx)' })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const apiKey = process.env.WHOP_API_KEY
  const productId = process.env.WHOP_PRODUCT_ID?.trim()

  if (!apiKey) {
    return res.status(500).json({ error: 'WHOP_API_KEY not configured' })
  }

  try {
    // Get all memberships for this email
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
      return res.status(response.status).json({
        error: 'Whop API error',
        status: response.status,
        details: data
      })
    }

    const memberships = data.data || []

    // Format memberships for readability
    const formattedMemberships = memberships.map(m => ({
      id: m.id,
      email: m.email,
      product_id: m.product_id,
      plan_id: m.plan_id,
      status: m.status,
      valid: m.valid,
      created_at: m.created_at,
      expires_at: m.expires_at,
      license_key: m.license_key,
      // Check if this would match
      would_match: productId
        ? m.product_id === productId && m.valid === true
        : m.valid === true,
      would_match_by_status: ['active', 'trialing', 'completed'].includes(m.status)
    }))

    return res.status(200).json({
      email: normalizedEmail,
      configured_product_id: productId || 'NOT SET',
      total_memberships: memberships.length,
      memberships: formattedMemberships,
      // Summary
      has_valid: memberships.some(m => m.valid === true),
      has_matching_product: productId ? memberships.some(m => m.product_id === productId) : 'N/A (no product ID set)',
      would_be_allowed: formattedMemberships.some(m => m.would_match || m.would_match_by_status)
    })

  } catch (error) {
    return res.status(500).json({
      error: 'Request failed',
      message: error.message
    })
  }
}
