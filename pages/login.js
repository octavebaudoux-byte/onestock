import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react'
import { signIn, signUp, getSession, isSupabaseConfigured } from '../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Vérifier si déjà connecté
  useEffect(() => {
    async function checkAuth() {
      if (!isSupabaseConfigured()) {
        // Si Supabase n'est pas configuré, rediriger vers le dashboard
        router.push('/')
        return
      }

      const { session } = await getSession()
      if (session) {
        router.push('/')
      } else {
        setCheckingAuth(false)
      }
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (isLogin) {
        // Connexion
        const { data, error } = await signIn(email, password)
        if (error) throw error
        router.push('/')
      } else {
        // Inscription
        const { data, error } = await signUp(email, password)
        if (error) throw error
        setSuccess('Compte créé ! Vérifie ton email pour confirmer.')
        setIsLogin(true)
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
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
        <title>{isLogin ? 'Connexion' : 'Inscription'} - OneStock</title>
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
              {isLogin ? 'Connexion' : 'Créer un compte'}
            </h2>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ton@email.com"
                    required
                    className="w-full pl-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-10"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isLogin ? 'Connexion...' : 'Création...'}
                  </>
                ) : (
                  isLogin ? 'Se connecter' : 'Créer mon compte'
                )}
              </button>
            </form>

            {/* Toggle */}
            <div className="mt-6 text-center text-sm text-gray-400">
              {isLogin ? (
                <>
                  Pas encore de compte ?{' '}
                  <button
                    onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Créer un compte
                  </button>
                </>
              ) : (
                <>
                  Déjà un compte ?{' '}
                  <button
                    onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Se connecter
                  </button>
                </>
              )}
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
