import { Edit, Trash2 } from 'lucide-react'
import { formatPrice } from '../lib/store'

export default function SaleCard({ sneaker, onEdit, onDelete }) {
  const profit = (sneaker.sellPrice || 0) - sneaker.buyPrice - (sneaker.fees || 0)
  const roi = sneaker.buyPrice > 0 ? (profit / sneaker.buyPrice) * 100 : 0

  const formatSellDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  }

  return (
    <div className="group relative bg-dark-800 border border-cyan-500/30 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all w-full max-w-[220px]">
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
        <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500 text-black">
          VENDU
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
        <p className="text-[10px] text-gray-400">{sneaker.size} • {formatSellDate(sneaker.sellDate)}</p>

        {/* Profit */}
        <div className={`mt-1.5 py-1.5 rounded text-center ${
          profit >= 0 ? 'bg-cyan-500/20' : 'bg-red-500/20'
        }`}>
          <div className={`text-sm font-bold ${profit >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
            {profit >= 0 ? '+' : ''}{formatPrice(profit)}
          </div>
          <div className={`text-[9px] ${profit >= 0 ? 'text-cyan-400/70' : 'text-red-400/70'}`}>
            {roi >= 0 ? '+' : ''}{roi.toFixed(0)}% ROI
          </div>
        </div>

        {/* Statuts */}
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
      </div>
    </div>
  )
}
