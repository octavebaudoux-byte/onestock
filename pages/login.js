import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Check for errors in URL
  useEffect(() => {
    const { error: urlError } = router.query
    if (urlError) {
      const errorMessages = {
        no_code: 'Code d\'autorisation manquant',
        token_failed: 'Échec de l\'authentification',
        no_membership: 'Tu n\'as pas d\'abonnement actif pour OneStock',
        callback_failed: 'Erreur lors de la connexion',
      }
      setError(errorMessages[urlError] || 'Une erreur est survenue')
    }
  }, [router.query])

  // Check if already logged in
  useEffect(() => {
    // Check for whop_user cookie
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {})

    if (cookies.whop_user) {
      router.push('/')
    } else {
      setCheckingAuth(false)
    }
  }, [router])

  const handleWhopLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_WHOP_CLIENT_ID
    const redirectUri = `${window.location.origin}/api/auth/whop/callback`
    window.location.href = `https://whop.com/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Connexion - OneStock</title>
      </Head>

      <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
              <span className="text-5xl">👟</span>
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                OneStock
              </span>
            </h1>
            <p className="text-gray-400 mt-2">Gestion de stock sneakers</p>
          </div>

          {/* Card */}
          <div className="card p-8">
            <h2 className="text-2xl font-semibold text-center mb-6">
              Accéder à OneStock
            </h2>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Whop Login Button */}
            <button
              onClick={handleWhopLogin}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              Se connecter avec Whop
            </button>

            <p className="text-center text-gray-500 text-sm mt-4">
              Tu dois avoir un abonnement actif sur Whop pour accéder à OneStock
            </p>

            {/* Buy link */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-center text-gray-400 text-sm mb-3">
                Pas encore d'abonnement ?
              </p>
              <a
                href="https://whop.com/onestock"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn btn-secondary py-3 flex items-center justify-center gap-2"
              >
                Acheter OneStock
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-xs mt-6">
            En continuant, tu acceptes les conditions d'utilisation
          </p>
        </div>
      </div>
    </>
  )
}
