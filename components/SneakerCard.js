import { Edit, Trash2 } from 'lucide-react'
import { formatPrice } from '../lib/store'

export default function SneakerCard({ sneaker, onEdit, onDelete, variant = 'default' }) {
  const profit = sneaker.status === 'sold' && sneaker.sellPrice
    ? sneaker.sellPrice - sneaker.buyPrice - (sneaker.fees || 0)
    : null

  // Card compacte pour les listes
  if (variant === 'compact') {
    return (
      <div className="group relative bg-gradient-to-br from-dark-700 to-dark-800 border border-blue-500/20 rounded-2xl p-4 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
        <div className="flex gap-4">
          {/* Image */}
          <div className="w-20 h-20 bg-dark-600 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-blue-500/20">
            {sneaker.imageUrl ? (
              <img src={sneaker.imageUrl} alt={sneaker.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">👟</div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{sneaker.name}</h3>
            <p className="text-sm text-blue-300/70">{sneaker.brand} • {sneaker.size}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-gray-400">{formatPrice(sneaker.buyPrice)}</span>
              {sneaker.status === 'sold' && (
                <>
                  <span className="text-blue-500">→</span>
                  <span className="text-sm text-cyan-400">{formatPrice(sneaker.sellPrice)}</span>
                </>
              )}
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex flex-col items-end justify-between">
            <div className="flex flex-col items-end gap-1">
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                sneaker.status === 'sold' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {sneaker.status === 'sold' ? 'Vendu' : 'Stock'}
              </span>
              {sneaker.status === 'sold' && (
                <div className="flex gap-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    sneaker.paymentStatus === 'received' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {sneaker.paymentStatus === 'received' ? '💰' : '⏳'}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    sneaker.deliveryStatus === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' : sneaker.deliveryStatus === 'shipped' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {sneaker.deliveryStatus === 'delivered' ? '✅' : sneaker.deliveryStatus === 'shipped' ? '📦' : '📤'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(sneaker)} className="p-1.5 hover:bg-dark-600 rounded-lg text-gray-400 hover:text-white">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(sneaker.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Card principale style Resell Notion
  return (
    <div className="group relative bg-gradient-to-br from-dark-700 via-dark-800 to-dark-900 border border-blue-500/30 rounded-3xl overflow-hidden hover:border-cyan-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20 hover:scale-[1.02]">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Image section */}
      <div className="relative h-52 bg-white/95 flex items-center justify-center overflow-hidden m-3 rounded-2xl">
        {sneaker.imageUrl ? (
          <img
            src={sneaker.imageUrl}
            alt={sneaker.name}
            className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="text-6xl group-hover:scale-110 transition-transform duration-500">👟</div>
        )}

        {/* Status badge */}
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold shadow-md ${
          sneaker.status === 'sold' ? 'bg-cyan-500 text-dark-900' : 'bg-blue-500 text-white'
        }`}>
          {sneaker.status === 'sold' ? '✓ VENDU' : 'EN STOCK'}
        </div>

        {/* Actions overlay */}
        <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(sneaker)} className="p-2 bg-dark-800/90 backdrop-blur-sm rounded-lg text-white hover:bg-blue-500 transition-colors shadow-md">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(sneaker.id)} className="p-2 bg-dark-800/90 backdrop-blur-sm rounded-lg text-white hover:bg-red-500 transition-colors shadow-md">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-bold text-lg text-white mb-1 line-clamp-2 group-hover:text-cyan-300 transition-colors">
          {sneaker.name}
        </h3>

        {/* SKU & Size */}
        <p className="text-sm text-blue-300/60 font-mono mb-4">
          SKU: {sneaker.sku || 'N/A'} | SIZE: {sneaker.size}
        </p>

        {/* Price boxes */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-dark-600/50 border border-blue-500/20 rounded-xl p-3 text-center">
            <div className="text-xs text-blue-300/60 uppercase tracking-wider mb-1">Achat</div>
            <div className="text-xl font-bold text-white">{formatPrice(sneaker.buyPrice)}</div>
          </div>
          <div className="bg-dark-600/50 border border-cyan-500/20 rounded-xl p-3 text-center">
            <div className="text-xs text-cyan-300/60 uppercase tracking-wider mb-1">Vente</div>
            <div className="text-xl font-bold text-cyan-400">
              {sneaker.sellPrice ? formatPrice(sneaker.sellPrice) : '—'}
            </div>
          </div>
        </div>

        {/* Profit box */}
        {sneaker.status === 'sold' && profit !== null && (
          <div className={`rounded-xl p-4 text-center ${
            profit >= 0
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30'
              : 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30'
          }`}>
            <div className="text-xs uppercase tracking-wider mb-1 text-gray-400">Profit Net</div>
            <div className={`text-3xl font-black ${profit >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
              {profit >= 0 ? '+' : ''}{formatPrice(profit)}
            </div>
          </div>
        )}

        {/* Payment & Delivery status for sold items */}
        {sneaker.status === 'sold' && (
          <div className="flex gap-2 mt-3">
            <div className={`flex-1 text-center py-2 px-3 rounded-lg text-xs font-medium ${
              sneaker.paymentStatus === 'received'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {sneaker.paymentStatus === 'received' ? '💰 Paiement reçu' : '⏳ Paiement en attente'}
            </div>
            <div className={`flex-1 text-center py-2 px-3 rounded-lg text-xs font-medium ${
              sneaker.deliveryStatus === 'delivered'
                ? 'bg-emerald-500/20 text-emerald-400'
                : sneaker.deliveryStatus === 'shipped'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {sneaker.deliveryStatus === 'delivered' ? '✅ Livré' : sneaker.deliveryStatus === 'shipped' ? '📦 Expédié' : '📤 À expédier'}
            </div>
          </div>
        )}

        {/* In stock indicator */}
        {sneaker.status === 'stock' && (
          <div className="rounded-xl p-4 text-center bg-blue-500/10 border border-blue-500/20">
            <div className="text-sm text-blue-300">En attente de vente</div>
            <div className="text-xs text-gray-500 mt-1">Valeur: {formatPrice(sneaker.buyPrice)}</div>
          </div>
        )}
      </div>
    </div>
  )
}
