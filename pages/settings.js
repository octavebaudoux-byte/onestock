import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Settings, Key, CheckCircle, XCircle, Loader2, ExternalLink, Database, Wifi } from 'lucide-react'
import Layout from '../components/Layout'
import { loadData, saveData } from '../lib/store'
import { saveApiKey, testApiConnection, isApiConfigured } from '../lib/kicksdb'

export default function SettingsPage() {
  const [data, setData] = useState({ sneakers: [], sales: [], settings: {} })
  const [isLoaded, setIsLoaded] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [testStatus, setTestStatus] = useState(null) // null, 'testing', 'success', 'error'
  const [testError, setTestError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const loaded = loadData()
    setData(loaded)
    setApiKey(loaded.settings?.kicksdbApiKey || '')
    setIsLoaded(true)
  }, [])

  const handleSaveApiKey = async () => {
    // Sauvegarder la clé
    saveApiKey(apiKey)

    // Mettre à jour le state local
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, kicksdbApiKey: apiKey }
    }))

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)

    // Tester la connexion si une clé est fournie
    if (apiKey) {
      await handleTestConnection()
    }
  }

  const handleTestConnection = async () => {
    if (!apiKey) {
      setTestStatus('error')
      setTestError('Aucune clé API fournie')
      return
    }

    setTestStatus('testing')
    setTestError('')

    // Sauvegarder d'abord pour que le test utilise la bonne clé
    saveApiKey(apiKey)

    const { success, error } = await testApiConnection()

    if (success) {
      setTestStatus('success')
    } else {
      setTestStatus('error')
      switch (error) {
        case 'INVALID_API_KEY':
          setTestError('Clé API invalide')
          break
        case 'RATE_LIMIT':
          setTestError('Limite de requêtes atteinte')
          break
        case 'NETWORK_ERROR':
          setTestError('Erreur réseau - Vérifiez votre connexion')
          break
        default:
          setTestError(`Erreur: ${error}`)
      }
    }
  }

  const handleClearApiKey = () => {
    setApiKey('')
    saveApiKey('')
    setTestStatus(null)
    setTestError('')
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, kicksdbApiKey: '' }
    }))
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Paramètres - OneStock</title>
      </Head>

      <Layout>
        <div className="p-8 max-w-3xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Settings className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold">Paramètres</h1>
              <p className="text-gray-400">Configuration de OneStock</p>
            </div>
          </div>

          {/* API Configuration */}
          <div className="card p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">KicksDB API</h2>
                <p className="text-sm text-gray-400">Accès aux données sneakers en temps réel</p>
              </div>
            </div>

            <div className="bg-dark-700 rounded-xl p-4 text-sm">
              <div className="flex items-start gap-3">
                <Wifi className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-gray-300 mb-2">
                    KicksDB fournit des données en temps réel sur plus de <span className="text-white font-semibold">175,000 sneakers</span> depuis StockX, GOAT et autres marketplaces.
                  </p>
                  <p className="text-gray-400 mb-3">
                    Le plan gratuit inclut <span className="text-emerald-400">1,000 requêtes/mois</span>.
                  </p>
                  <a
                    href="https://kicks.dev/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Obtenir une clé API gratuite
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* API Key Input */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                <Key className="w-4 h-4 inline mr-2" />
                Clé API KicksDB
              </label>
              <div className="flex gap-3">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Entrez votre clé API..."
                  className="flex-1"
                />
                <button
                  onClick={handleSaveApiKey}
                  disabled={testStatus === 'testing'}
                  className="btn btn-primary px-6"
                >
                  {saved ? 'Sauvegardé ✓' : 'Sauvegarder'}
                </button>
              </div>
            </div>

            {/* Test Connection */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleTestConnection}
                disabled={!apiKey || testStatus === 'testing'}
                className="btn btn-secondary flex items-center gap-2"
              >
                {testStatus === 'testing' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Test en cours...
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4" />
                    Tester la connexion
                  </>
                )}
              </button>

              {testStatus === 'success' && (
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>Connexion réussie!</span>
                </div>
              )}

              {testStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-400">
                  <XCircle className="w-5 h-5" />
                  <span>{testError}</span>
                </div>
              )}
            </div>

            {/* Clear API Key */}
            {apiKey && (
              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={handleClearApiKey}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Supprimer la clé API
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="card p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Statistiques locales</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-dark-700 rounded-xl p-4">
                <div className="text-3xl font-bold text-blue-400">{data.sneakers.length}</div>
                <div className="text-sm text-gray-400">Paires totales</div>
              </div>
              <div className="bg-dark-700 rounded-xl p-4">
                <div className="text-3xl font-bold text-emerald-400">
                  {data.sneakers.filter(s => s.status === 'stock').length}
                </div>
                <div className="text-sm text-gray-400">En stock</div>
              </div>
              <div className="bg-dark-700 rounded-xl p-4">
                <div className="text-3xl font-bold text-cyan-400">
                  {data.sneakers.filter(s => s.status === 'sold').length}
                </div>
                <div className="text-sm text-gray-400">Vendues</div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="card p-6 mt-6">
            <h3 className="text-lg font-semibold mb-2">À propos</h3>
            <p className="text-gray-400 text-sm">
              <span className="text-white font-semibold">OneStock</span> - Gestion de stock sneakers
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Les données sont stockées localement dans votre navigateur.
            </p>
          </div>
        </div>
      </Layout>
    </>
  )
}
