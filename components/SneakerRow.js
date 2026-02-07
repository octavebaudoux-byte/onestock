import { Edit, Trash2, Truck, CheckCircle, CreditCard, Package, DollarSign, Receipt, Eye } from 'lucide-react'
import { formatPrice } from '../lib/store'
import { useLanguage } from '../contexts/LanguageContext'

export default function SneakerRow({ sneaker, onEdit, onDelete, onToggle, onSell, instanceIndex = 0 }) {
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

  const buyDate = sneaker.buyDate ? new Date(sneaker.buyDate).toLocaleDateString('fr-FR') : '—'
  const sellDate = sneaker.sellDate ? new Date(sneaker.sellDate).toLocaleDateString('fr-FR') : null

  return (
    <div className="group flex items-center gap-2 md:gap-4 px-2 md:px-4 py-2 md:py-3 bg-dark-800/60 hover:bg-dark-700/80 border border-blue-500/10 hover:border-cyan-400/30 rounded-lg md:rounded-xl transition-all duration-200">
      {/* Image miniature */}
      <div className="shrink-0 w-10 h-10 md:w-14 md:h-14 rounded-lg bg-white/90 flex items-center justify-center overflow-hidden">
        {sneaker.imageUrl ? (
          <img src={sneaker.imageUrl} alt={sneaker.name} className="w-full h-full object-contain p-0.5" />
        ) : (
          <span className="text-lg md:text-2xl">👟</span>
        )}
      </div>

      {/* Infos principales */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs md:text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
            {sneaker.name}
          </h3>
          {sneaker.quantity > 1 && (
            <span className="shrink-0 bg-blue-600 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              x{sneaker.quantity}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 md:gap-3 mt-0.5">
          <span className="text-[10px] md:text-xs text-gray-400 font-medium">{sneaker.size}</span>
          {sneaker.sku && <span className="text-[10px] md:text-xs text-gray-500 hidden md:inline">{sneaker.sku}</span>}
          {sneaker.brand && <span className="text-[10px] md:text-xs text-blue-400/60">{sneaker.brand}</span>}
        </div>
      </div>

      {/* Prix achat */}
      <div className="shrink-0 text-right hidden md:block">
        <div className="text-[10px] text-gray-500">{t('card.buy')}</div>
        <div className="text-xs font-semibold text-gray-300">{formatPrice(sneaker.buyPrice)}</div>
      </div>

      {/* Prix vente */}
      <div className="shrink-0 text-right">
        <div className="text-[10px] text-gray-500">{sneaker.status === 'sold' ? t('card.sell') : t('card.buy')}</div>
        <div className="text-xs font-bold text-white">
          {sneaker.status === 'sold' && sneaker.sellPrice
            ? formatPrice(sneaker.sellPrice)
            : formatPrice(sneaker.buyPrice)
          }
        </div>
      </div>

      {/* Profit */}
      <div className="shrink-0 text-right min-w-[60px] md:min-w-[80px]">
        {sneaker.status === 'sold' && profit !== null ? (
          <div className={`text-xs md:text-sm font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {profit >= 0 ? '+' : ''}{formatPrice(profit)}
          </div>
        ) : (
          <div className="text-xs text-gray-500">—</div>
        )}
      </div>

      {/* Date */}
      <div className="shrink-0 text-right hidden md:block">
        <div className="text-[10px] text-gray-500">{sellDate ? sellDate : buyDate}</div>
      </div>

      {/* Badges cashback / invoice */}
      <div className="shrink-0 flex items-center gap-1 hidden lg:flex">
        {sneaker.cashbackStatus && sneaker.cashbackStatus !== 'none' && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            sneaker.cashbackStatus === 'received' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            💸
          </span>
        )}
        {sneaker.hasInvoice && sneaker.status === 'sold' && (
          <Receipt className="w-3.5 h-3.5 text-blue-400" />
        )}
      </div>

      {/* Toggles */}
      <div className="shrink-0 flex items-center gap-1">
        {sneaker.status === 'sold' ? (
          <>
            <button onClick={handleTogglePayment} className={`p-1.5 rounded-lg transition-all ${
              sneaker.paymentStatus === 'received' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/15 text-yellow-400'
            }`}>
              <CreditCard className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleToggleDelivery} className={`p-1.5 rounded-lg transition-all ${
              sneaker.deliveryStatus === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/15 text-yellow-400'
            }`}>
              <Package className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <button onClick={handleToggleReceived} className={`p-1.5 rounded-lg transition-all ${
              sneaker.itemReceived ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
            }`}>
              {sneaker.itemReceived ? <CheckCircle className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); if (onSell) onSell(sneaker) }}
              className="p-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 hover:bg-cyan-500/30 transition-all"
            >
              <DollarSign className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Actions edit/delete */}
      <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(sneaker)} className="p-1.5 rounded-lg hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-all">
          <Edit className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onDelete(sneaker.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}