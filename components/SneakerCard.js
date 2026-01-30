import { Edit, Trash2, Truck, CheckCircle, CreditCard, Package, DollarSign } from 'lucide-react'
import { formatPrice } from '../lib/store'
import { useLanguage } from '../contexts/LanguageContext'

export default function SneakerCard({ sneaker, onEdit, onDelete, onToggle, onSell }) {
  const { t, language } = useLanguage()
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
    <div className="group relative bg-gradient-to-br from-dark-800/90 via-dark-800 to-dark-900/90 border-2 border-blue-500/30 rounded-2xl overflow-hidden hover:border-cyan-400/60 hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 w-full max-w-[280px] hover:scale-[1.02]">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-white flex items-center justify-center overflow-hidden">
        {sneaker.imageUrl ? (
          <img
            src={sneaker.imageUrl}
            alt={sneaker.name}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-5xl">👟</div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Actions */}
        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={() => onEdit(sneaker)}
            className="p-2 bg-black/80 backdrop-blur-sm rounded-lg text-white hover:bg-blue-500 hover:scale-110 transition-all duration-200 shadow-lg"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(sneaker.id)}
            className="p-2 bg-black/80 backdrop-blur-sm rounded-lg text-white hover:bg-red-500 hover:scale-110 transition-all duration-200 shadow-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div>
          <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
            {sneaker.name}
          </h3>
          <p className="text-xs text-gray-400 truncate mt-1">
            <span className="font-medium">{sneaker.size}</span> • {sneaker.sku || 'N/A'}
          </p>
        </div>

        {/* Prix avec design amélioré */}
        <div className="flex justify-between items-center p-2 bg-dark-900/50 rounded-lg border border-gray-700/50">
          <div className="text-left">
            <div className="text-xs text-gray-500">{t('card.buy')}</div>
            <div className="text-xs font-semibold text-gray-300">{formatPrice(sneaker.buyPrice)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">{t('card.sell')}</div>
            <div className="text-xs font-bold text-cyan-400">
              {sneaker.sellPrice ? formatPrice(sneaker.sellPrice) : '—'}
            </div>
          </div>
        </div>

        {/* Profit pour les vendus */}
        {sneaker.status === 'sold' && profit !== null && (
          <div className={`py-2 px-3 rounded-lg text-center font-bold shadow-md ${
            profit >= 0
              ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-400 border border-cyan-500/30'
              : 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400 border border-red-500/30'
          }`}>
            <div className="text-xs text-gray-400 mb-1">{t('card.profit')}</div>
            <div className="text-sm">
              {profit >= 0 ? '+' : ''}{formatPrice(profit)}
            </div>
          </div>
        )}

        {/* Toggles pour vendus */}
        {sneaker.status === 'sold' && (
          <div className="flex gap-2">
            <button
              onClick={handleTogglePayment}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg font-semibold text-xs transition-all duration-200 active:scale-95 shadow-md ${
                sneaker.paymentStatus === 'received'
                  ? 'bg-gradient-to-r from-emerald-500/30 to-emerald-600/30 text-emerald-300 border-2 border-emerald-500/50 hover:border-emerald-400'
                  : 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border-2 border-yellow-500/40 hover:border-yellow-400'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">{sneaker.paymentStatus === 'received' ? t('card.paid') : t('card.waiting')}</span>
            </button>
            <button
              onClick={handleToggleDelivery}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg font-semibold text-xs transition-all duration-200 active:scale-95 shadow-md ${
                sneaker.deliveryStatus === 'delivered'
                  ? 'bg-gradient-to-r from-emerald-500/30 to-emerald-600/30 text-emerald-300 border-2 border-emerald-500/50 hover:border-emerald-400'
                  : 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border-2 border-yellow-500/40 hover:border-yellow-400'
              }`}
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">{sneaker.deliveryStatus === 'delivered' ? t('card.shipped') : t('card.shipping')}</span>
            </button>
          </div>
        )}

        {/* Boutons pour stock */}
        {sneaker.status === 'stock' && (
          <div className="flex gap-2">
            <button
              onClick={handleToggleReceived}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 shadow-md ${
                sneaker.itemReceived
                  ? 'bg-gradient-to-r from-emerald-500/30 to-emerald-600/30 text-emerald-300 border-2 border-emerald-500/50 hover:border-emerald-400'
                  : 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-300 border-2 border-amber-500/50 hover:border-amber-400'
              }`}
            >
              {sneaker.itemReceived ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('card.received')}</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('card.inTransit')}</span>
                </>
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (onSell) onSell(sneaker)
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 shadow-md bg-gradient-to-r from-cyan-600 to-cyan-500 text-white border-2 border-cyan-500/50 hover:border-cyan-400"
            >
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Vendre' : 'Sell'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
