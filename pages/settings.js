import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { Settings, Sun, Moon, Globe, LogOut, Mail, Plus, Trash2, Check, AlertCircle, Loader2 } from 'lucide-react'
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

  // Email config state
  const [emailConfig, setEmailConfig] = useState(null)
  const [emailForm, setEmailForm] = useState({ email: '', app_password: '', imap_host: 'imap.gmail.com', imap_port: 993 })
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailSuccess, setEmailSuccess] = useState('')

  // Triggers state
  const [triggers, setTriggers] = useState([])
  const [newPhrase, setNewPhrase] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [triggerSaving, setTriggerSaving] = useState(false)

  useEffect(() => {
    const loaded = loadData()
    setData(loaded)
    setIsLoaded(true)

    // Load email config
    fetch('/api/data/email-config', { credentials: 'same-origin' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setEmailConfig(data)
          setEmailForm(prev => ({ ...prev, email: data.email, imap_host: data.imap_host, imap_port: data.imap_port }))
        }
      })
      .catch(() => {})

    // Load triggers
    fetch('/api/data/email-triggers', { credentials: 'same-origin' })
      .then(r => r.ok ? r.json() : [])
      .then(data => setTriggers(data || []))
      .catch(() => {})
  }, [])

  const saveEmailConfig = useCallback(async () => {
    if (!emailForm.email || !emailForm.app_password) {
      setEmailError(language === 'fr' ? 'Email et mot de passe requis' : 'Email and password required')
      return
    }

    setEmailSaving(true)
    setEmailError('')
    setEmailSuccess('')

    try {
      const res = await fetch('/api/data/email-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailForm),
        credentials: 'same-origin',
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }

      const data = await res.json()
      setEmailConfig(data)
      setEmailSuccess(language === 'fr' ? 'Connexion email sauvegardée !' : 'Email connection saved!')
      setEmailForm(prev => ({ ...prev, app_password: '' }))
    } catch (err) {
      setEmailError(err.message)
    } finally {
      setEmailSaving(false)
    }
  }, [emailForm, language])

  const disconnectEmail = useCallback(async () => {
    try {
      await fetch('/api/data/email-config', {
        method: 'DELETE',
        credentials: 'same-origin',
      })
      setEmailConfig(null)
      setEmailForm({ email: '', app_password: '', imap_host: 'imap.gmail.com', imap_port: 993 })
      setEmailSuccess('')
    } catch {}
  }, [])

  const addTrigger = useCallback(async () => {
    if (!newPhrase.trim()) return

    setTriggerSaving(true)
    try {
      const res = await fetch('/api/data/email-triggers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrase: newPhrase.trim(), label: newLabel.trim() || null }),
        credentials: 'same-origin',
      })

      if (res.ok) {
        const data = await res.json()
        setTriggers(prev => [data, ...prev])
        setNewPhrase('')
        setNewLabel('')
      }
    } catch {}
    setTriggerSaving(false)
  }, [newPhrase, newLabel])

  const removeTrigger = useCallback(async (id) => {
    try {
      await fetch('/api/data/email-triggers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        credentials: 'same-origin',
      })
      setTriggers(prev => prev.filter(t => t.id !== id))
    } catch {}
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

          {/* Email Notifications - Gmail IMAP */}
          <div className="card p-4 md:p-6 mb-4 md:mb-6 overflow-hidden">
            {/* Header with Gmail branding */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-7 md:h-7">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="#EA4335"/>
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="url(#gmail-grad)"/>
                  <defs>
                    <linearGradient id="gmail-grad" x1="0" y1="0" x2="24" y2="24">
                      <stop offset="0%" stopColor="#EA4335"/>
                      <stop offset="30%" stopColor="#FBBC04" stopOpacity="0.3"/>
                      <stop offset="60%" stopColor="#34A853" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#4285F4"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-semibold">
                  {language === 'fr' ? 'Notifications Email' : 'Email Notifications'}
                </h2>
                <p className="text-[10px] md:text-xs text-gray-500">
                  {language === 'fr' ? 'Connexion IMAP - Gmail & autres' : 'IMAP connection - Gmail & others'}
                </p>
              </div>
            </div>

            <p className="text-xs md:text-sm text-gray-400 mb-5 leading-relaxed">
              {language === 'fr'
                ? 'Connecte ta boîte mail pour recevoir des notifications quand un email contient une phrase spécifique (ex: "Your item has sold"). Vérification automatique toutes les 15 minutes.'
                : 'Connect your mailbox to get notifications when an email contains a specific phrase (e.g. "Your item has sold"). Automatic check every 15 minutes.'}
            </p>

            {/* Connection status - connected */}
            {emailConfig ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 mb-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{emailConfig.email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] text-emerald-400/80">
                          {language === 'fr' ? 'Connecté' : 'Connected'}
                        </span>
                        {emailConfig.last_check_at && (
                          <span className="text-[10px] text-gray-500">
                            &middot; {language === 'fr' ? 'Dernier check' : 'Last check'}: {new Date(emailConfig.last_check_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={disconnectEmail}
                    className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 border border-red-500/20 transition-colors shrink-0"
                  >
                    {language === 'fr' ? 'Déconnecter' : 'Disconnect'}
                  </button>
                </div>
              </div>
            ) : (
              /* Connection form */
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-5 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    {language === 'fr' ? 'Adresse email' : 'Email address'}
                  </label>
                  <input
                    type="email"
                    value={emailForm.email}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="ton.email@gmail.com"
                    className="w-full px-3 py-2.5 text-sm rounded-lg bg-dark-700 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-300 mb-1.5">
                    {language === 'fr' ? 'Mot de passe d\'application' : 'App password'}
                    <a
                      href="https://myaccount.google.com/apppasswords"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-[10px] text-blue-400 hover:text-blue-300 underline underline-offset-2"
                    >
                      {language === 'fr' ? 'Générer sur Google' : 'Generate on Google'}
                    </a>
                  </label>
                  <input
                    type="password"
                    value={emailForm.app_password}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, app_password: e.target.value }))}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="w-full px-3 py-2.5 text-sm rounded-lg bg-dark-700 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
                  />
                </div>

                {/* IMAP settings - collapsible feel */}
                <div className="flex gap-2 pt-1">
                  <div className="flex-1">
                    <label className="block text-[10px] text-gray-500 mb-1">IMAP Host</label>
                    <input
                      type="text"
                      value={emailForm.imap_host}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, imap_host: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-dark-700 border border-white/10 focus:border-blue-500/50 transition-all outline-none text-gray-400"
                    />
                  </div>
                  <div className="w-20">
                    <label className="block text-[10px] text-gray-500 mb-1">Port</label>
                    <input
                      type="number"
                      value={emailForm.imap_port}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, imap_port: parseInt(e.target.value) || 993 }))}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-dark-700 border border-white/10 focus:border-blue-500/50 transition-all outline-none text-gray-400"
                    />
                  </div>
                </div>

                {emailError && (
                  <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {emailError}
                  </div>
                )}

                {emailSuccess && (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 px-3 py-2 rounded-lg">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    {emailSuccess}
                  </div>
                )}

                <button
                  onClick={saveEmailConfig}
                  disabled={emailSaving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-blue-500/10"
                >
                  {emailSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> {language === 'fr' ? 'Connexion...' : 'Connecting...'}</>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="w-4 h-4">
                        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="white"/>
                      </svg>
                      {language === 'fr' ? 'Connecter Gmail' : 'Connect Gmail'}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Trigger phrases section */}
            <div className="border-t border-white/5 pt-5 mt-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center">
                  <span className="text-xs">&#9889;</span>
                </div>
                <h3 className="text-sm font-semibold text-white">
                  {language === 'fr' ? 'Phrases déclencheurs' : 'Trigger phrases'}
                </h3>
              </div>
              <p className="text-[10px] md:text-xs text-gray-500 mb-4 leading-relaxed">
                {language === 'fr'
                  ? 'Ajoute des mots-clés ou phrases. Dès qu\'un email les contient, tu recevras une notification.'
                  : 'Add keywords or phrases. When an email contains them, you\'ll get a notification.'}
              </p>

              {/* Add trigger form */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newPhrase}
                    onChange={(e) => setNewPhrase(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTrigger()}
                    placeholder={language === 'fr' ? 'Ex: Your item has sold' : 'E.g. Your item has sold'}
                    className="w-full px-3 py-2.5 text-sm rounded-lg bg-dark-700 border border-white/10 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all outline-none"
                  />
                </div>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTrigger()}
                  placeholder={language === 'fr' ? 'Label' : 'Label'}
                  className="w-24 md:w-32 px-3 py-2.5 text-sm rounded-lg bg-dark-700 border border-white/10 focus:border-amber-500/50 transition-all outline-none"
                />
                <button
                  onClick={addTrigger}
                  disabled={triggerSaving || !newPhrase.trim()}
                  className="px-3 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 disabled:bg-gray-800 disabled:text-gray-600 text-amber-400 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Trigger list */}
              {triggers.length > 0 ? (
                <div className="space-y-2">
                  {triggers.map(trigger => (
                    <div key={trigger.id} className="flex items-center justify-between px-3 py-2.5 bg-dark-700/30 border border-white/5 rounded-xl group hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-amber-400/60 text-xs">#</span>
                        <span className="text-sm text-white font-medium truncate">{trigger.phrase}</span>
                        {trigger.label && (
                          <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                            {trigger.label}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeTrigger(trigger.id)}
                        className="p-1.5 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-xl">
                  <Mail className="w-5 h-5 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">
                    {language === 'fr' ? 'Aucun déclencheur configuré' : 'No triggers configured'}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-1">
                    {language === 'fr' ? 'Ajoute une phrase ci-dessus pour commencer' : 'Add a phrase above to get started'}
                  </p>
                </div>
              )}
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