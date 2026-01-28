import { verifyWhopMembership } from '../../../../lib/whop'

export default async function handler(req, res) {
  const { code } = req.query

  if (!code) {
    return res.redirect('/login?error=no_code')
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://api.whop.com/api/v2/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.NEXT_PUBLIC_WHOP_CLIENT_ID,
        client_secret: process.env.WHOP_CLIENT_SECRET,
        redirect_uri: process.env.NEXT_PUBLIC_WHOP_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/whop/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Token exchange failed:', error)
      return res.redirect('/login?error=token_failed')
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Verify membership
    const membership = await verifyWhopMembership(accessToken)

    if (!membership.valid) {
      return res.redirect('/login?error=no_membership')
    }

    // Set cookie with token (expires in 30 days)
    const maxAge = 30 * 24 * 60 * 60 // 30 days
    res.setHeader('Set-Cookie', [
      `whop_token=${accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`,
      `whop_user=${encodeURIComponent(JSON.stringify(membership.user))}; Path=/; SameSite=Lax; Max-Age=${maxAge}`,
    ])

    return res.redirect('/')
  } catch (error) {
    console.error('Whop callback error:', error)
    return res.redirect('/login?error=callback_failed')
  }
}
