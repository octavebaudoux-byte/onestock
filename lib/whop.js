// Whop API integration
const WHOP_API_URL = 'https://api.whop.com/api/v2'

export async function verifyWhopMembership(accessToken) {
  try {
    const response = await fetch(`${WHOP_API_URL}/me/memberships`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      return { valid: false, error: 'Invalid token' }
    }

    const data = await response.json()

    // Check if user has an active membership for your product
    const activeMembership = data.data?.find(m =>
      m.status === 'active' &&
      m.product_id === process.env.WHOP_PRODUCT_ID
    )

    if (activeMembership) {
      return {
        valid: true,
        membership: activeMembership,
        user: {
          id: activeMembership.user_id,
          email: activeMembership.email,
        }
      }
    }

    return { valid: false, error: 'No active membership' }
  } catch (error) {
    console.error('Whop verification error:', error)
    return { valid: false, error: error.message }
  }
}

export async function getWhopUser(accessToken) {
  try {
    const response = await fetch(`${WHOP_API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Whop user error:', error)
    return null
  }
}

// Generate Whop OAuth URL
export function getWhopAuthUrl() {
  const clientId = process.env.NEXT_PUBLIC_WHOP_CLIENT_ID
  const redirectUri = process.env.NEXT_PUBLIC_WHOP_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/whop/callback`

  return `https://whop.com/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`
}
