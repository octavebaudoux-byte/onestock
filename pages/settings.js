import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Settings, Sun, Moon, Globe, LogOut } from 'lucide-react'
import Layout from '../components/Layout'
import { loadData } from '../lib/store'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useWhopAuth } from '../contexts/WhopAuthContext'

export default function SettingsPage() {
  const [data, setData] = useState({ sneakers: [], sales: [], settings: {} })
  const [isLoaded, setIsLoaded] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { language, changeLanguage, t } = useLanguage()
  const { logout } = useWhopAuth()

  useEffect(() => {
    const loaded = loadData()
    setData(loaded)
    setIsLoaded(true)
  }, [])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{t('settings.title')} - OneStock</title>
      </Head>

      <Layout>
        <div className="p-8 max-w-3xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Settings className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
              <p className="text-gray-400">Configuration de OneStock</p>
            </div>
          </div>

          {/* Language */}
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6">{t('settings.language')}</h2>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-blue-400" />
                <div>
                  <div className="font-medium">
                    {language === 'fr' ? 'Français' : 'English'}
                  </div>
                  <div className="text-sm text-gray-400">
                    {language === 'fr' ? 'Interface en français' : 'Interface in English'}
                  </div>
                </div>
              </div>

              {/* Language selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => changeLanguage('fr')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    language === 'fr'
                      ? 'bg-blue-600 text-white'
                      : 'bg-dark-700 text-gray-400 hover:text-white'
                  }`}
                >
                  🇫🇷 FR
                </button>
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    language === 'en'
                      ? 'bg-blue-600 text-white'
                      : 'bg-dark-700 text-gray-400 hover:text-white'
                  }`}
                >
                  🇬🇧 EN
                </button>
              </div>
            </div>
          </div>

          {/* Apparence */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-6">{t('settings.theme')}</h2>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-6 h-6 text-blue-400" />
                ) : (
                  <Sun className="w-6 h-6 text-amber-400" />
                )}
                <div>
                  <div className="font-medium">
                    {theme === 'dark' ? 'Mode sombre' : 'Mode clair'}
                  </div>
                  <div className="text-sm text-gray-400">
                    {theme === 'dark' ? 'Interface avec fond sombre' : 'Interface avec fond clair'}
                  </div>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                onClick={toggleTheme}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-blue-600' : 'bg-amber-400'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  theme === 'dark' ? 'left-1' : 'translate-x-7'
                }`}>
                  {theme === 'dark' ? (
                    <Moon className="w-3 h-3 text-blue-600 m-1" />
                  ) : (
                    <Sun className="w-3 h-3 text-amber-500 m-1" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="card p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">{t('nav.stats')}</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-dark-700 rounded-xl p-4">
                <div className="text-3xl font-bold text-blue-400">{data.sneakers.length}</div>
                <div className="text-sm text-gray-400">{language === 'fr' ? 'Paires totales' : 'Total pairs'}</div>
              </div>
              <div className="bg-dark-700 rounded-xl p-4">
                <div className="text-3xl font-bold text-emerald-400">
                  {data.sneakers.filter(s => s.status === 'stock').length}
                </div>
                <div className="text-sm text-gray-400">{language === 'fr' ? 'En stock' : 'In stock'}</div>
              </div>
              <div className="bg-dark-700 rounded-xl p-4">
                <div className="text-3xl font-bold text-cyan-400">
                  {data.sneakers.filter(s => s.status === 'sold').length}
                </div>
                <div className="text-sm text-gray-400">{language === 'fr' ? 'Vendues' : 'Sold'}</div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="card p-6 mt-6">
            <h3 className="text-lg font-semibold mb-2">{language === 'fr' ? 'À propos' : 'About'}</h3>
            <p className="text-gray-400 text-sm">
              <span className="font-semibold">OneStock</span> - {language === 'fr' ? 'Gestion de stock sneakers' : 'Sneaker inventory management'}
            </p>
          </div>

          {/* Déconnexion */}
          <div className="card p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">{language === 'fr' ? 'Compte' : 'Account'}</h3>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {language === 'fr' ? 'Se déconnecter' : 'Logout'}
            </button>
          </div>
        </div>
      </Layout>
    </>
  )
}
