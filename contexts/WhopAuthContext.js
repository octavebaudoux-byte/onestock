import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'

const WhopAuthContext = createContext({})

// Public routes that don't require authentication
const publicRoutes = ['/login']

export function WhopAuthProvider({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    // Parse cookies - handle values that contain '='
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const trimmed = cookie.trim()
      const eqIndex = trimmed.indexOf('=')
      if (eqIndex > 0) {
        const key = trimmed.substring(0, eqIndex)
        const value = trimmed.substring(eqIndex + 1)
        acc[key] = value
      }
      return acc
    }, {})

    if (cookies.whop_user) {
      try {
        const userData = JSON.parse(decodeURIComponent(cookies.whop_user))
        setUser(userData)
      } catch (e) {
        console.error('Failed to parse whop_user cookie')
        setUser(null)
      }
    } else {
      setUser(null)
    }

    setLoading(false)
  }

  useEffect(() => {
    // Redirect logic - only run once when loading is done
    if (!loading && router.isReady) {
      const isPublicRoute = publicRoutes.includes(router.pathname)

      if (!user && !isPublicRoute) {
        router.replace('/login')
      } else if (user && router.pathname === '/login') {
        router.replace('/')
      }
    }
  }, [user, loading, router.isReady])

  const logout = () => {
    window.location.href = '/api/auth/logout'
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <WhopAuthContext.Provider value={{ user, loading, logout, isAuthenticated: !!user }}>
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </WhopAuthContext.Provider>
    )
  }

  return (
    <WhopAuthContext.Provider value={{ user, loading, logout, isAuthenticated: !!user }}>
      {children}
    </WhopAuthContext.Provider>
  )
}

export function useWhopAuth() {
  return useContext(WhopAuthContext)
}
