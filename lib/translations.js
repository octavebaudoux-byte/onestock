// Traductions FR/EN
export const translations = {
  fr: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      inventory: 'Inventaire',
      sales: 'Ventes',
      expenses: 'Dépenses',
      stats: 'Stats',
      settings: 'Paramètres',
    },

    // Actions
    actions: {
      add: 'Ajouter',
      addToStock: 'Ajouter au stock',
      recordSale: 'Enregistrer une vente',
      export: 'Exporter CSV',
      edit: 'Modifier',
      delete: 'Supprimer',
      cancel: 'Annuler',
      save: 'Enregistrer',
      search: 'Rechercher',
      filter: 'Filtrer',
      sort: 'Trier',
    },

    // Dashboard
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Vue d\'ensemble de ton stock et tes performances',
      pairsInStock: 'Paires en stock',
      stockValue: 'Valeur du stock',
      netProfit: 'Profit net',
      avgProfit: 'Profit moyen',
      total: 'au total',
      invested: 'investi',
      sales: 'ventes',
      fees: 'frais',
      perPair: 'par paire vendue',
      latestAdditions: 'Derniers ajouts',
      latestSales: 'Dernières ventes',
      performance: 'Performance par marque',
      pairs: 'paires',
      noPairs: 'Aucune paire dans ton stock',
      startTracking: 'Commence à tracker tes sneakers !',
      addFirst: 'Ajouter ta première paire',
      viewAll: 'Voir tout',
      deleteConfirm: 'Supprimer cette paire ?',
    },

    // Expenses
    expenses: {
      title: 'Dépenses',
      subtitle: 'Suivi de tes frais et dépenses',
      add: 'Ajouter',
      thisMonth: 'Ce mois',
      totalGlobal: 'Total global',
      filtered: 'Filtré',
      expensesCount: 'dépenses',
      new: 'Nouvelle dépense',
      edit: 'Modifier',
      name: 'Nom',
      amount: 'Montant (€)',
      date: 'Date',
      category: 'Catégorie',
      notes: 'Notes',
      cancel: 'Annuler',
      save: 'Ajouter',
      update: 'Modifier',
      allMonths: 'Tous les mois',
      allCategories: 'Toutes catégories',
      noExpenses: 'Aucune dépense enregistrée',
      addExpense: 'Ajouter une dépense',
      deleteConfirm: 'Supprimer cette dépense ?',
      namePlaceholder: 'Ex: Frais d\'envoi StockX',
      notesPlaceholder: 'Détails optionnels...',
    },

    // Inventory
    inventory: {
      title: 'Inventaire',
      inStock: 'en stock',
      sold: 'vendues',
      value: 'de valeur',
      searchPlaceholder: 'Rechercher...',
      allStatuses: 'Tous les statuts',
      allBrands: 'Toutes les marques',
      sortRecent: 'Plus récent',
      sortName: 'Nom A-Z',
      sortPriceAsc: 'Prix croissant',
      sortPriceDesc: 'Prix décroissant',
      sortProfit: 'Meilleur profit',
      results: 'résultat',
      resultsPlural: 'résultats',
      noPairs: 'Aucune paire trouvée',
      tryFilters: 'Essaie de modifier tes filtres',
      addFirst: 'Ajoute ta première paire pour commencer',
    },

    // Modal
    modal: {
      addInventory: 'Ajouter à l\'inventaire',
      recordSale: 'Enregistrer une vente',
      editPair: 'Modifier la paire',
      searchPair: 'Rechercher une paire',
      searchPlaceholder: 'Tape un nom ou SKU (ex: Jordan 1 Chicago, DZ5485)...',
      noResults: 'Aucun résultat pour',
      name: 'Nom du modèle',
      sku: 'SKU / Référence',
      category: 'Catégorie',
      brand: 'Marque',
      size: 'Taille',
      condition: 'État',
      select: 'Sélectionner',
      purchase: 'Achat',
      buyPrice: 'Prix d\'achat',
      buyDate: 'Date d\'achat',
      buyPlatform: 'Plateforme d\'achat',
      sale: 'Vente',
      sellPrice: 'Prix de vente',
      sellDate: 'Date de vente',
      sellPlatform: 'Plateforme de vente',
      fees: 'Frais (plateforme, envoi)',
      profit: 'Profit estimé',
      notes: 'Notes',
      notesPlaceholder: 'Infos supplémentaires...',
      received: 'Livré',
      inTransit: 'En cours de livraison',
      paymentReceived: 'Paiement reçu',
      paymentPending: 'Paiement en attente',
      packageDelivered: 'Colis livré',
      packagePending: 'Colis en attente',
      invoice: 'Facture / Preuve de vente (URL)',
      invoicePlaceholder: 'https://... (lien vers la facture)',
      invoiceView: 'Voir',
      invoiceHelp: 'Lien vers Google Drive, Dropbox, ou autre hébergement',
    },

    // Card
    card: {
      buy: 'Achat',
      sell: 'Vente',
      profit: 'Profit',
      paid: 'Payé',
      waiting: 'Attente',
      shipped: 'Expédié',
      shipping: 'En cours d\'expédition',
      received: 'Article reçu',
      inTransit: 'En transit',
      stock: 'STOCK',
      sold: 'VENDU',
    },

    // Status
    status: {
      new: 'Neuf (DS)',
      likeNew: 'Comme neuf',
      veryGood: 'Très bon',
      good: 'Bon',
      worn: 'Usé',
    },

    // Categories
    categories: {
      sneakers: 'Sneakers',
      clothing: 'Vêtements',
    },

    // Settings
    settings: {
      title: 'Paramètres',
      language: 'Langue',
      french: 'Français',
      english: 'English',
      theme: 'Thème',
      currency: 'Devise',
      notifications: 'Notifications',
    },

    // Sales
    sales: {
      title: 'Ventes',
      subtitle: 'Historique et analyse de tes ventes',
      salesCount: 'Ventes',
      pairsSold: 'paires vendues',
      revenue: 'Chiffre d\'affaires',
      totalRevenue: 'CA total',
      totalProfit: 'Profit total',
      avgProfit: 'Profit moyen',
      perSale: 'par vente',
      fees: 'Frais',
      bestSale: 'Meilleure vente',
      history: 'Historique des ventes',
      sale: 'vente',
      salesPlural: 'ventes',
      noSales: 'Aucune vente enregistrée',
      markAsSold: 'Marque une paire comme "Vendue" dans l\'inventaire',
      allSales: 'Toutes les ventes',
      thisWeek: 'Cette semaine',
      thisMonth: 'Ce mois',
      thisYear: 'Cette année',
      deleteConfirm: 'Supprimer cette vente ?',
    },

    // Common
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      confirm: 'Confirmer',
      yes: 'Oui',
      no: 'Non',
    },
  },

  en: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      inventory: 'Inventory',
      sales: 'Sales',
      expenses: 'Expenses',
      stats: 'Stats',
      settings: 'Settings',
    },

    // Actions
    actions: {
      add: 'Add',
      addToStock: 'Add to stock',
      recordSale: 'Record sale',
      export: 'Export CSV',
      edit: 'Edit',
      delete: 'Delete',
      cancel: 'Cancel',
      save: 'Save',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
    },

    // Dashboard
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Overview of your stock and performance',
      pairsInStock: 'Pairs in stock',
      stockValue: 'Stock value',
      netProfit: 'Net profit',
      avgProfit: 'Avg profit',
      total: 'total',
      invested: 'invested',
      sales: 'sales',
      fees: 'fees',
      perPair: 'per pair sold',
      latestAdditions: 'Latest additions',
      latestSales: 'Latest sales',
      performance: 'Performance by brand',
      pairs: 'pairs',
      noPairs: 'No pairs in your stock',
      startTracking: 'Start tracking your sneakers!',
      addFirst: 'Add your first pair',
      viewAll: 'View all',
      deleteConfirm: 'Delete this pair?',
    },

    // Expenses
    expenses: {
      title: 'Expenses',
      subtitle: 'Track your fees and expenses',
      add: 'Add',
      thisMonth: 'This month',
      totalGlobal: 'Total global',
      filtered: 'Filtered',
      expensesCount: 'expenses',
      new: 'New expense',
      edit: 'Edit',
      name: 'Name',
      amount: 'Amount (€)',
      date: 'Date',
      category: 'Category',
      notes: 'Notes',
      cancel: 'Cancel',
      save: 'Add',
      update: 'Update',
      allMonths: 'All months',
      allCategories: 'All categories',
      noExpenses: 'No expenses recorded',
      addExpense: 'Add an expense',
      deleteConfirm: 'Delete this expense?',
      namePlaceholder: 'Ex: StockX shipping fees',
      notesPlaceholder: 'Optional details...',
    },

    // Inventory
    inventory: {
      title: 'Inventory',
      inStock: 'in stock',
      sold: 'sold',
      value: 'value',
      searchPlaceholder: 'Search...',
      allStatuses: 'All statuses',
      allBrands: 'All brands',
      sortRecent: 'Most recent',
      sortName: 'Name A-Z',
      sortPriceAsc: 'Price ascending',
      sortPriceDesc: 'Price descending',
      sortProfit: 'Best profit',
      results: 'result',
      resultsPlural: 'results',
      noPairs: 'No pairs found',
      tryFilters: 'Try changing your filters',
      addFirst: 'Add your first pair to start',
    },

    // Modal
    modal: {
      addInventory: 'Add to inventory',
      recordSale: 'Record sale',
      editPair: 'Edit pair',
      searchPair: 'Search for a pair',
      searchPlaceholder: 'Type a name or SKU (e.g. Jordan 1 Chicago, DZ5485)...',
      noResults: 'No results for',
      name: 'Model name',
      sku: 'SKU / Reference',
      category: 'Category',
      brand: 'Brand',
      size: 'Size',
      condition: 'Condition',
      select: 'Select',
      purchase: 'Purchase',
      buyPrice: 'Buy price',
      buyDate: 'Buy date',
      buyPlatform: 'Buy platform',
      sale: 'Sale',
      sellPrice: 'Sell price',
      sellDate: 'Sell date',
      sellPlatform: 'Sell platform',
      fees: 'Fees (platform, shipping)',
      profit: 'Estimated profit',
      notes: 'Notes',
      notesPlaceholder: 'Additional info...',
      received: 'Delivered',
      inTransit: 'In transit',
      paymentReceived: 'Payment received',
      paymentPending: 'Payment pending',
      packageDelivered: 'Package delivered',
      packagePending: 'Package pending',
      invoice: 'Invoice / Proof of sale (URL)',
      invoicePlaceholder: 'https://... (link to invoice)',
      invoiceView: 'View',
      invoiceHelp: 'Link to Google Drive, Dropbox, or other hosting',
    },

    // Card
    card: {
      buy: 'Buy',
      sell: 'Sell',
      profit: 'Profit',
      paid: 'Paid',
      waiting: 'Waiting',
      shipped: 'Shipped',
      shipping: 'Shipping',
      received: 'Item received',
      inTransit: 'In transit',
      stock: 'STOCK',
      sold: 'SOLD',
    },

    // Status
    status: {
      new: 'New (DS)',
      likeNew: 'Like new',
      veryGood: 'Very good',
      good: 'Good',
      worn: 'Worn',
    },

    // Categories
    categories: {
      sneakers: 'Sneakers',
      clothing: 'Clothing',
    },

    // Settings
    settings: {
      title: 'Settings',
      language: 'Language',
      french: 'Français',
      english: 'English',
      theme: 'Theme',
      currency: 'Currency',
      notifications: 'Notifications',
    },

    // Sales
    sales: {
      title: 'Sales',
      subtitle: 'History and analysis of your sales',
      salesCount: 'Sales',
      pairsSold: 'pairs sold',
      revenue: 'Revenue',
      totalRevenue: 'Total revenue',
      totalProfit: 'Total profit',
      avgProfit: 'Avg profit',
      perSale: 'per sale',
      fees: 'Fees',
      bestSale: 'Best sale',
      history: 'Sales history',
      sale: 'sale',
      salesPlural: 'sales',
      noSales: 'No sales recorded',
      markAsSold: 'Mark a pair as "Sold" in inventory',
      allSales: 'All sales',
      thisWeek: 'This week',
      thisMonth: 'This month',
      thisYear: 'This year',
      deleteConfirm: 'Delete this sale?',
    },

    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
    },
  },
}

// Helper function to get translation
export function getTranslation(lang, key) {
  const keys = key.split('.')
  let value = translations[lang]

  for (const k of keys) {
    value = value?.[k]
  }

  return value || key
}
