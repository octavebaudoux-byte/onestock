import { useState, useMemo } from 'react'
import Head from 'next/head'
import { CreditCard, Plus, Trash2, Edit3, X, Check } from 'lucide-react'
import Layout from '../components/Layout'
import { useExpenses } from '../hooks/useExpenses'
import { EXPENSE_CATEGORIES, formatPrice, formatDate } from '../lib/store'

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

export default function ExpensesPage() {
  const { expenses, add, update, remove } = useExpenses()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterMonth, setFilterMonth] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [form, setForm] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Autre',
    notes: '',
  })

  // Filtrage
  const filteredExpenses = useMemo(() => {
    let result = [...expenses]

    if (filterMonth !== 'all') {
      result = result.filter(e => {
        const d = new Date(e.date)
        return `${d.getFullYear()}-${d.getMonth()}` === filterMonth
      })
    }

    if (filterCategory !== 'all') {
      result = result.filter(e => e.category === filterCategory)
    }

    result.sort((a, b) => new Date(b.date) - new Date(a.date))
    return result
  }, [expenses, filterMonth, filterCategory])

  // Stats
  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = expenses.filter(e => {
      const d = new Date(e.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const totalThisMonth = thisMonth.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
    const totalAll = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
    const totalFiltered = filteredExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)

    // Par catégorie
    const byCategory = {}
    filteredExpenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + (parseFloat(e.amount) || 0)
    })

    return { totalThisMonth, totalAll, totalFiltered, byCategory }
  }, [expenses, filteredExpenses])

  // Mois disponibles pour le filtre
  const availableMonths = useMemo(() => {
    const months = new Set()
    expenses.forEach(e => {
      const d = new Date(e.date)
      months.add(`${d.getFullYear()}-${d.getMonth()}`)
    })
    return Array.from(months).sort().reverse().map(m => {
      const [year, month] = m.split('-')
      return { value: m, label: `${MONTHS[parseInt(month)]} ${year}` }
    })
  }, [expenses])

  const resetForm = () => {
    setForm({
      name: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Autre',
      notes: '',
    })
    setShowForm(false)
    setEditingId(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.amount) return

    if (editingId) {
      update(editingId, { ...form, amount: parseFloat(form.amount) })
    } else {
      add({ ...form, amount: parseFloat(form.amount) })
    }
    resetForm()
  }

  const handleEdit = (expense) => {
    setForm({
      name: expense.name,
      amount: expense.amount.toString(),
      date: expense.date?.split('T')[0] || '',
      category: expense.category || 'Autre',
      notes: expense.notes || '',
    })
    setEditingId(expense.id)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (confirm('Supprimer cette dépense ?')) {
      remove(id)
    }
  }

  return (
    <>
      <Head>
        <title>Dépenses - OneStock</title>
      </Head>

      <Layout>
        <div className="p-6 md:p-8 max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-orange-400" />
              <div>
                <h1 className="text-3xl font-bold">Dépenses</h1>
                <p className="text-gray-400">Suivi de tes frais et dépenses</p>
              </div>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true) }}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Ajouter
            </button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card p-5">
              <div className="text-sm text-gray-400 mb-1">Ce mois</div>
              <div className="text-2xl font-bold text-orange-400">-{formatPrice(stats.totalThisMonth)}</div>
            </div>
            <div className="card p-5">
              <div className="text-sm text-gray-400 mb-1">Total global</div>
              <div className="text-2xl font-bold text-red-400">-{formatPrice(stats.totalAll)}</div>
            </div>
            <div className="card p-5">
              <div className="text-sm text-gray-400 mb-1">Filtré</div>
              <div className="text-2xl font-bold text-white">{filteredExpenses.length} dépenses • {formatPrice(stats.totalFiltered)}</div>
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <div className="card p-6 mb-6 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{editingId ? 'Modifier' : 'Nouvelle dépense'}</h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Ex: Frais d'envoi StockX"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Montant (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                    placeholder="15.00"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Catégorie</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full"
                  >
                    {EXPENSE_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Notes</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Détails optionnels..."
                    className="w-full"
                  />
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <button type="submit" className="btn btn-primary flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    {editingId ? 'Modifier' : 'Ajouter'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <select
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="text-sm"
            >
              <option value="all">Tous les mois</option>
              {availableMonths.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="text-sm"
            >
              <option value="all">Toutes catégories</option>
              {EXPENSE_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Breakdown by category */}
          {Object.keys(stats.byCategory).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]).map(([cat, total]) => (
                <span key={cat} className="px-3 py-1.5 bg-dark-700 rounded-lg text-sm">
                  {cat}: <span className="text-orange-400 font-medium">{formatPrice(total)}</span>
                </span>
              ))}
            </div>
          )}

          {/* Expenses list */}
          {filteredExpenses.length === 0 ? (
            <div className="card p-12 text-center">
              <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Aucune dépense enregistrée</p>
              <button
                onClick={() => { resetForm(); setShowForm(true) }}
                className="btn btn-primary mt-4"
              >
                Ajouter une dépense
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredExpenses.map(expense => (
                <div
                  key={expense.id}
                  className="card p-4 flex items-center justify-between hover:border-orange-500/30 transition-all"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{expense.name}</div>
                      <div className="text-sm text-gray-400 flex items-center gap-2">
                        <span>{formatDate(expense.date)}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-orange-400/70">{expense.category}</span>
                        {expense.notes && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span className="truncate">{expense.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-orange-400 whitespace-nowrap">
                      -{formatPrice(expense.amount)}
                    </span>
                    <button
                      onClick={() => handleEdit(expense)}
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
