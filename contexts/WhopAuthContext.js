import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'

const WhopAuthContext = createContext({})

// Public routes that don't require authentication
const publicRoutes = ['/login']

function parseCookieUser() {
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
      return JSON.parse(decodeURIComponent(cookies.whop_user))
    } catch {
      return null
    }
  }
  return null
}

export function WhopAuthProvider({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = useCallback(() => {
    const userData = parseCookieUser()
    setUser(userData)
    setLoading(false)
  }, [])

  // Check auth on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Re-check auth when route changes (catches redirect from callback)
  useEffect(() => {
    if (router.isReady) {
      checkAuth()
    }
  }, [router.asPath, router.isReady, checkAuth])

  // If user is still null after mount, retry a few times (cookie sync delay)
  useEffect(() => {
    if (!loading && !user && !publicRoutes.includes(router.pathname)) {
      let retries = 0
      const interval = setInterval(() => {
        const userData = parseCookieUser()
        if (userData) {
          setUser(userData)
          clearInterval(interval)
        } else if (++retries >= 5) {
          clearInterval(interval)
        }
      }, 200)
      return () => clearInterval(interval)
    }
  }, [loading, user, router.pathname])

  useEffect(() => {
    if (!loading && router.isReady) {
      const isPublicRoute = publicRoutes.includes(router.pathname)

      if (!user && !isPublicRoute) {
        // Small delay before redirect to give cookie one last chance
        const timeout = setTimeout(() => {
          const lastCheck = parseCookieUser()
          if (lastCheck) {
            setUser(lastCheck)
          } else {
            router.replace('/login')
          }
        }, 300)
        return () => clearTimeout(timeout)
      } else if (user && router.pathname === '/login') {
        router.replace('/')
      }
    }
  }, [user, loading, router.isReady])

  const logout = () => {
    window.location.href = '/api/auth/logout'
  }

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