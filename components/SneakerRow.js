import { Edit, Trash2, Truck, CheckCircle, CreditCard, Package, DollarSign } from 'lucide-react'
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
    <div className="group flex items-center gap-1.5 md:gap-3 px-2 md:px-3 py-1.5 md:py-2.5 bg-dark-800/60 hover:bg-dark-700/80 border border-blue-500/10 hover:border-cyan-400/30 rounded-lg md:rounded-xl transition-all duration-200">
      {/* Image */}
      <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-white/90 flex items-center justify-center overflow-hidden">
        {sneaker.imageUrl ? (
          <img src={sneaker.imageUrl} alt={sneaker.name} className="w-full h-full object-contain p-0.5" />
        ) : (
          <span className="text-lg md:text-xl">👟</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs md:text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
            {sneaker.name}
          </h3>
          {sneaker.quantity > 1 && (
            <span className="shrink-0 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              x{sneaker.quantity}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] md:text-xs text-gray-400 font-medium">{sneaker.size}</span>
          {sneaker.sku && <span className="text-[10px] md:text-xs text-gray-500 font-mono hidden md:inline">{sneaker.sku}</span>}
          {sneaker.brand && <span className="text-[10px] md:text-xs text-blue-400/70">{sneaker.brand}</span>}
        </div>
      </div>

      {/* Platforms */}
      {sneaker.status === 'stock' && sneaker.listedOnPlatforms && sneaker.listedOnPlatforms.length > 0 && (
        <div className="shrink-0 hidden md:flex items-center gap-0.5">
          {sneaker.listedOnPlatforms.map((platform, idx) => (
            <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-blue-500/15 border border-blue-500/30 rounded-md text-blue-300 font-semibold">
              {platform}
            </span>
          ))}
        </div>
      )}

      {/* Prices - compact block */}
      <div className="shrink-0 flex items-center gap-2 md:gap-3">
        {/* Buy price - desktop only */}
        <div className="hidden md:block text-right">
          <div className="text-[9px] uppercase tracking-wider text-gray-500 font-medium">{t('card.buy')}</div>
          <div className="text-xs font-semibold text-gray-300">{formatPrice(sneaker.buyPrice)}</div>
        </div>

        {/* Sell / target price */}
        <div className="text-right">
          <div className="text-[9px] uppercase tracking-wider text-gray-500 font-medium">
            {sneaker.status === 'sold' ? t('card.sell') : sneaker.targetSellPrice ? (language === 'fr' ? 'Cible' : 'Target') : t('card.buy')}
          </div>
          <div className={`text-xs font-bold ${sneaker.status === 'sold' ? 'text-cyan-400' : sneaker.targetSellPrice ? 'text-purple-400' : 'text-white'}`}>
            {sneaker.status === 'sold' && sneaker.sellPrice
              ? formatPrice(sneaker.sellPrice)
              : sneaker.targetSellPrice
                ? formatPrice(sneaker.targetSellPrice)
                : formatPrice(sneaker.buyPrice)
            }
          </div>
        </div>

        {/* Profit */}
        <div className="text-right min-w-[50px] md:min-w-[65px]">
          {sneaker.status === 'sold' && profit !== null ? (
            <div className={`text-xs md:text-sm font-black ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {profit >= 0 ? '+' : ''}{formatPrice(profit)}
            </div>
          ) : sneaker.status === 'stock' && sneaker.targetSellPrice ? (
            <div className="text-xs font-bold text-purple-400/70">
              ~{formatPrice(sneaker.targetSellPrice - sneaker.buyPrice - (sneaker.buyPrice * 0.10))}
            </div>
          ) : (
            <div className="text-xs text-gray-600">—</div>
          )}
        </div>
      </div>

      {/* Date - desktop */}
      <div className="shrink-0 text-right hidden md:block min-w-[65px]">
        <div className="text-[10px] text-gray-500">{sellDate ? sellDate : buyDate}</div>
      </div>

      {/* Toggles */}
      <div className="shrink-0 flex items-center gap-0.5">
        {sneaker.status === 'sold' ? (
          <>
            <button onClick={handleTogglePayment} title={language === 'fr' ? 'Paiement' : 'Payment'} className={`p-1.5 md:p-2 rounded-lg transition-all ${
              sneaker.paymentStatus === 'received'
                ? 'bg-emerald-500/20 text-emerald-400 shadow-sm shadow-emerald-500/10'
                : 'bg-amber-500/15 text-amber-400 animate-pulse'
            }`}>
              <CreditCard className="w-4 h-4" />
            </button>
            <button onClick={handleToggleDelivery} title={language === 'fr' ? 'Livraison' : 'Delivery'} className={`p-1.5 md:p-2 rounded-lg transition-all ${
              sneaker.deliveryStatus === 'delivered'
                ? 'bg-emerald-500/20 text-emerald-400 shadow-sm shadow-emerald-500/10'
                : 'bg-amber-500/15 text-amber-400 animate-pulse'
            }`}>
              <Package className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button onClick={handleToggleReceived} title={sneaker.itemReceived ? (language === 'fr' ? 'Reçu' : 'Received') : (language === 'fr' ? 'En attente' : 'Pending')} className={`p-1.5 md:p-2 rounded-lg transition-all ${
              sneaker.itemReceived
                ? 'bg-emerald-500/20 text-emerald-400 shadow-sm shadow-emerald-500/10'
                : 'bg-amber-500/15 text-amber-400 animate-pulse'
            }`}>
              {sneaker.itemReceived ? <CheckCircle className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); if (onSell) onSell(sneaker) }}
              title={language === 'fr' ? 'Vendre' : 'Sell'}
              className="p-1.5 md:p-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 shadow-sm shadow-cyan-500/10 transition-all"
            >
              <DollarSign className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Edit/Delete */}
      <div className="shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(sneaker)} title={language === 'fr' ? 'Modifier' : 'Edit'} className="p-1.5 md:p-2 rounded-lg hover:bg-blue-500/20 text-gray-500 hover:text-blue-400 transition-all">
          <Edit className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(sneaker.id)} title={language === 'fr' ? 'Supprimer' : 'Delete'} className="p-1.5 md:p-2 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}