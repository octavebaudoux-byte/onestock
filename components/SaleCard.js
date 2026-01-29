import { Edit, Trash2, CreditCard, Package } from 'lucide-react'
import { formatPrice } from '../lib/store'

export default function SaleCard({ sneaker, onEdit, onDelete, onToggle }) {
  const profit = (sneaker.sellPrice || 0) - sneaker.buyPrice - (sneaker.fees || 0)
  const roi = sneaker.buyPrice > 0 ? (profit / sneaker.buyPrice) * 100 : 0

  const formatSellDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  }

  const handleTogglePayment = (e) => {
    e.stopPropagation()
    if (onToggle) onToggle(sneaker.id, {
      paymentStatus: sneaker.paymentStatus === 'received' ? 'pending' : 'received'
    })
  }

  const handleToggleDelivery = (e) => {
    e.stopPropagation()
    if (onToggle) onToggle(sneaker.id, {
      deliveryStatus: sneaker.deliveryStatus === 'delivered' ? 'pending' : 'delivered'
    })
  }

  return (
    <div className="group relative bg-dark-800 border border-cyan-500/30 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all w-full max-w-[240px]">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-white flex items-center justify-center">
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
        <div className="absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] font-bold bg-cyan-500 text-black">
          VENDU
        </div>

        {/* Actions */}
        <div className="absolute top-2 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(sneaker)} className="p-1.5 bg-black/70 rounded-md text-white hover:bg-blue-500 transition-colors">
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(sneaker.id)} className="p-1.5 bg-black/70 rounded-md text-white hover:bg-red-500 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-white truncate">{sneaker.name}</h3>
        <p className="text-xs text-gray-400">{sneaker.size} • {formatSellDate(sneaker.sellDate)}</p>

        {/* Profit */}
        <div className={`mt-2 py-2 rounded-lg text-center ${
          profit >= 0 ? 'bg-cyan-500/20' : 'bg-red-500/20'
        }`}>
          <div className={`text-sm font-bold ${profit >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
            {profit >= 0 ? '+' : ''}{formatPrice(profit)}
          </div>
          <div className={`text-[10px] ${profit >= 0 ? 'text-cyan-400/70' : 'text-red-400/70'}`}>
            {roi >= 0 ? '+' : ''}{roi.toFixed(0)}% ROI
          </div>
        </div>

        {/* Toggles cliquables */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleTogglePayment}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              sneaker.paymentStatus === 'received'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            {sneaker.paymentStatus === 'received' ? 'Payé' : 'Attente'}
          </button>
          <button
            onClick={handleToggleDelivery}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              sneaker.deliveryStatus === 'delivered'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            {sneaker.deliveryStatus === 'delivered' ? 'Livré' : 'Envoi'}
          </button>
        </div>
      </div>
    </div>
  )
}
