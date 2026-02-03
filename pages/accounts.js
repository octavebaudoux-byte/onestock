// Accounts Page - Gestion des comptes emails par groupe (format CSV: email,password)
import { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import { User, Plus, Search, Upload, X, Copy, Check, Trash2, Eye, EyeOff } from 'lucide-react'
import Layout from '../components/Layout'
import { useWhopAuth } from '../contexts/WhopAuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useToast } from '../contexts/ToastContext'
import { loadAccounts, addAccount, deleteAccount } from '../lib/database'

export default function AccountsPage() {
  const { user } = useWhopAuth()
  const { language } = useLanguage()
  const { showToast } = useToast()

  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importText, setImportText] = useState('')
  const [importing, setImporting] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const [copiedField, setCopiedField] = useState(null)
  const [showPasswords, setShowPasswords] = useState(false)

  // Formulaire nouveau groupe
  const [newGroupName, setNewGroupName] = useState('')

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
    } catch (error) {
      showToast(language === 'fr' ? 'Erreur de chargement' : 'Loading error', 'error')
    }
    setLoading(false)
  }

  // Grouper les comptes par groupName
  const groups = useMemo(() => {
    const groupMap = {}
    accounts.forEach(account => {
      const groupName = account.groupName || (language === 'fr' ? 'Sans groupe' : 'Ungrouped')
      if (!groupMap[groupName]) {
        groupMap[groupName] = {
          name: groupName,
          items: [],
          createdAt: account.createdAt
        }
      }
      groupMap[groupName].items.push({
        id: account.id,
        email: account.email,
        password: account.password || '',
        createdAt: account.createdAt
      })
    })
    return Object.values(groupMap).sort((a, b) => a.name.localeCompare(b.name))
  }, [accounts, language])

  // Filtrer les groupes par recherche
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groups
    const term = searchTerm.toLowerCase()
    return groups.filter(group =>
      group.name.toLowerCase().includes(term) ||
      group.items.some(e => e.email.toLowerCase().includes(term))
    )
  }, [groups, searchTerm])

  // Créer un nouveau groupe
  async function handleCreateGroup() {
    if (!newGroupName.trim()) {
      showToast(language === 'fr' ? 'Nom du groupe requis' : 'Group name required', 'error')
      return
    }

    setShowAddModal(false)
    setSelectedGroup(newGroupName.trim())
    setShowImportModal(true)
    setNewGroupName('')
  }

  // Importer des comptes dans un groupe (format CSV: email,password ou email;password)
  async function handleImportAccounts() {
    if (!importText.trim() || !selectedGroup) {
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
        if (!trimmedLine || trimmedLine === 'placeholder@group.create') continue

        // Parser le format CSV: email,password ou email;password ou email\tpassword
        let email = ''
        let password = ''

        if (trimmedLine.includes(',')) {
          const parts = trimmedLine.split(',')
          email = parts[0].trim()
          password = parts.slice(1).join(',').trim()
        } else if (trimmedLine.includes(';')) {
          const parts = trimmedLine.split(';')
          email = parts[0].trim()
          password = parts.slice(1).join(';').trim()
        } else if (trimmedLine.includes('\t')) {
          const parts = trimmedLine.split('\t')
          email = parts[0].trim()
          password = parts.slice(1).join('\t').trim()
        } else {
          // Juste un email sans password
          email = trimmedLine
          password = ''
        }

        if (!email.includes('@')) {
          errorCount++
          continue
        }

        try {
          const newAccount = await addAccount(user.id, {
            groupName: selectedGroup,
            site: selectedGroup,
            email: email,
            password: password || '-'
          })
          if (newAccount) {
            successCount++
            setAccounts(prev => [newAccount, ...prev])
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
            ? `${successCount} compte(s) ajouté(s)${errorCount > 0 ? `, ${errorCount} erreur(s)` : ''}`
            : `${successCount} account(s) added${errorCount > 0 ? `, ${errorCount} error(s)` : ''}`,
          errorCount > 0 ? 'warning' : 'success'
        )
      } else {
        showToast(language === 'fr' ? 'Aucun compte ajouté' : 'No accounts added', 'error')
      }

      setShowImportModal(false)
      setImportText('')
    } catch (error) {
      showToast(language === 'fr' ? 'Erreur d\'import' : 'Import error', 'error')
    }
    setImporting(false)
  }

  // Supprimer un compte
  async function handleDeleteAccount(accountId) {
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

  // Supprimer un groupe entier
  async function handleDeleteGroup(groupName) {
    if (!confirm(language === 'fr' ? `Supprimer le groupe "${groupName}" et tous ses comptes ?` : `Delete group "${groupName}" and all its accounts?`)) return

    const groupAccounts = accounts.filter(a => a.groupName === groupName)
    let successCount = 0

    for (const account of groupAccounts) {
      const success = await deleteAccount(user.id, account.id)
      if (success) successCount++
    }

    setAccounts(accounts.filter(a => a.groupName !== groupName))
    setSelectedGroup(null)
    showToast(language === 'fr' ? `${successCount} compte(s) supprimé(s)` : `${successCount} account(s) deleted`, 'success')
  }

  // Copier un champ
  async function copyField(id, field, value) {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedId(id)
      setCopiedField(field)
      showToast(language === 'fr' ? 'Copié' : 'Copied', 'success')
      setTimeout(() => {
        setCopiedId(null)
        setCopiedField(null)
      }, 2000)
    } catch (error) {
      showToast(language === 'fr' ? 'Erreur' : 'Error', 'error')
    }
  }

  // Copier tous les comptes d'un groupe (format CSV)
  async function copyAllAccounts(group) {
    const csvContent = group.items
      .filter(e => e.email !== 'placeholder@group.create')
      .map(e => `${e.email},${e.password}`)
      .join('\n')

    try {
      await navigator.clipboard.writeText(csvContent)
      showToast(language === 'fr' ? `${group.items.length} compte(s) copié(s)` : `${group.items.length} account(s) copied`, 'success')
    } catch (error) {
      showToast(language === 'fr' ? 'Erreur' : 'Error', 'error')
    }
  }

  // Obtenir le groupe sélectionné
  const currentGroup = groups.find(g => g.name === selectedGroup)

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

      <Layout onAddClick={() => setShowAddModal(true)}>
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-3xl font-bold">{language === 'fr' ? 'Mes Comptes' : 'My Accounts'}</h1>
                <p className="text-gray-400">
                  {groups.length} {language === 'fr' ? 'groupes' : 'groups'} · {accounts.filter(a => a.email !== 'placeholder@group.create').length} {language === 'fr' ? 'comptes' : 'accounts'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {language === 'fr' ? 'Nouveau groupe' : 'New Group'}
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="card p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'fr' ? 'Rechercher un groupe ou email...' : 'Search group or email...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Grille de cartes (comme l'inventaire) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredGroups.length === 0 ? (
              <div className="col-span-full card p-12 text-center">
                <p className="text-gray-400">
                  {searchTerm
                    ? (language === 'fr' ? 'Aucun groupe trouvé' : 'No groups found')
                    : (language === 'fr' ? 'Aucun groupe. Cliquez sur "Nouveau groupe" pour commencer.' : 'No groups. Click "New Group" to get started.')
                  }
                </p>
              </div>
            ) : (
              filteredGroups.map((group) => {
                const accountCount = group.items.filter(e => e.email !== 'placeholder@group.create').length
                return (
                  <div
                    key={group.name}
                    onClick={() => setSelectedGroup(group.name)}
                    className="card p-5 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-lg text-white truncate">{group.name}</h3>
                    </div>
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {accountCount}
                    </div>
                    <p className="text-sm text-gray-400">
                      {language === 'fr' ? 'comptes' : 'accounts'}
                    </p>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </Layout>

      {/* Modal Nouveau Groupe */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6">
              {language === 'fr' ? 'Nouveau groupe' : 'New Group'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'fr' ? 'Nom du groupe' : 'Group Name'}
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder={language === 'fr' ? 'Ex: iCloud, Nike, Zalando...' : 'Ex: iCloud, Nike, Zalando...'}
                  className="input w-full"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewGroupName('')
                }}
                className="btn btn-secondary flex-1"
              >
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                onClick={handleCreateGroup}
                className="btn btn-primary flex-1"
              >
                {language === 'fr' ? 'Créer' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détail du groupe (liste des comptes en 2 colonnes) */}
      {selectedGroup && currentGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-dark-700 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedGroup}</h2>
                <p className="text-gray-400 text-sm">
                  {currentGroup.items.filter(e => e.email !== 'placeholder@group.create').length} {language === 'fr' ? 'comptes' : 'accounts'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPasswords ? (language === 'fr' ? 'Masquer' : 'Hide') : (language === 'fr' ? 'Afficher' : 'Show')}
                </button>
                <button
                  onClick={() => copyAllAccounts(currentGroup)}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {language === 'fr' ? 'Copier CSV' : 'Copy CSV'}
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {language === 'fr' ? 'Ajouter' : 'Add'}
                </button>
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* En-tête colonnes */}
            <div className="px-6 py-3 border-b border-dark-700 bg-dark-800">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
                <div className="col-span-5">{language === 'fr' ? 'Email' : 'Email'}</div>
                <div className="col-span-5">{language === 'fr' ? 'Mot de passe' : 'Password'}</div>
                <div className="col-span-2 text-right">{language === 'fr' ? 'Actions' : 'Actions'}</div>
              </div>
            </div>

            {/* Liste des comptes en 2 colonnes */}
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-dark-700">
                {currentGroup.items
                  .filter(e => e.email !== 'placeholder@group.create')
                  .map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-dark-700/50 group items-center"
                    >
                      {/* Email */}
                      <div className="col-span-5 flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-300 truncate flex-1">
                          {item.email}
                        </span>
                        <button
                          onClick={() => copyField(item.id, 'email', item.email)}
                          className="p-1.5 hover:bg-dark-600 rounded transition-colors opacity-0 group-hover:opacity-100"
                        >
                          {copiedId === item.id && copiedField === 'email' ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>

                      {/* Password */}
                      <div className="col-span-5 flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-300 truncate flex-1">
                          {showPasswords ? (item.password || '-') : '••••••••'}
                        </span>
                        <button
                          onClick={() => copyField(item.id, 'password', item.password || '')}
                          className="p-1.5 hover:bg-dark-600 rounded transition-colors opacity-0 group-hover:opacity-100"
                        >
                          {copiedId === item.id && copiedField === 'password' ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex justify-end">
                        <button
                          onClick={() => handleDeleteAccount(item.id)}
                          className="p-1.5 hover:bg-red-600/20 text-red-400 rounded transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {currentGroup.items.filter(e => e.email !== 'placeholder@group.create').length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  {language === 'fr' ? 'Aucun compte. Cliquez sur "Ajouter" pour importer des comptes.' : 'No accounts. Click "Add" to import accounts.'}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-dark-700">
              <button
                onClick={() => handleDeleteGroup(selectedGroup)}
                className="btn w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400"
              >
                <Trash2 className="w-4 h-4" />
                {language === 'fr' ? 'Supprimer ce groupe' : 'Delete this group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import de comptes (format CSV) */}
      {showImportModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {language === 'fr' ? `Ajouter des comptes à "${selectedGroup}"` : `Add accounts to "${selectedGroup}"`}
            </h2>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-400 mb-2">
                {language === 'fr'
                  ? 'Format CSV : email,password (un compte par ligne)'
                  : 'CSV format: email,password (one account per line)'}
              </p>
              <p className="text-xs text-gray-500">
                {language === 'fr'
                  ? 'Séparateurs acceptés : virgule (,) point-virgule (;) ou tabulation'
                  : 'Accepted separators: comma (,) semicolon (;) or tab'}
              </p>
            </div>

            <div className="space-y-4">
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={language === 'fr'
                  ? 'exemple1@icloud.com,motdepasse123\nexemple2@icloud.com,password456\nexemple3@icloud.com,secret789'
                  : 'example1@icloud.com,password123\nexample2@icloud.com,password456\nexample3@icloud.com,secret789'}
                rows={15}
                className="input w-full resize-none font-mono text-sm"
                disabled={importing}
                autoFocus
              />
              <p className="text-xs text-gray-500">
                {language === 'fr'
                  ? `${importText.split('\n').filter(l => l.trim() && l.includes('@')).length} compte(s) détecté(s)`
                  : `${importText.split('\n').filter(l => l.trim() && l.includes('@')).length} account(s) detected`}
              </p>
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
                onClick={handleImportAccounts}
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
