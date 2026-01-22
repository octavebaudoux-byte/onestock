import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({})

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark') // 'dark' ou 'light'

  // Charger le thème depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('onestock_theme')
    if (saved) {
      setTheme(saved)
    }
  }, [])

  // Appliquer le thème au body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('onestock_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
