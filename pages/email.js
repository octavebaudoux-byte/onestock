import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { Mail, Plus, Trash2, Check, AlertCircle, Loader2, Shield, Clock } from 'lucide-react'
import Layout from '../components/Layout'
import { useLanguage } from '../contexts/LanguageContext'

function GmailLogo({ className = 'w-8 h-8' }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="#EA4335"/>
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="url(#gmail-page-grad)"/>
      <defs>
        <linearGradient id="gmail-page-grad" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#EA4335"/>
          <stop offset="30%" stopColor="#FBBC04" stopOpacity="0.3"/>
          <stop offset="60%" stopColor="#34A853" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#4285F4"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function EmailPage() {
  const { language } = useLanguage()

  // Email config state
  const [emailConfig, setEmailConfig] = useState(null)
  const [emailForm, setEmailForm] = useState({ email: '', app_password: '', imap_host: 'imap.gmail.com', imap_port: 993 })
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailSuccess, setEmailSuccess] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)

  // Triggers state
  const [triggers, setTriggers] = useState([])
  const [newPhrase, setNewPhrase] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [triggerSaving, setTriggerSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/data/email-config', { credentials: 'same-origin' }).then(r => r.ok ? r.json() : null),
      fetch('/api/data/email-triggers', { credentials: 'same-origin' }).then(r => r.ok ? r.json() : []),
    ]).then(([config, triggersData]) => {
      if (config) {
        setEmailConfig(config)
        setEmailForm(prev => ({ ...prev, email: config.email, imap_host: config.imap_host, imap_port: config.imap_port }))
      }
      setTriggers(triggersData || [])
      setIsLoaded(true)
    }).catch(() => setIsLoaded(true))
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
      if (!res.ok) { const err = await res.json(); throw new Error(err.error) }
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
      await fetch('/api/data/email-config', { method: 'DELETE', credentials: 'same-origin' })
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
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      </Layout>
    )
  }

  return (
    <>
      <Head>
        <title>{language === 'fr' ? 'Email - OneStock' : 'Email - OneStock'}</title>
      </Head>

      <Layout>
        <div className="p-4 md:p-8 max-w-3xl">
          {/* Header with Gmail logo */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <GmailLogo className="w-8 h-8 md:w-9 md:h-9" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {language === 'fr' ? 'Notifications Email' : 'Email Notifications'}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {language === 'fr' ? 'Connexion IMAP - Gmail & autres fournisseurs' : 'IMAP connection - Gmail & other providers'}
              </p>
            </div>
          </div>

          {/* Connection Card */}
          <div className="card p-5 md:p-6 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-white">
                {language === 'fr' ? 'Connexion' : 'Connection'}
              </h2>
            </div>

            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              {language === 'fr'
                ? 'Connecte ta boîte mail via IMAP pour scanner automatiquement tes emails. Utilise un mot de passe d\'application pour la sécurité.'
                : 'Connect your mailbox via IMAP to automatically scan your emails. Use an app password for security.'}
            </p>

            {emailConfig ? (
              /* Connected state */
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <GmailLogo className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{emailConfig.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] text-emerald-400/80">
                          {language === 'fr' ? 'Connecté' : 'Connected'}
                        </span>
                      </div>
                      {emailConfig.last_check_at && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-[10px] text-gray-500">
                            {language === 'fr' ? 'Dernier scan' : 'Last scan'}: {new Date(emailConfig.last_check_at).toLocaleString()}
                          </span>
                        </div>
                      )}
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
              <div className="space-y-4">
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

                <div className="flex gap-3">
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
                  <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 px-3 py-2.5 rounded-lg">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {emailError}
                  </div>
                )}

                {emailSuccess && (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 px-3 py-2.5 rounded-lg">
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
                      <GmailLogo className="w-4 h-4" />
                      {language === 'fr' ? 'Connecter Gmail' : 'Connect Gmail'}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Trigger Phrases Card */}
          <div className="card p-5 md:p-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <span className="text-sm">&#9889;</span>
              </div>
              <h2 className="text-sm font-semibold text-white">
                {language === 'fr' ? 'Phrases déclencheurs' : 'Trigger phrases'}
              </h2>
            </div>
            <p className="text-[10px] md:text-xs text-gray-500 mb-5 leading-relaxed">
              {language === 'fr'
                ? 'Ajoute des mots-clés ou phrases. Dès qu\'un email les contient, tu recevras une notification dans la cloche.'
                : 'Add keywords or phrases. When an email contains them, you\'ll get a notification in the bell.'}
            </p>

            {/* Add trigger form */}
            <div className="flex gap-2 mb-5">
              <div className="flex-1">
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
                className="w-24 md:w-36 px-3 py-2.5 text-sm rounded-lg bg-dark-700 border border-white/10 focus:border-amber-500/50 transition-all outline-none"
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
                  <div key={trigger.id} className="flex items-center justify-between px-3 py-3 bg-dark-700/30 border border-white/5 rounded-xl group hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-amber-400/60 text-xs">#</span>
                      <span className="text-sm text-white font-medium truncate">{trigger.phrase}</span>
                      {trigger.label && (
                        <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full shrink-0">
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
              <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                <Mail className="w-6 h-6 text-gray-600 mx-auto mb-2" />
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
      </Layout>
    </>
  )
}