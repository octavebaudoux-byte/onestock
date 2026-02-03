import { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import { User, Plus, Search, Upload, ChevronDown, ChevronRight } from 'lucide-react'
import Layout from '../components/Layout'
import AccountCard from '../components/AccountCard'
import { useWhopAuth } from '../contexts/WhopAuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useToast } from '../contexts/ToastContext'
import { loadAccounts, addAccount, updateAccount, deleteAccount } from '../lib/database'

export default function AccountsPage() {
  const { user } = useWhopAuth()
  const { language } = useLanguage()
  const { showToast } = useToast()

  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedGroups, setExpandedGroups] = useState(new Set())
  const [showModal, setShowModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [importText, setImportText] = useState('')
  const [importing, setImporting] = useState(false)

  // Formulaire
  const [formData, setFormData] = useState({
    groupName: '',
    site: '',
    email: '',
    password: '',
    notes: ''
  })

  // Charger les comptes
  useEffect(() => {
    if (user?.id) {
      loadAccountsData()
    }
  }, [user])

  async function loadAccountsData() {
    setLoading(true)
    try {
      const data = await loadAccounts(user.id)
      setAccounts(data)
      // Expand all groups by default
      const groups = new Set(data.map(a => a.groupName || 'Sans groupe').filter(Boolean))
      setExpandedGroups(groups)
    } catch (error) {
      showToast(language === 'fr' ? 'Erreur de chargement' : 'Loading error', 'error')
    }
    setLoading(false)
  }

  // Grouper les comptes
  const groupedAccounts = useMemo(() => {
    const filtered = searchTerm
      ? accounts.filter(account =>
          account.site?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.groupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.notes?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : accounts

    const groups = {}
    filtered.forEach(account => {
      const groupName = account.groupName || (language === 'fr' ? 'Sans groupe' : 'Ungrouped')
      if (!groups[groupName]) {
        groups[groupName] = []
      }
      groups[groupName].push(account)
    })

    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]))
  }, [accounts, searchTerm, language])

  // Toggle groupe
  function toggleGroup(groupName) {
    const newSet = new Set(expandedGroups)
    if (newSet.has(groupName)) {
      newSet.delete(groupName)
    } else {
      newSet.add(groupName)
    }
    setExpandedGroups(newSet)
  }

  // Ouvrir modal ajout
  function openAddModal() {
    setEditingAccount(null)
    setFormData({ groupName: '', site: '', email: '', password: '', notes: '' })
    setShowModal(true)
  }

  // Ouvrir modal édition
  function openEditModal(account) {
    setEditingAccount(account)
    setFormData({
      groupName: account.groupName || '',
      site: account.site || '',
      email: account.email || '',
      password: account.password || '',
      notes: account.notes || ''
    })
    setShowModal(true)
  }

  // Sauvegarder
  async function handleSave() {
    if (!formData.groupName || !formData.site || !formData.email || !formData.password) {
      showToast(language === 'fr' ? 'Groupe, site, email et mot de passe requis' : 'Group, site, email and password required', 'error')
      return
    }

    try {
      if (editingAccount) {
        const updated = await updateAccount(user.id, editingAccount.id, formData)
        if (updated) {
          setAccounts(accounts.map(a => a.id === editingAccount.id ? updated : a))
          showToast(language === 'fr' ? 'Compte modifié' : 'Account updated', 'success')
        }
      } else {
        const newAccount = await addAccount(user.id, formData)
        if (newAccount) {
          setAccounts([newAccount, ...accounts])
          // Auto-expand new group
          setExpandedGroups(prev => new Set([...prev, newAccount.groupName]))
          showToast(language === 'fr' ? 'Compte ajouté' : 'Account added', 'success')
        }
      }
      setShowModal(false)
    } catch (error) {
      showToast(language === 'fr' ? 'Erreur' : 'Error', 'error')
    }
  }

  // Supprimer
  async function handleDelete(accountId) {
    if (!confirm(language === 'fr' ? 'Supprimer ce compte ?' : 'Delete this account?')) return

    try {
      const success = await deleteAccount(user.id, accountId)
      if (success) {
        setAccounts(accounts.filter(a => a.id !== accountId))
        showToast(language === 'fr' ? 'Compte supprimé' : 'Account deleted', 'success')
      }
    } catch (error) {
      showToast(language === 'fr' ? 'Erreur' : 'Error', 'error')
    }
  }

  // Import en masse
  async function handleImport() {
    if (!importText.trim()) {
      showToast(language === 'fr' ? 'Veuillez entrer des comptes' : 'Please enter accounts', 'error')
      return
    }

    setImporting(true)
    try {
      const lines = importText.trim().split('\n')
      let successCount = 0
      let errorCount = 0

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine) continue

        // Format: groupName site email password [notes]
        const parts = trimmedLine.split(/\s+/)

        if (parts.length < 4) {
          errorCount++
          continue
        }

        const accountData = {
          groupName: parts[0],
          site: parts[1],
          email: parts[2],
          password: parts[3],
          notes: parts.length > 4 ? parts.slice(4).join(' ') : ''
        }

        try {
          const newAccount = await addAccount(user.id, accountData)
          if (newAccount) {
            successCount++
            setAccounts(prev => [newAccount, ...prev])
            setExpandedGroups(prev => new Set([...prev, newAccount.groupName]))
          } else {
            errorCount++
          }
        } catch (error) {
          errorCount++
        }
      }

      if (successCount > 0) {
        showToast(
          language === 'fr'
            ? `${successCount} compte(s) importé(s)${errorCount > 0 ? `, ${errorCount} erreur(s)` : ''}`
            : `${successCount} account(s) imported${errorCount > 0 ? `, ${errorCount} error(s)` : ''}`,
          errorCount > 0 ? 'warning' : 'success'
        )
      } else {
        showToast(language === 'fr' ? 'Aucun compte importé' : 'No accounts imported', 'error')
      }

      setShowImportModal(false)
      setImportText('')
    } catch (error) {
      showToast(language === 'fr' ? 'Erreur d\'import' : 'Import error', 'error')
    }
    setImporting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">{language === 'fr' ? 'Chargement...' : 'Loading...'}</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{language === 'fr' ? 'Comptes' : 'Accounts'} - OneStock</title>
      </Head>

      <Layout onAddClick={openAddModal}>
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-3xl font-bold">{language === 'fr' ? 'Mes Comptes' : 'My Accounts'}</h1>
                <p className="text-gray-400">
                  {groupedAccounts.length} {language === 'fr' ? 'groupes' : 'groups'} · {accounts.length} {language === 'fr' ? 'comptes' : 'accounts'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                {language === 'fr' ? 'Importer' : 'Import'}
              </button>
              <button
                onClick={openAddModal}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {language === 'fr' ? 'Ajouter' : 'Add'}
              </button>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="card p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Groupes de comptes */}
          <div className="space-y-6">
            {groupedAccounts.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-gray-400">
                  {searchTerm
                    ? (language === 'fr' ? 'Aucun compte trouvé' : 'No accounts found')
                    : (language === 'fr' ? 'Aucun compte. Cliquez sur Ajouter pour commencer.' : 'No accounts. Click Add to get started.')
                  }
                </p>
              </div>
            ) : (
              groupedAccounts.map(([groupName, groupAccounts]) => (
                <div key={groupName} className="card overflow-hidden">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(groupName)}
                    className="w-full px-6 py-4 flex items-center justify-between bg-dark-700/50 hover:bg-dark-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedGroups.has(groupName) ? (
                        <ChevronDown className="w-5 h-5 text-blue-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <h2 className="text-xl font-bold text-white">{groupName}</h2>
                      <span className="text-sm text-gray-400">
                        ({groupAccounts.length} {language === 'fr' ? 'compte' : 'account'}{groupAccounts.length > 1 ? 's' : ''})
                      </span>
                    </div>
                  </button>

                  {/* Group Accounts */}
                  {expandedGroups.has(groupName) && (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {groupAccounts.map(account => (
                          <AccountCard
                            key={account.id}
                            account={account}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </Layout>

      {/* Modal Ajout/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold mb-6">
              {editingAccount
                ? (language === 'fr' ? 'Modifier le compte' : 'Edit Account')
                : (language === 'fr' ? 'Ajouter un compte' : 'Add Account')
              }
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'fr' ? 'Nom du groupe' : 'Group Name'} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.groupName}
                  onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                  placeholder={language === 'fr' ? 'Ex: iCloud, Nike, Zalando...' : 'Ex: iCloud, Nike, Zalando...'}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'fr' ? 'Site / Plateforme' : 'Site / Platform'} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.site}
                  onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                  placeholder={language === 'fr' ? 'Ex: Apple, Nike.com...' : 'Ex: Apple, Nike.com...'}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="exemple@email.com"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'fr' ? 'Mot de passe' : 'Password'} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="input w-full font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Notes {language === 'fr' ? '(optionnel)' : '(optional)'}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={language === 'fr' ? 'Informations supplémentaires...' : 'Additional information...'}
                  rows={3}
                  className="input w-full resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-secondary flex-1"
              >
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary flex-1"
              >
                {language === 'fr' ? 'Enregistrer' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {language === 'fr' ? 'Importer des comptes' : 'Import Accounts'}
            </h2>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-400 mb-2">
                {language === 'fr' ? 'Format attendu' : 'Expected format'}
              </h3>
              <p className="text-sm text-gray-400 mb-2">
                {language === 'fr'
                  ? 'Une ligne par compte:'
                  : 'One line per account:'}
              </p>
              <code className="block bg-dark-700 p-3 rounded text-sm font-mono text-green-400">
                groupName site email password [notes]
              </code>
              <p className="text-xs text-gray-500 mt-2">
                {language === 'fr'
                  ? 'Exemple: iCloud Apple octave@baudoux.fr hadrien1234 Mon compte principal'
                  : 'Example: iCloud Apple octave@baudoux.fr hadrien1234 Main account'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'fr' ? 'Collez vos comptes ici' : 'Paste your accounts here'}
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={language === 'fr'
                    ? 'iCloud Apple octave@baudoux.fr hadrien1234\nNike Nike.com john@doe.com password123\n...'
                    : 'iCloud Apple octave@baudoux.fr hadrien1234\nNike Nike.com john@doe.com password123\n...'}
                  rows={12}
                  className="input w-full resize-none font-mono text-sm"
                  disabled={importing}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {language === 'fr'
                    ? `${importText.split('\n').filter(l => l.trim()).length} ligne(s) détectée(s)`
                    : `${importText.split('\n').filter(l => l.trim()).length} line(s) detected`}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setImportText('')
                }}
                className="btn btn-secondary flex-1"
                disabled={importing}
              >
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                onClick={handleImport}
                className="btn btn-primary flex-1"
                disabled={importing || !importText.trim()}
              >
                {importing
                  ? (language === 'fr' ? 'Import en cours...' : 'Importing...')
                  : (language === 'fr' ? 'Importer' : 'Import')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
