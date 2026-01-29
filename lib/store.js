// Store et gestion des données (localStorage)

const STORAGE_KEY = 'sneakstock_data'

// Structure de données par défaut
const DEFAULT_DATA = {
  sneakers: [],
  sales: [],
  expenses: [],
  settings: {
    currency: 'EUR',
    defaultPlatform: 'StockX',
  }
}

// Catégories de dépenses
export const EXPENSE_CATEGORIES = [
  'Shipping',
  'Packaging',
  'Outils / Bots',
  'Abonnements',
  'Publicité',
  'Transport',
  'Autre',
]

// Charger les données
export function loadData() {
  if (typeof window === 'undefined') return DEFAULT_DATA

  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      console.error('Erreur chargement données:', e)
      return DEFAULT_DATA
    }
  }
  return DEFAULT_DATA
}

// Sauvegarder les données
export function saveData(data) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// Générer un ID unique
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Formater le prix
export function formatPrice(price, currency = 'EUR') {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

// Formater la date
export function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// Calculer les stats globales
export function calculateStats(sneakers) {
  const inStock = sneakers.filter(s => s.status === 'stock')
  const sold = sneakers.filter(s => s.status === 'sold')

  const totalInvested = sneakers.reduce((sum, s) => sum + s.buyPrice, 0)
  const totalSold = sold.reduce((sum, s) => sum + (s.sellPrice || 0), 0)
  const totalProfit = sold.reduce((sum, s) => sum + ((s.sellPrice || 0) - s.buyPrice - (s.fees || 0)), 0)
  const stockValue = inStock.reduce((sum, s) => sum + s.buyPrice, 0)

  // Durée moyenne en stock (jours entre achat et vente)
  let avgStockDuration = 0
  const soldWithDates = sold.filter(s => s.buyDate && s.sellDate)
  if (soldWithDates.length > 0) {
    const totalDays = soldWithDates.reduce((sum, s) => {
      const buyDate = new Date(s.buyDate)
      const sellDate = new Date(s.sellDate)
      const days = Math.max(0, Math.floor((sellDate - buyDate) / (1000 * 60 * 60 * 24)))
      return sum + days
    }, 0)
    avgStockDuration = Math.round(totalDays / soldWithDates.length)
  }

  // Rotation des ventes (ventes par mois sur les 30 derniers jours)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentSales = sold.filter(s => s.sellDate && new Date(s.sellDate) >= thirtyDaysAgo)
  const salesRotation = recentSales.length

  // Stats par marque
  const brandStats = {}
  sneakers.forEach(s => {
    if (!brandStats[s.brand]) {
      brandStats[s.brand] = { count: 0, profit: 0 }
    }
    brandStats[s.brand].count++
    if (s.status === 'sold') {
      brandStats[s.brand].profit += (s.sellPrice || 0) - s.buyPrice - (s.fees || 0)
    }
  })

  // Stats par mois
  const monthlyStats = {}
  sold.forEach(s => {
    const month = new Date(s.sellDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    if (!monthlyStats[month]) {
      monthlyStats[month] = { revenue: 0, profit: 0, count: 0 }
    }
    monthlyStats[month].revenue += s.sellPrice || 0
    monthlyStats[month].profit += (s.sellPrice || 0) - s.buyPrice - (s.fees || 0)
    monthlyStats[month].count++
  })

  return {
    totalPairs: sneakers.length,
    inStockCount: inStock.length,
    soldCount: sold.length,
    totalInvested,
    totalSold,
    totalProfit,
    stockValue,
    avgProfit: sold.length > 0 ? totalProfit / sold.length : 0,
    avgStockDuration,
    salesRotation,
    brandStats,
    monthlyStats,
  }
}

// Marques populaires
export const POPULAR_BRANDS = [
  'Nike',
  'Jordan',
  'Adidas',
  'Yeezy',
  'New Balance',
  'Puma',
  'Asics',
  'Converse',
  'Vans',
  'Reebok',
  'Salomon',
  'Saucony',
  'Hoka',
  'On Running',
  'UGG',
  'Autres',
]

// Plateformes d'achat
export const BUY_PLATFORMS = [
  'Adidas',
  'BSTN',
  'Confirmed',
  'Courir',
  'Foot District',
  'Footlocker',
  'Galeries Lafayette',
  'GOAT',
  'Instore',
  'JD Sports',
  'Kith',
  'NAKED',
  'Nike',
  'Offspring',
  'Patta',
  'Restocks',
  'Shoe Chapter',
  'Site Officiel',
  'Size?',
  'SneakerBAAS',
  'Snipes',
  'SNKRS',
  'SNS',
  'Solebox',
  'Starcow',
  'StockX',
  'Supreme',
  'Undefeated',
  'Wethenew',
  'Zalando',
  'Autre',
]

// Plateformes de vente
export const PLATFORMS = [
  'StockX',
  'Vinted',
  'Leboncoin',
  'eBay',
  'Restocks',
  'Wethenew',
  'GOAT',
  'Alias',
  'Depop',
  'Direct',
  'Autre',
]

// Statuts de paiement
export const PAYMENT_STATUS = [
  { value: 'received', label: 'Reçu', color: 'emerald' },
  { value: 'pending', label: 'En attente', color: 'yellow' },
]

// Statuts de livraison
export const DELIVERY_STATUS = [
  { value: 'delivered', label: 'Livré', color: 'emerald' },
  { value: 'shipped', label: 'Expédié', color: 'blue' },
  { value: 'pending', label: 'À expédier', color: 'yellow' },
]

// Tailles EU Standard (Nike, Jordan, Asics, Puma)
export const SIZES_EU = [
  'Unique',
  '35.5', '36', '36.5', '37.5', '38', '38.5', '39', '40', '40.5', '41',
  '42', '42.5', '43', '44', '44.5', '45', '45.5', '46', '47', '47.5', '48', '48.5', '49.5',
]

// Tailles Adidas (système 1/3 et 2/3)
export const SIZES_ADIDAS = [
  'Unique',
  '36', '36 2/3', '37 1/3', '38', '38 2/3', '39 1/3', '40', '40 2/3', '41 1/3',
  '42', '42 2/3', '43 1/3', '44', '44 2/3', '45 1/3', '46', '46 2/3', '47 1/3', '48', '48 2/3', '49 1/3', '50',
]

// Tailles New Balance (demi-pointures)
export const SIZES_NEW_BALANCE = [
  'Unique',
  '36', '36.5', '37', '37.5', '38', '38.5', '39', '39.5', '40', '40.5',
  '41', '41.5', '42', '42.5', '43', '44', '44.5', '45', '45.5', '46', '46.5', '47', '47.5', '48', '49', '50',
]

// Tailles vêtements
export const SIZES_CLOTHING = [
  'Unique',
  'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
]

// Catégories de produits
export const CATEGORIES = [
  { value: 'sneakers', label: 'Sneakers' },
  { value: 'clothing', label: 'Vêtements' },
]

// Fonction pour obtenir les tailles selon la marque et la catégorie
export function getSizesForBrand(brand, category) {
  if (category === 'clothing') {
    return SIZES_CLOTHING
  }
  const brandLower = brand?.toLowerCase() || ''
  if (brandLower === 'adidas' || brandLower === 'yeezy') {
    return SIZES_ADIDAS
  }
  if (brandLower === 'new balance') {
    return SIZES_NEW_BALANCE
  }
  return SIZES_EU
}

// États
export const CONDITIONS = [
  { value: 'new', label: 'Neuf (DS)', color: 'emerald' },
  { value: 'like_new', label: 'Comme neuf', color: 'green' },
  { value: 'very_good', label: 'Très bon', color: 'blue' },
  { value: 'good', label: 'Bon', color: 'yellow' },
  { value: 'worn', label: 'Usé', color: 'orange' },
]

// Export CSV
export function exportToCSV(sneakers, type = 'all') {
  let data = sneakers

  // Filtrer selon le type
  if (type === 'stock') {
    data = sneakers.filter(s => s.status === 'stock')
  } else if (type === 'sold') {
    data = sneakers.filter(s => s.status === 'sold')
  }

  // En-têtes CSV
  const headers = [
    'Nom',
    'Marque',
    'SKU',
    'Taille',
    'État',
    'Statut',
    'Prix d\'achat',
    'Date d\'achat',
    'Plateforme d\'achat',
    'Prix de vente',
    'Date de vente',
    'Plateforme de vente',
    'Frais',
    'Profit',
    'ROI (%)',
    'Notes'
  ]

  // Convertir les données
  const rows = data.map(s => {
    const profit = s.status === 'sold' ? (s.sellPrice || 0) - s.buyPrice - (s.fees || 0) : ''
    const roi = s.status === 'sold' && s.buyPrice > 0 ? ((profit / s.buyPrice) * 100).toFixed(1) : ''

    return [
      s.name || '',
      s.brand || '',
      s.sku || '',
      s.size || '',
      s.condition || '',
      s.status === 'sold' ? 'Vendu' : 'En stock',
      s.buyPrice || '',
      s.buyDate || '',
      s.buyPlatform || '',
      s.sellPrice || '',
      s.sellDate || '',
      s.sellPlatform || '',
      s.fees || '',
      profit,
      roi,
      s.notes || ''
    ]
  })

  // Créer le contenu CSV
  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
  ].join('\n')

  // Ajouter BOM pour Excel
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

  // Télécharger
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  const filename = `onestock_${type}_${new Date().toISOString().split('T')[0]}.csv`

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
