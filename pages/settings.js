import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Settings, Sun, Moon } from 'lucide-react'
import Layout from '../components/Layout'
import { loadData } from '../lib/store'
import { useTheme } from '../contexts/ThemeContext'

export default function SettingsPage() {
  const [data, setData] = useState({ sneakers: [], sales: [], settings: {} })
  const [isLoaded, setIsLoaded] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const loaded = loadData()
    setData(loaded)
    setIsLoaded(true)
  }, [])

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

          {/* Apparence */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-6">Apparence</h2>

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
            <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
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
            <h3 className="text-lg font-semibold mb-2">A propos</h3>
            <p className="text-gray-400 text-sm">
              <span className="font-semibold">OneStock</span> - Gestion de stock sneakers
            </p>
          </div>
        </div>
      </Layout>
    </>
  )
}
