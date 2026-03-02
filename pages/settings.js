import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Settings, Sun, Moon, Globe, LogOut, Users, Eye, EyeOff } from 'lucide-react'
import Layout from '../components/Layout'
import { loadData } from '../lib/store'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useWhopAuth } from '../contexts/WhopAuthContext'
import { getCommunityPrefs, updateCommunityPrefs } from '../lib/supabase'

export default function SettingsPage() {
  const [data, setData] = useState({ sneakers: [], sales: [], settings: {} })
  const [isLoaded, setIsLoaded] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { language, changeLanguage, t } = useLanguage()
  const { logout, user: whopUser } = useWhopAuth()
  const userId = whopUser?.email || null

  // Préférences communauté
  const [communityPrefs, setCommunityPrefs] = useState({
    share_sales: true,
    show_name: true,
    display_name: '',
  })
  const [savingCommunity, setSavingCommunity] = useState(false)
  const [communitySaved, setCommunitySaved] = useState(false)

  useEffect(() => {
    const loaded = loadData()
    setData(loaded)
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!userId) return
    getCommunityPrefs(userId).then(prefs => {
      const whopUsername = whopUser?.username || ''
      if (prefs) {
        setCommunityPrefs({
          share_sales: prefs.share_sales ?? true,
          show_name: prefs.show_name ?? true,
          display_name: prefs.display_name || whopUsername,
        })
      } else {
        // Première connexion : défauts avec username Whop
        const defaults = { share_sales: true, show_name: true, display_name: whopUsername }
        setCommunityPrefs(defaults)
        updateCommunityPrefs(userId, defaults)
      }
    })
  }, [userId, whopUser])

  const handleCommunityToggle = async (field) => {
    const newVal = !communityPrefs[field]
    const newPrefs = { ...communityPrefs, [field]: newVal }
    setCommunityPrefs(newPrefs)
    if (userId) {
      await updateCommunityPrefs(userId, newPrefs)
    }
  }

  const handleDisplayNameSave = async () => {
    if (!userId) return
    setSavingCommunity(true)
    await updateCommunityPrefs(userId, communityPrefs)
    setSavingCommunity(false)
    setCommunitySaved(true)
    setTimeout(() => setCommunitySaved(false), 2000)
  }

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
        <div className="p-4 md:p-8 max-w-3xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <Settings className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{t('settings.title')}</h1>
              <p className="text-sm text-gray-400">Configuration de OneStock</p>
            </div>
          </div>

          {/* Language */}
          <div className="card p-4 md:p-6 mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">{t('settings.language')}</h2>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                <div>
                  <div className="font-medium text-sm md:text-base">
                    {language === 'fr' ? 'Français' : 'English'}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => changeLanguage('fr')}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-sm transition-all ${
                    language === 'fr'
                      ? 'bg-blue-600 text-white'
                      : 'bg-dark-700 text-gray-400 hover:text-white'
                  }`}
                >
                  FR
                </button>
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-sm transition-all ${
                    language === 'en'
                      ? 'bg-blue-600 text-white'
                      : 'bg-dark-700 text-gray-400 hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>

          {/* Theme */}
          <div className="card p-4 md:p-6 mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">{t('settings.theme')}</h2>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                ) : (
                  <Sun className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                )}
                <div className="font-medium text-sm md:text-base">
                  {theme === 'dark' ? (language === 'fr' ? 'Mode sombre' : 'Dark mode') : (language === 'fr' ? 'Mode clair' : 'Light mode')}
                </div>
              </div>

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
          <div className="card p-4 md:p-6 mb-4 md:mb-6">
            <h3 className="text-lg font-semibold mb-4">{t('nav.stats')}</h3>
            <div className="grid grid-cols-3 gap-3 md:gap-4 text-center">
              <div className="bg-dark-700 rounded-xl p-3 md:p-4">
                <div className="text-2xl md:text-3xl font-bold text-blue-400">{data.sneakers.length}</div>
                <div className="text-xs md:text-sm text-gray-400">{language === 'fr' ? 'Paires' : 'Pairs'}</div>
              </div>
              <div className="bg-dark-700 rounded-xl p-3 md:p-4">
                <div className="text-2xl md:text-3xl font-bold text-emerald-400">
                  {data.sneakers.filter(s => s.status === 'stock').length}
                </div>
                <div className="text-xs md:text-sm text-gray-400">{language === 'fr' ? 'Stock' : 'Stock'}</div>
              </div>
              <div className="bg-dark-700 rounded-xl p-3 md:p-4">
                <div className="text-2xl md:text-3xl font-bold text-cyan-400">
                  {data.sneakers.filter(s => s.status === 'sold').length}
                </div>
                <div className="text-xs md:text-sm text-gray-400">{language === 'fr' ? 'Vendues' : 'Sold'}</div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="card p-4 md:p-6 mb-4 md:mb-6">
            <h3 className="text-lg font-semibold mb-2">{language === 'fr' ? 'À propos' : 'About'}</h3>
            <p className="text-gray-400 text-sm">
              <span className="font-semibold">OneStock</span> - {language === 'fr' ? 'Gestion de stock sneakers' : 'Sneaker inventory management'}
            </p>
          </div>

          {/* Communauté */}
          <div className="card p-4 md:p-6 mb-4 md:mb-6">
            <div className="flex items-center gap-3 mb-5">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold">{language === 'fr' ? 'Communauté' : 'Community'}</h3>
            </div>

            <p className="text-sm text-gray-400 mb-5">
              {language === 'fr'
                ? 'Partage tes ventes avec la communauté OneStock pour aider les autres revendeurs à connaître les prix du marché.'
                : 'Share your sales with the OneStock community to help other resellers know market prices.'}
            </p>

            {/* Toggle : partager mes ventes */}
            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <div>
                <div className="font-medium text-sm">{language === 'fr' ? 'Partager mes ventes' : 'Share my sales'}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {language === 'fr' ? 'Tes prix de vente apparaîtront dans le Price Checker' : 'Your sell prices will appear in Price Checker'}
                </div>
              </div>
              <button
                onClick={() => handleCommunityToggle('share_sales')}
                className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${communityPrefs.share_sales ? 'bg-purple-600' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${communityPrefs.share_sales ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Toggle : masquer mon nom */}
            {communityPrefs.share_sales && (
              <>
                <div className="flex items-center justify-between py-3 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    {!communityPrefs.show_name ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    <div>
                      <div className="font-medium text-sm">{language === 'fr' ? 'Masquer mon nom' : 'Hide my name'}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {!communityPrefs.show_name
                          ? (language === 'fr' ? 'Tu apparaîs comme "Anonyme"' : 'You appear as "Anonymous"')
                          : (language === 'fr' ? 'Ton pseudo sera visible par les autres' : 'Your username will be visible to others')}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCommunityToggle('show_name')}
                    className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${!communityPrefs.show_name ? 'bg-red-600' : 'bg-gray-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${!communityPrefs.show_name ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Nom d'affichage */}
                {communityPrefs.show_name && (
                  <div className="pt-3">
                    <label className="block text-sm text-gray-400 mb-2">{language === 'fr' ? 'Pseudo affiché' : 'Display name'}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={communityPrefs.display_name}
                        onChange={(e) => setCommunityPrefs(prev => ({ ...prev, display_name: e.target.value }))}
                        placeholder={language === 'fr' ? 'Ton pseudo...' : 'Your username...'}
                        maxLength={30}
                        className="flex-1 text-sm"
                      />
                      <button
                        onClick={handleDisplayNameSave}
                        disabled={savingCommunity}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                      >
                        {communitySaved ? '✓' : (language === 'fr' ? 'Sauver' : 'Save')}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Logout */}
          <div className="card p-4 md:p-6">
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