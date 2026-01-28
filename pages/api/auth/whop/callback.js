export default async function handler(req, res) {
  const { code } = req.query

  console.log('Whop callback received, code:', code ? 'present' : 'missing')

  if (!code) {
    return res.redirect('/login?error=no_code')
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/whop/callback`

    console.log('Exchanging code for token...')
    console.log('Client ID:', process.env.NEXT_PUBLIC_WHOP_CLIENT_ID)
    console.log('Redirect URI:', redirectUri)

    // Exchange code for access token - using Basic Auth
    const credentials = Buffer.from(`${process.env.NEXT_PUBLIC_WHOP_CLIENT_ID}:${process.env.WHOP_CLIENT_SECRET}`).toString('base64')

    const tokenResponse = await fetch('https://api.whop.com/api/v2/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }).toString(),
    })

    const responseText = await tokenResponse.text()
    console.log('Token response status:', tokenResponse.status)
    console.log('Token response:', responseText)

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', responseText)
      return res.redirect('/login?error=token_failed')
    }

    let tokenData
    try {
      tokenData = JSON.parse(responseText)
    } catch (e) {
      console.error('Failed to parse token response')
      return res.redirect('/login?error=token_failed')
    }

    const accessToken = tokenData.access_token

    if (!accessToken) {
      console.error('No access token in response')
      return res.redirect('/login?error=token_failed')
    }

    console.log('Got access token, fetching user info...')

    // Get user info
    const userResponse = await fetch('https://api.whop.com/api/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    const userData = await userResponse.json()
    console.log('User data:', JSON.stringify(userData))

    // For now, allow any authenticated Whop user (you can add membership check later)
    const user = {
      id: userData.id,
      email: userData.email,
      username: userData.username,
    }

    // Set cookie with token (expires in 30 days)
    const maxAge = 30 * 24 * 60 * 60 // 30 days
    res.setHeader('Set-Cookie', [
      `whop_token=${accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`,
      `whop_user=${encodeURIComponent(JSON.stringify(user))}; Path=/; SameSite=Lax; Max-Age=${maxAge}`,
    ])

    console.log('Login successful, redirecting to home')
    return res.redirect('/')
  } catch (error) {
    console.error('Whop callback error:', error)
    return res.redirect('/login?error=callback_failed')
  }
}
