import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Users, TrendingUp, DollarSign, Loader2, Settings, ArrowRight } from 'lucide-react'
import Layout from '../components/Layout'
import { useLanguage } from '../contexts/LanguageContext'
import { formatPrice } from '../lib/store'

export default function CommunityPage() {
  const { language } = useLanguage()
  const [sales, setSales] = useState([])
  const [stats, setStats] = useState({ total: 0, avgProfit: 0, sellers: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/community/recent')
      .then(r => r.json())
      .then(data => {
        setSales(data.sales || [])
        setStats(data.stats || { total: 0, avgProfit: 0, sellers: 0 })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  return (
    <>
      <Head>
        <title>{language === 'fr' ? 'Communauté' : 'Community'} - OneStock</title>
      </Head>

      <Layout>
        <div className="p-4 md:p-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30">
                <Users className="w-7 h-7 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  {language === 'fr' ? 'Communauté' : 'Community'}
                </h1>
                <p className="text-sm text-gray-400">
                  {language === 'fr' ? 'Ventes partagées par la communauté' : 'Sales shared by the community'}
                </p>
              </div>
            </div>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 border border-gray-700 rounded-xl text-sm text-gray-300 transition-colors"
            >
              <Settings className="w-4 h-4" />
              {language === 'fr' ? 'Paramètres' : 'Settings'}
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="card p-4 text-center bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
              <div className="text-2xl font-black text-purple-400">{stats.sellers}</div>
              <div className="text-xs text-gray-400 mt-1">{language === 'fr' ? 'Membres actifs' : 'Active members'}</div>
            </div>
            <div className="card p-4 text-center bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20">
              <div className="text-2xl font-black text-cyan-400">{stats.total}</div>
              <div className="text-xs text-gray-400 mt-1">{language === 'fr' ? 'Ventes partagées' : 'Shared sales'}</div>
            </div>
            <div className="card p-4 text-center bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
              <div className={`text-2xl font-black ${stats.avgProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.avgProfit >= 0 ? '+' : ''}{formatPrice(stats.avgProfit)}
              </div>
              <div className="text-xs text-gray-400 mt-1">{language === 'fr' ? 'Profit moyen' : 'Avg profit'}</div>
            </div>
          </div>

          {/* Sales feed */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-16 card">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-300 mb-2">
                {language === 'fr' ? 'Aucune vente partagée pour l\'instant' : 'No shared sales yet'}
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                {language === 'fr'
                  ? 'Sois le premier à partager tes ventes avec la communauté !'
                  : 'Be the first to share your sales with the community!'}
              </p>
              <Link
                href="/settings"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-colors"
              >
                {language === 'fr' ? 'Activer le partage' : 'Enable sharing'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {language === 'fr' ? 'Ventes récentes' : 'Recent sales'}
              </h2>

              {/* Header table */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 px-4 py-2 text-xs text-gray-500 font-medium">
                <span>{language === 'fr' ? 'Sneaker' : 'Sneaker'}</span>
                <span>{language === 'fr' ? 'Taille' : 'Size'}</span>
                <span>{language === 'fr' ? 'Prix vendu' : 'Sold price'}</span>
                <span>{language === 'fr' ? 'Profit' : 'Profit'}</span>
                <span>{language === 'fr' ? 'Vendeur' : 'Seller'}</span>
              </div>

              <div className="space-y-2">
                {sales.map((sale, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 items-center px-4 py-3 bg-dark-800 border border-purple-500/10 hover:border-purple-500/30 rounded-xl transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-white text-sm truncate">{sale.name || '—'}</div>
                      <div className="text-xs text-gray-500 truncate">{sale.platform || ''} · {formatDate(sale.sellDate)}</div>
                    </div>
                    <span className="text-gray-300 text-sm">{sale.size || '—'}</span>
                    <span className="text-emerald-400 font-bold text-sm">{formatPrice(sale.sellPrice)}</span>
                    <span className={`font-semibold text-sm ${sale.profit >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                      {sale.profit >= 0 ? '+' : ''}{formatPrice(sale.profit)}
                    </span>
                    <span className="text-purple-300 text-sm truncate">{sale.seller}</span>
                  </div>
                ))}
              </div>

              {/* CTA rejoindre */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-white text-sm">
                    {language === 'fr' ? 'Tu veux contribuer ?' : 'Want to contribute?'}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {language === 'fr'
                      ? 'Active le partage dans les paramètres pour que tes ventes apparaissent ici.'
                      : 'Enable sharing in settings so your sales appear here.'}
                  </div>
                </div>
                <Link
                  href="/settings"
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  {language === 'fr' ? 'Paramètres' : 'Settings'}
                </Link>
              </div>
            </>
          )}
        </div>
      </Layout>
    </>
  )
}