import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase, getSession, onAuthStateChange, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Si Supabase n'est pas configuré, mode sans auth
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    // Vérifier la session au chargement
    async function initAuth() {
      const { session } = await getSession()
      setUser(session?.user || null)
      setLoading(false)
    }
    initAuth()

    // Écouter les changements d'auth
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setUser(session?.user || null)

      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [router])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAuthEnabled: isSupabaseConfigured(),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

// HOC pour protéger les pages
export function withAuth(Component) {
  return function ProtectedPage(props) {
    const { user, loading, isAuthEnabled } = useAuth()
    const router = useRouter()

    useEffect(() => {
      // Si auth activée et pas connecté, rediriger vers login
      if (!loading && isAuthEnabled && !user) {
        router.push('/login')
      }
    }, [user, loading, isAuthEnabled, router])

    // Si auth pas activée, afficher la page directement
    if (!isAuthEnabled) {
      return <Component {...props} />
    }

    // Chargement
    if (loading) {
      return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">👟</div>
            <div className="text-gray-400">Chargement...</div>
          </div>
        </div>
      )
    }

    // Pas connecté
    if (!user) {
      return null
    }

    return <Component {...props} />
  }
}
