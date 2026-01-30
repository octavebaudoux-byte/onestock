import { useState, useMemo } from 'react'
import Head from 'next/head'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import Layout from '../components/Layout'
import { formatPrice, calculateStats } from '../lib/store'
import { useData } from '../hooks/useData'

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16']

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

export default function Stats() {
  const { sneakers, loading } = useData()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const stats = calculateStats(sneakers)

  // Années disponibles (basées sur les données)
  const availableYears = useMemo(() => {
    const years = new Set()
    const currentYear = new Date().getFullYear()
    years.add(currentYear)

    sneakers.forEach(s => {
      if (s.buyDate) years.add(new Date(s.buyDate).getFullYear())
      if (s.sellDate) years.add(new Date(s.sellDate).getFullYear())
    })

    return Array.from(years).sort((a, b) => b - a)
  }, [sneakers])

  // Données pour le graphique par marque
  const brandChartData = useMemo(() => {
    return Object.entries(stats.brandStats)
      .map(([brand, data]) => ({
        name: brand,
        paires: data.count,
        profit: data.profit,
      }))
      .sort((a, b) => b.paires - a.paires)
      .slice(0, 8)
  }, [stats.brandStats])

  // Données pour le graphique mensuel (12 mois de l'année sélectionnée)
  const monthlyChartData = useMemo(() => {
    const months = {}

    // Créer les 12 mois de l'année sélectionnée
    for (let i = 0; i < 12; i++) {
      const key = MONTHS[i]
      months[key] = { name: key, ventes: 0, profit: 0, achats: 0 }
    }

    // Remplir avec les données
    sneakers.forEach(s => {
      // Achats
      if (s.buyDate) {
        const buyDate = new Date(s.buyDate)
        if (buyDate.getFullYear() === selectedYear) {
          const buyKey = MONTHS[buyDate.getMonth()]
          months[buyKey].achats += s.buyPrice
        }
      }

      // Ventes
      if (s.status === 'sold' && s.sellDate) {
        const sellDate = new Date(s.sellDate)
        if (sellDate.getFullYear() === selectedYear) {
          const sellKey = MONTHS[sellDate.getMonth()]
          months[sellKey].ventes += s.sellPrice || 0
          months[sellKey].profit += (s.sellPrice || 0) - s.buyPrice - (s.fees || 0)
        }
      }
    })

    return Object.values(months)
  }, [sneakers, selectedYear])

  // Données pour le pie chart des plateformes
  const platformChartData = useMemo(() => {
    const platforms = {}
    sneakers.filter(s => s.status === 'sold').forEach(s => {
      const platform = s.sellPlatform || 'Non spécifié'
      if (!platforms[platform]) platforms[platform] = 0
      platforms[platform]++
    })
    return Object.entries(platforms)
      .map(([platform, count]) => ({ name: platform, value: count }))
      .sort((a, b) => b.value - a.value)
  }, [sneakers])

  // Top performers
  const topPerformers = useMemo(() => {
    return sneakers
      .filter(s => s.status === 'sold')
      .map(s => ({
        ...s,
        profit: (s.sellPrice || 0) - s.buyPrice - (s.fees || 0),
        roi: (((s.sellPrice || 0) - s.buyPrice - (s.fees || 0)) / s.buyPrice * 100)
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5)
  }, [sneakers])

  const handlePrevYear = () => {
    setSelectedYear(prev => prev - 1)
  }

  const handleNextYear = () => {
    if (selectedYear < new Date().getFullYear()) {
      setSelectedYear(prev => prev + 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-700 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.name.includes('profit') || entry.name.includes('ventes') || entry.name.includes('achats')
                ? formatPrice(entry.value)
                : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <>
      <Head>
        <title>Statistiques - OneStock</title>
      </Head>

      <Layout>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Statistiques</h1>
            <p className="text-gray-400">Analyse détaillée de tes performances</p>
          </div>

          {sneakers.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-5xl mb-4">📊</div>
              <p className="text-gray-400 mb-2">Pas encore de données</p>
              <p className="text-sm text-gray-500">
                Ajoute des paires pour voir tes statistiques
              </p>
            </div>
          ) : (
            <>
              {/* Charts grid - Achats et Ventes/Profit séparés */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Achats en volumes (barres) */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Achats mensuels</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrevYear}
                        className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-400" />
                      </button>
                      <span className="text-lg font-bold text-blue-400 min-w-[60px] text-center">
                        {selectedYear}
                      </span>
                      <button
                        onClick={handleNextYear}
                        disabled={selectedYear >= new Date().getFullYear()}
                        className={`p-2 rounded-lg transition-colors ${
                          selectedYear >= new Date().getFullYear()
                            ? 'opacity-30 cursor-not-allowed'
                            : 'hover:bg-dark-600'
                        }`}
                      >
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis stroke="#888" tickFormatter={(v) => `${v}€`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="achats" name="Achats" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Ventes et Profit en courbes */}
                <div className="card">
                  <h2 className="text-xl font-semibold mb-4">Ventes & Profit</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis stroke="#888" tickFormatter={(v) => `${v}€`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="ventes" name="Ventes" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} activeDot={{ r: 7 }} />
                        <Line type="monotone" dataKey="profit" name="Profit" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 5 }} activeDot={{ r: 7 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Charts grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Brand chart */}
                <div className="card">
                  <h2 className="text-xl font-semibold mb-4">Par marque</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={brandChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis type="number" stroke="#888" />
                        <YAxis dataKey="name" type="category" stroke="#888" width={80} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="paires" name="Paires" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Platform pie chart */}
                <div className="card">
                  <h2 className="text-xl font-semibold mb-4">Plateformes de vente</h2>
                  {platformChartData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={platformChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            labelLine={false}
                          >
                            {platformChartData.map((entry, index) => (
                              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      Aucune vente enregistrée
                    </div>
                  )}
                </div>
              </div>

              {/* Top performers */}
              {topPerformers.length > 0 && (
                <div className="card">
                  <h2 className="text-xl font-semibold mb-4">🏆 Top 5 meilleures ventes</h2>
                  <div className="space-y-3">
                    {topPerformers.map((sneaker, index) => (
                      <div key={sneaker.id} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{sneaker.name}</div>
                            <div className="text-sm text-gray-400">
                              {sneaker.brand} • Taille {sneaker.size}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-emerald-400 font-bold">
                            +{formatPrice(sneaker.profit)}
                          </div>
                          <div className="text-sm text-gray-500">
                            ROI: {sneaker.roi.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Layout>
    </>
  )
}
