import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export function useWhopAuth() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
    }

    setLoading(false)
  }, [])

  const logout = () => {
    window.location.href = '/api/auth/logout'
  }

  const requireAuth = () => {
    if (!loading && !user) {
      router.push('/login')
      return false
    }
    return true
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
    requireAuth,
  }
}
