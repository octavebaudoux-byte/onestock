import { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import { User, Plus, Search, Edit2, Trash2, Eye, EyeOff, Copy, Check } from 'lucide-react'
import Layout from '../components/Layout'
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
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [visiblePasswords, setVisiblePasswords] = useState(new Set())
  const [copiedId, setCopiedId] = useState(null)

  const itemsPerPage = 50

  // Formulaire
  const [formData, setFormData] = useState({
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
    } catch (error) {
      showToast(language === 'fr' ? 'Erreur de chargement' : 'Loading error', 'error')
    }
    setLoading(false)
  }

  // Filtrer les comptes par recherche
  const filteredAccounts = useMemo(() => {
    if (!searchTerm) return accounts

    const term = searchTerm.toLowerCase()
    return accounts.filter(account =>
      account.site?.toLowerCase().includes(term) ||
      account.email?.toLowerCase().includes(term) ||
      account.notes?.toLowerCase().includes(term)
    )
  }, [accounts, searchTerm])

  // Pagination
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage)
  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAccounts.slice(start, start + itemsPerPage)
  }, [filteredAccounts, currentPage])

  // Ouvrir le modal pour ajouter
  function openAddModal() {
    setEditingAccount(null)
    setFormData({ site: '', email: '', password: '', notes: '' })
    setShowModal(true)
  }

  // Ouvrir le modal pour éditer
  function openEditModal(account) {
    setEditingAccount(account)
    setFormData({
      site: account.site || '',
      email: account.email || '',
      password: account.password || '',
      notes: account.notes || ''
    })
    setShowModal(true)
  }

  // Sauvegarder (ajout ou modification)
  async function handleSave() {
    if (!formData.site || !formData.email || !formData.password) {
      showToast(language === 'fr' ? 'Site, email et mot de passe requis' : 'Site, email and password required', 'error')
      return
    }

    try {
      if (editingAccount) {
        // Modification
        const updated = await updateAccount(user.id, editingAccount.id, formData)
        if (updated) {
          setAccounts(accounts.map(a => a.id === editingAccount.id ? updated : a))
          showToast(language === 'fr' ? 'Compte modifié' : 'Account updated', 'success')
        }
      } else {
        // Ajout
        const newAccount = await addAccount(user.id, formData)
        if (newAccount) {
          setAccounts([newAccount, ...accounts])
          showToast(language === 'fr' ? 'Compte ajouté' : 'Account added', 'success')
        }
      }
      setShowModal(false)
    } catch (error) {
      showToast(language === 'fr' ? 'Erreur' : 'Error', 'error')
    }
  }

  // Supprimer un compte
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

  // Toggle visibilité mot de passe
  function togglePasswordVisibility(accountId) {
    const newSet = new Set(visiblePasswords)
    if (newSet.has(accountId)) {
      newSet.delete(accountId)
    } else {
      newSet.add(accountId)
    }
    setVisiblePasswords(newSet)
  }

  // Copier dans le presse-papier
  async function copyToClipboard(text, accountId) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(accountId)
      showToast(language === 'fr' ? 'Copié' : 'Copied', 'success')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      showToast(language === 'fr' ? 'Erreur de copie' : 'Copy error', 'error')
    }
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
                <p className="text-gray-400">{accounts.length} {language === 'fr' ? 'comptes enregistrés' : 'saved accounts'}</p>
              </div>
            </div>
            <button
              onClick={openAddModal}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {language === 'fr' ? 'Ajouter' : 'Add'}
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="card p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'fr' ? 'Rechercher par site, email...' : 'Search by site, email...'}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-12 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tableau des comptes */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      {language === 'fr' ? 'Site' : 'Site'}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      {language === 'fr' ? 'Mot de passe' : 'Password'}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Notes
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {paginatedAccounts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                        {searchTerm
                          ? (language === 'fr' ? 'Aucun compte trouvé' : 'No accounts found')
                          : (language === 'fr' ? 'Aucun compte. Cliquez sur Ajouter pour commencer.' : 'No accounts. Click Add to get started.')
                        }
                      </td>
                    </tr>
                  ) : (
                    paginatedAccounts.map((account) => (
                      <tr key={account.id} className="hover:bg-dark-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{account.site}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-300">{account.email}</span>
                            <button
                              onClick={() => copyToClipboard(account.email, `email-${account.id}`)}
                              className="p-1 hover:bg-dark-600 rounded transition-colors"
                              title={language === 'fr' ? 'Copier' : 'Copy'}
                            >
                              {copiedId === `email-${account.id}` ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-300 font-mono">
                              {visiblePasswords.has(account.id) ? account.password : '••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(account.id)}
                              className="p-1 hover:bg-dark-600 rounded transition-colors"
                              title={visiblePasswords.has(account.id) ? (language === 'fr' ? 'Masquer' : 'Hide') : (language === 'fr' ? 'Afficher' : 'Show')}
                            >
                              {visiblePasswords.has(account.id) ? (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                              ) : (
                                <Eye className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            <button
                              onClick={() => copyToClipboard(account.password, `pwd-${account.id}`)}
                              className="p-1 hover:bg-dark-600 rounded transition-colors"
                              title={language === 'fr' ? 'Copier' : 'Copy'}
                            >
                              {copiedId === `pwd-${account.id}` ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-400 text-sm">
                            {account.notes ? (account.notes.length > 30 ? account.notes.substring(0, 30) + '...' : account.notes) : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(account)}
                              className="p-2 hover:bg-blue-600/20 text-blue-400 rounded transition-colors"
                              title={language === 'fr' ? 'Modifier' : 'Edit'}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(account.id)}
                              className="p-2 hover:bg-red-600/20 text-red-400 rounded transition-colors"
                              title={language === 'fr' ? 'Supprimer' : 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-dark-700 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  {language === 'fr' ? 'Page' : 'Page'} {currentPage} {language === 'fr' ? 'sur' : 'of'} {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {language === 'fr' ? 'Précédent' : 'Previous'}
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {language === 'fr' ? 'Suivant' : 'Next'}
                  </button>
                </div>
              </div>
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
                  {language === 'fr' ? 'Site / Plateforme' : 'Site / Platform'} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.site}
                  onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                  placeholder={language === 'fr' ? 'Ex: Zalando, Nike, Adidas...' : 'Ex: Zalando, Nike, Adidas...'}
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
    </>
  )
}
