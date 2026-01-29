import { Edit, Trash2, Truck, CheckCircle, CreditCard, Package } from 'lucide-react'
import { formatPrice } from '../lib/store'

export default function SneakerCard({ sneaker, onEdit, onDelete, onToggle }) {
  const profit = sneaker.status === 'sold' && sneaker.sellPrice
    ? sneaker.sellPrice - sneaker.buyPrice - (sneaker.fees || 0)
    : null

  const handleToggleReceived = (e) => {
    e.stopPropagation()
    if (onToggle) onToggle(sneaker.id, { itemReceived: !sneaker.itemReceived })
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
    <div className="group relative bg-dark-800 border border-blue-500/20 rounded-xl overflow-hidden hover:border-cyan-500/40 transition-all w-full max-w-[240px]">
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
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] font-bold ${
          sneaker.status === 'sold' ? 'bg-cyan-500 text-black' : 'bg-blue-500 text-white'
        }`}>
          {sneaker.status === 'sold' ? 'VENDU' : 'STOCK'}
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
        <p className="text-xs text-gray-400 truncate">{sneaker.size} • {sneaker.sku || 'N/A'}</p>

        {/* Prix */}
        <div className="flex justify-between items-center mt-2 text-sm">
          <span className="text-gray-400">{formatPrice(sneaker.buyPrice)}</span>
          <span className="text-cyan-400 font-semibold">
            {sneaker.sellPrice ? formatPrice(sneaker.sellPrice) : '—'}
          </span>
        </div>

        {/* Profit pour les vendus */}
        {sneaker.status === 'sold' && profit !== null && (
          <div className={`mt-2 py-1.5 rounded-lg text-center text-sm font-bold ${
            profit >= 0 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {profit >= 0 ? '+' : ''}{formatPrice(profit)}
          </div>
        )}

        {/* Toggles pour vendus - Paiement & Livraison */}
        {sneaker.status === 'sold' && (
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
        )}

        {/* Toggle pour stock - Réception */}
        {sneaker.status === 'stock' && (
          <button
            onClick={handleToggleReceived}
            className={`w-full mt-2 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              sneaker.itemReceived
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {sneaker.itemReceived ? (
              <><CheckCircle className="w-3.5 h-3.5" /> Reçu</>
            ) : (
              <><Truck className="w-3.5 h-3.5" /> En transit</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
