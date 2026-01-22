import { Edit, Trash2, ArrowRight } from 'lucide-react'
import { formatPrice } from '../lib/store'

export default function SaleCard({ sneaker, onEdit, onDelete }) {
  const profit = (sneaker.sellPrice || 0) - sneaker.buyPrice - (sneaker.fees || 0)
  const roi = sneaker.buyPrice > 0 ? (profit / sneaker.buyPrice) * 100 : 0

  const formatSellDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="group relative bg-gradient-to-br from-dark-700 via-dark-800 to-dark-900 border border-blue-500/20 rounded-2xl overflow-hidden hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
      <div className="flex">
        {/* Image */}
        <div className="relative w-32 h-32 bg-gradient-to-br from-dark-600 to-dark-700 flex items-center justify-center flex-shrink-0">
          {sneaker.imageUrl ? (
            <img
              src={sneaker.imageUrl}
              alt={sneaker.name}
              className="w-full h-full object-contain p-2"
            />
          ) : (
            <div className="text-5xl">👟</div>
          )}
          {/* Badge vendu */}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/90 text-dark-900">
            VENDU
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                  {sneaker.name}
                </h3>
                <p className="text-sm text-blue-300/60">
                  {sneaker.brand} • Taille {sneaker.size}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(sneaker)}
                  className="p-1.5 bg-dark-600/80 rounded-lg text-gray-400 hover:text-white hover:bg-blue-500 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(sneaker.id)}
                  className="p-1.5 bg-dark-600/80 rounded-lg text-gray-400 hover:text-white hover:bg-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Date & Plateforme */}
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              {sneaker.sellDate && <span>{formatSellDate(sneaker.sellDate)}</span>}
              {sneaker.sellPlatform && (
                <>
                  <span>•</span>
                  <span className="text-blue-400/70">{sneaker.sellPlatform}</span>
                </>
              )}
            </div>
          </div>

          {/* Prix et Profit */}
          <div className="flex items-center justify-between mt-3">
            {/* Prix achat → vente */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">{formatPrice(sneaker.buyPrice)}</span>
              <ArrowRight className="w-4 h-4 text-blue-500" />
              <span className="text-cyan-400 font-semibold">{formatPrice(sneaker.sellPrice)}</span>
            </div>

            {/* Profit */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${
              profit >= 0
                ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30'
                : 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30'
            }`}>
              <span className={`text-lg font-bold ${profit >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                {profit >= 0 ? '+' : ''}{formatPrice(profit)}
              </span>
              <span className={`text-xs font-medium ${profit >= 0 ? 'text-cyan-400/70' : 'text-red-400/70'}`}>
                ({roi >= 0 ? '+' : ''}{roi.toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
