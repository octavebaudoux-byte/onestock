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
    // Parse cookies
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
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
    // Redirect logic
    if (!loading) {
      const isPublicRoute = publicRoutes.includes(router.pathname)

      if (!user && !isPublicRoute) {
        router.push('/login')
      } else if (user && router.pathname === '/login') {
        router.push('/')
      }
    }
  }, [user, loading, router.pathname])

  const logout = () => {
    window.location.href = '/api/auth/logout'
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
