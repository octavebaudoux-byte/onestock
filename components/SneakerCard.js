import { Edit, Trash2 } from 'lucide-react'
import { formatPrice } from '../lib/store'

export default function SneakerCard({ sneaker, onEdit, onDelete }) {
  const profit = sneaker.status === 'sold' && sneaker.sellPrice
    ? sneaker.sellPrice - sneaker.buyPrice - (sneaker.fees || 0)
    : null

  return (
    <div className="group relative bg-dark-800 border border-blue-500/20 rounded-xl overflow-hidden hover:border-cyan-500/40 transition-all w-full max-w-[220px]">
      {/* Image */}
      <div className="relative aspect-square bg-white flex items-center justify-center">
        {sneaker.imageUrl ? (
          <img
            src={sneaker.imageUrl}
            alt={sneaker.name}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <div className="text-4xl">👟</div>
        )}

        {/* Badge */}
        <div className={`absolute top-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
          sneaker.status === 'sold' ? 'bg-cyan-500 text-black' : 'bg-blue-500 text-white'
        }`}>
          {sneaker.status === 'sold' ? 'VENDU' : 'STOCK'}
        </div>

        {/* Actions */}
        <div className="absolute top-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(sneaker)} className="p-1 bg-black/70 rounded text-white hover:bg-blue-500 text-xs">
            <Edit className="w-3 h-3" />
          </button>
          <button onClick={() => onDelete(sneaker.id)} className="p-1 bg-black/70 rounded text-white hover:bg-red-500 text-xs">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-2">
        <h3 className="text-xs font-medium text-white truncate">{sneaker.name}</h3>
        <p className="text-[10px] text-gray-400 truncate">{sneaker.size} • {sneaker.sku || 'N/A'}</p>

        {/* Prix */}
        <div className="flex justify-between items-center mt-1.5 text-[11px]">
          <span className="text-gray-400">{formatPrice(sneaker.buyPrice)}</span>
          <span className="text-cyan-400 font-medium">
            {sneaker.sellPrice ? formatPrice(sneaker.sellPrice) : '—'}
          </span>
        </div>

        {/* Profit pour les vendus */}
        {sneaker.status === 'sold' && profit !== null && (
          <div className={`mt-1.5 py-1 rounded text-center text-xs font-bold ${
            profit >= 0 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {profit >= 0 ? '+' : ''}{formatPrice(profit)}
          </div>
        )}

        {/* Statuts pour vendus */}
        {sneaker.status === 'sold' && (
          <div className="flex gap-1 mt-1.5">
            <span className={`flex-1 text-center py-0.5 rounded text-[9px] ${
              sneaker.paymentStatus === 'received' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {sneaker.paymentStatus === 'received' ? '💰' : '⏳'}
            </span>
            <span className={`flex-1 text-center py-0.5 rounded text-[9px] ${
              sneaker.deliveryStatus === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {sneaker.deliveryStatus === 'delivered' ? '✅' : '📦'}
            </span>
          </div>
        )}

        {/* Statut livraison pour stock */}
        {sneaker.status === 'stock' && (
          <div className={`mt-1.5 py-1 rounded text-center text-[10px] font-medium ${
            sneaker.itemReceived ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            {sneaker.itemReceived ? '✅ Reçu' : '🚚 En transit'}
          </div>
        )}
      </div>
    </div>
  )
}
