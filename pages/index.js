import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Package, TrendingUp, Zap, Target, Flame, ArrowUpRight, Percent, Sparkles } from 'lucide-react'
import Layout from '../components/Layout'
import SneakerModal from '../components/SneakerModal'
import SneakerCard from '../components/SneakerCard'
import { calculateStats, formatPrice } from '../lib/store'
import { useData } from '../hooks/useData'
import { useExpenses } from '../hooks/useExpenses'
import { useLanguage } from '../contexts/LanguageContext'

export default function Dashboard() {
  const { sneakers, loading, save, update, remove } = useData()
  const { expenses } = useExpenses()
  const { t } = useLanguage()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSneaker, setEditingSneaker] = useState(null)
  const [modalMode, setModalMode] = useState('add')
  const [animatedStats, setAnimatedStats] = useState({ profit: 0, stock: 0, sold: 0, value: 0 })

  const stats = calculateStats(sneakers)

  // Calcul des dépenses totales
  const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
  const netProfit = stats.totalProfit - totalExpenses

  // Animation des stats au chargement
  useEffect(() => {
    if (!loading && sneakers.length > 0) {
      const duration = 1500
      const steps = 60
      const interval = duration / steps

      let step = 0
      const timer = setInterval(() => {
        step++
        const progress = step / steps
        const easeOut = 1 - Math.pow(1 - progress, 3)

        setAnimatedStats({
          profit: Math.round(stats.totalProfit * easeOut),
          stock: Math.round(stats.inStockCount * easeOut),
          sold: Math.round(stats.soldCount * easeOut),
          value: Math.round(stats.stockValue * easeOut)
        })

        if (step >= steps) clearInterval(timer)
      }, interval)

      return () => clearInterval(timer)
    }
  }, [loading, sneakers.length])

  // Handlers
  const handleSaveSneaker = async (sneaker) => {
    await save(sneaker)
    setEditingSneaker(null)
  }

  const handleDeleteSneaker = async (id) => {
    if (confirm('Supprimer cette paire ?')) {
      await remove(id)
    }
  }

  const handleEditSneaker = (sneaker) => {
    setEditingSneaker(sneaker)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleToggle = async (id, updates) => {
    await update(id, updates)
  }

  const openAddModal = () => {
    setEditingSneaker(null)
    setModalMode('add')
    setIsModalOpen(true)
  }

  const openSaleModal = () => {
    setEditingSneaker(null)
    setModalMode('sale')
    setIsModalOpen(true)
  }

  // Dernières paires (6 pour la grille)
  const recentSneakers = [...sneakers]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6)

  // Dernières ventes
  const recentSales = sneakers
    .filter(s => s.status === 'sold')
    .sort((a, b) => new Date(b.sellDate) - new Date(a.sellDate))
    .slice(0, 4)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-blue-300 animate-pulse">{t('common.loading')}</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>OneStock - {t('dashboard.title')}</title>
        <meta name="description" content="Sneaker inventory management" />
      </Head>

      <Layout onAddClick={openAddModal} onAddSaleClick={openSaleModal}>
        <div className="p-8 space-y-8">
          {/* Header avec effet gradient */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-blue-600/20 border border-blue-500/30 p-8">
            <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle, rgba(59,130,246,0.15) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
                <h1 className="text-4xl font-black bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent">
                  {t('dashboard.title')}
                </h1>
              </div>
              <p className="text-blue-200/70 text-lg">{t('dashboard.subtitle')}</p>
            </div>
          </div>

          {/* Stats Cards avec animations - Cliquables */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Paires en stock - Lien vers inventaire */}
            <Link href="/inventory" className="group relative bg-gradient-to-br from-blue-500/10 to-blue-600/20 border border-blue-500/30 rounded-2xl p-6 hover:border-blue-400/50 transition-all duration-500 hover:shadow-lg hover:shadow-blue-500/20 animate-slideUp cursor-pointer" style={{ animationDelay: '0ms' }}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-4 h-4 text-blue-400" />
              </div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">👟</span>
                  <Package className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-4xl font-black text-white mb-1">{animatedStats.stock || stats.inStockCount}</div>
                <div className="text-sm text-blue-300/70">Paires en stock</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-blue-400/60">{stats.totalPairs} au total</span>
                  {stats.totalPairs > 0 && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full">
                      <Percent className="w-3 h-3" />
                      {Math.round((stats.inStockCount / stats.totalPairs) * 100)}%
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Valeur du stock - Lien vers inventaire */}
            <Link href="/inventory" className="group relative bg-gradient-to-br from-purple-500/10 to-purple-600/20 border border-purple-500/30 rounded-2xl p-6 hover:border-purple-400/50 transition-all duration-500 hover:shadow-lg hover:shadow-purple-500/20 animate-slideUp cursor-pointer" style={{ animationDelay: '100ms' }}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-4 h-4 text-purple-400" />
              </div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">💎</span>
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-4xl font-black text-white mb-1">{formatPrice(animatedStats.value || stats.stockValue)}</div>
                <div className="text-sm text-purple-300/70">Valeur du stock</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-purple-400/60">{formatPrice(stats.totalInvested)} investi</span>
                  {stats.totalInvested > 0 && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
                      <Percent className="w-3 h-3" />
                      {Math.round((stats.stockValue / stats.totalInvested) * 100)}%
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Profit net (profit - dépenses) - Lien vers ventes */}
            <Link href="/sales" className={`group relative border rounded-2xl p-6 transition-all duration-500 hover:shadow-lg animate-slideUp cursor-pointer ${
              netProfit >= 0
                ? 'bg-gradient-to-br from-cyan-500/10 to-emerald-600/20 border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-cyan-500/20'
                : 'bg-gradient-to-br from-red-500/10 to-orange-600/20 border-red-500/30 hover:border-red-400/50 hover:shadow-red-500/20'
            }`} style={{ animationDelay: '200ms' }}>
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl transition-all ${
                netProfit >= 0 ? 'bg-cyan-500/10 group-hover:bg-cyan-500/20' : 'bg-red-500/10 group-hover:bg-red-500/20'
              }`} />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className={`w-4 h-4 ${netProfit >= 0 ? 'text-cyan-400' : 'text-red-400'}`} />
              </div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{netProfit >= 0 ? '📈' : '📉'}</span>
                  <TrendingUp className={`w-5 h-5 ${netProfit >= 0 ? 'text-cyan-400' : 'text-red-400'}`} />
                </div>
                <div className={`text-4xl font-black mb-1 ${netProfit >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                  {netProfit >= 0 ? '+' : ''}{formatPrice(netProfit)}
                </div>
                <div className={`text-sm ${netProfit >= 0 ? 'text-cyan-300/70' : 'text-red-300/70'}`}>Profit net</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-xs ${netProfit >= 0 ? 'text-cyan-400/60' : 'text-red-400/60'}`}>
                    {animatedStats.sold || stats.soldCount} ventes{totalExpenses > 0 ? ` • -${formatPrice(totalExpenses)} frais` : ''}
                  </span>
                  {stats.totalSold > 0 && (
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      netProfit >= 0 ? 'text-cyan-400 bg-cyan-500/20' : 'text-red-400 bg-red-500/20'
                    }`}>
                      <Percent className="w-3 h-3" />
                      {stats.totalSold > 0 ? (netProfit >= 0 ? '+' : '') + Math.round((netProfit / stats.totalSold) * 100) : 0}% ROI
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Profit moyen - Lien vers ventes */}
            <Link href="/sales" className="group relative bg-gradient-to-br from-amber-500/10 to-orange-600/20 border border-amber-500/30 rounded-2xl p-6 hover:border-amber-400/50 transition-all duration-500 hover:shadow-lg hover:shadow-amber-500/20 animate-slideUp cursor-pointer" style={{ animationDelay: '300ms' }}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
              </div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">⚡</span>
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-4xl font-black text-white mb-1">{formatPrice(stats.avgProfit)}</div>
                <div className="text-sm text-amber-300/70">Profit moyen</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-amber-400/60">par paire vendue</span>
                  {stats.soldCount > 0 && stats.avgProfit !== 0 && (
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      stats.avgProfit >= 0 ? 'text-amber-400 bg-amber-500/20' : 'text-red-400 bg-red-500/20'
                    }`}>
                      <Percent className="w-3 h-3" />
                      {stats.avgProfit >= 0 ? '+' : ''}{Math.round((stats.avgProfit / (stats.totalSold / stats.soldCount)) * 100)}%
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>

          {/* Section Derniers ajouts - Grille de cards */}
          <div className="animate-slideUp" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Flame className="w-6 h-6 text-orange-400" />
                <h2 className="text-2xl font-bold text-white">Derniers ajouts</h2>
              </div>
              {sneakers.length > 6 && (
                <a href="/inventory" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  Voir tout →
                </a>
              )}
            </div>

            {recentSneakers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center sm:justify-items-start px-4 sm:px-0">
                {recentSneakers.map((sneaker, index) => (
                  <div key={sneaker.id} className="animate-slideUp w-full flex justify-center sm:justify-start" style={{ animationDelay: `${500 + index * 100}ms` }}>
                    <SneakerCard
                      sneaker={sneaker}
                      onEdit={handleEditSneaker}
                      onDelete={handleDeleteSneaker}
                      onToggle={handleToggle}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative bg-gradient-to-br from-dark-700 to-dark-800 border border-blue-500/20 rounded-3xl p-12 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
                <div className="relative">
                  <div className="text-7xl mb-6 animate-bounce">👟</div>
                  <p className="text-xl text-gray-300 mb-2">Aucune paire dans ton stock</p>
                  <p className="text-gray-500 mb-6">Commence à tracker tes sneakers !</p>
                  <button onClick={openAddModal} className="btn btn-primary text-lg px-8 py-3 hover:scale-105 transition-transform">
                    Ajouter ta première paire
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section Dernières ventes */}
          {recentSales.length > 0 && (
            <div className="animate-slideUp" style={{ animationDelay: '600ms' }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-2xl font-bold text-white">Dernières ventes</h2>
                </div>
                <a href="/sales" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  Voir tout →
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center sm:justify-items-start px-4 sm:px-0">
                {recentSales.map((sneaker, index) => (
                  <div key={sneaker.id} className="animate-slideUp w-full flex justify-center sm:justify-start" style={{ animationDelay: `${700 + index * 100}ms` }}>
                    <SneakerCard
                      sneaker={sneaker}
                      onEdit={handleEditSneaker}
                      onDelete={handleDeleteSneaker}
                      onToggle={handleToggle}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance par marque */}
          {Object.keys(stats.brandStats).length > 0 && (
            <div className="animate-slideUp" style={{ animationDelay: '800ms' }}>
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Performance par marque</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(stats.brandStats)
                  .sort((a, b) => b[1].count - a[1].count)
                  .map(([brand, brandData], index) => (
                    <div
                      key={brand}
                      className="group relative bg-gradient-to-br from-dark-700 to-dark-800 border border-blue-500/20 rounded-2xl p-4 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 animate-slideUp"
                      style={{ animationDelay: `${900 + index * 50}ms` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                      <div className="relative">
                        <div className="text-lg font-bold text-white mb-1">{brand}</div>
                        <div className="text-sm text-blue-300/60 mb-2">{brandData.count} paires</div>
                        <div className={`text-lg font-bold ${brandData.profit >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                          {brandData.profit >= 0 ? '+' : ''}{formatPrice(brandData.profit)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </Layout>

      {/* Modal */}
      <SneakerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingSneaker(null)
        }}
        onSave={handleSaveSneaker}
        sneaker={editingSneaker}
        mode={modalMode}
      />
    </>
  )
}
