export default function handler(req, res) {
  // Clear cookies
  res.setHeader('Set-Cookie', [
    'whop_token=; Path=/; HttpOnly; Max-Age=0',
    'whop_user=; Path=/; Max-Age=0',
  ])

  res.redirect('/login')
}
