import { createContext, useContext, useState, useEffect } from 'react'
import { getTranslation } from '../lib/translations'

const LanguageContext = createContext({})

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('fr')

  useEffect(() => {
    // Load language from localStorage
    const saved = localStorage.getItem('language')
    if (saved && (saved === 'fr' || saved === 'en')) {
      setLanguage(saved)
    }
  }, [])

  const changeLanguage = (lang) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key) => getTranslation(language, key)

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
