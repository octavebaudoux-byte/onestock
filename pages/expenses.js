import { useState, useMemo } from 'react'
import Head from 'next/head'
import { CreditCard, Plus, Trash2, Edit3, X, Check, RefreshCw } from 'lucide-react'
import Layout from '../components/Layout'
import { useExpenses } from '../hooks/useExpenses'
import { EXPENSE_CATEGORIES, formatPrice, formatDate } from '../lib/store'
import { useLanguage } from '../contexts/LanguageContext'

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December']

const RECURRENCE_OPTIONS = [
  { value: 'none', labelFr: 'Aucune', labelEn: 'None' },
  { value: 'monthly', labelFr: 'Mensuelle', labelEn: 'Monthly' },
  { value: 'weekly', labelFr: 'Hebdomadaire', labelEn: 'Weekly' },
  { value: 'yearly', labelFr: 'Annuelle', labelEn: 'Yearly' },
]

export default function ExpensesPage() {
  const { expenses, add, update, remove } = useExpenses()
  const { t, language } = useLanguage()
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
    recurrence: 'none',
    recurrenceDuration: 1,
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
    const MONTHS = language === 'fr' ? MONTHS_FR : MONTHS_EN
    const months = new Set()
    expenses.forEach(e => {
      const d = new Date(e.date)
      months.add(`${d.getFullYear()}-${d.getMonth()}`)
    })
    return Array.from(months).sort().reverse().map(m => {
      const [year, month] = m.split('-')
      return { value: m, label: `${MONTHS[parseInt(month)]} ${year}` }
    })
  }, [expenses, language])

  const resetForm = () => {
    setForm({
      name: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Autre',
      notes: '',
      recurrence: 'none',
      recurrenceDuration: 1,
    })
    setShowForm(false)
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.amount) return

    const baseExpense = {
      ...form,
      amount: parseFloat(form.amount),
      recurrenceDuration: parseInt(form.recurrenceDuration) || 1,
    }

    if (editingId) {
      update(editingId, baseExpense)
    } else {
      // Si récurrent, créer plusieurs dépenses
      if (form.recurrence !== 'none' && form.recurrenceDuration > 1) {
        const startDate = new Date(form.date)

        for (let i = 0; i < parseInt(form.recurrenceDuration); i++) {
          const expenseDate = new Date(startDate)

          if (form.recurrence === 'monthly') {
            expenseDate.setMonth(expenseDate.getMonth() + i)
          } else if (form.recurrence === 'weekly') {
            expenseDate.setDate(expenseDate.getDate() + (i * 7))
          } else if (form.recurrence === 'yearly') {
            expenseDate.setFullYear(expenseDate.getFullYear() + i)
          }

          await add({
            ...baseExpense,
            date: expenseDate.toISOString().split('T')[0],
            name: `${form.name} (${i + 1}/${form.recurrenceDuration})`,
            isRecurring: true,
            recurrenceIndex: i,
            recurrenceTotal: parseInt(form.recurrenceDuration),
          })
        }
      } else {
        add(baseExpense)
      }
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
      recurrence: expense.recurrence || 'none',
      recurrenceDuration: expense.recurrenceDuration || 1,
    })
    setEditingId(expense.id)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (confirm(t('expenses.deleteConfirm'))) {
      remove(id)
    }
  }

  return (
    <>
      <Head>
        <title>{t('expenses.title')} - OneStock</title>
      </Head>

      <Layout>
        <div className="p-6 md:p-8 max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-orange-400" />
              <div>
                <h1 className="text-3xl font-bold">{t('expenses.title')}</h1>
                <p className="text-gray-400">{t('expenses.subtitle')}</p>
              </div>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true) }}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t('expenses.add')}
            </button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card p-5">
              <div className="text-sm text-gray-400 mb-1">{t('expenses.thisMonth')}</div>
              <div className="text-2xl font-bold text-orange-400">-{formatPrice(stats.totalThisMonth)}</div>
            </div>
            <div className="card p-5">
              <div className="text-sm text-gray-400 mb-1">{t('expenses.totalGlobal')}</div>
              <div className="text-2xl font-bold text-red-400">-{formatPrice(stats.totalAll)}</div>
            </div>
            <div className="card p-5">
              <div className="text-sm text-gray-400 mb-1">{t('expenses.filtered')}</div>
              <div className="text-2xl font-bold text-white">{filteredExpenses.length} {t('expenses.expensesCount')} • {formatPrice(stats.totalFiltered)}</div>
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <div className="card p-6 mb-6 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{editingId ? t('expenses.edit') : t('expenses.new')}</h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('expenses.name')} *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder={t('expenses.namePlaceholder')}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('expenses.amount')} *</label>
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
                  <label className="block text-sm text-gray-400 mb-1">{t('expenses.date')}</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('expenses.category')}</label>
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
                  <label className="block text-sm text-gray-400 mb-1">{t('expenses.notes')}</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    placeholder={t('expenses.notesPlaceholder')}
                    className="w-full"
                  />
                </div>

                {/* Récurrence */}
                {!editingId && (
                  <div className="md:col-span-2 p-4 bg-dark-700 rounded-xl border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <RefreshCw className="w-4 h-4 text-blue-400" />
                      <span className="font-medium text-sm">{language === 'fr' ? 'Dépense récurrente' : 'Recurring expense'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">{language === 'fr' ? 'Fréquence' : 'Frequency'}</label>
                        <select
                          value={form.recurrence}
                          onChange={e => setForm(p => ({ ...p, recurrence: e.target.value }))}
                          className="w-full"
                        >
                          {RECURRENCE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {language === 'fr' ? opt.labelFr : opt.labelEn}
                            </option>
                          ))}
                        </select>
                      </div>
                      {form.recurrence !== 'none' && (
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">{language === 'fr' ? 'Durée (nombre de fois)' : 'Duration (times)'}</label>
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={form.recurrenceDuration}
                            onChange={e => setForm(p => ({ ...p, recurrenceDuration: e.target.value }))}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                    {form.recurrence !== 'none' && form.recurrenceDuration > 1 && (
                      <div className="mt-3 text-sm text-blue-400 bg-blue-500/10 px-3 py-2 rounded-lg">
                        {language === 'fr'
                          ? `${form.recurrenceDuration} dépenses de ${formatPrice(parseFloat(form.amount) || 0)} seront créées = ${formatPrice((parseFloat(form.amount) || 0) * form.recurrenceDuration)} total`
                          : `${form.recurrenceDuration} expenses of ${formatPrice(parseFloat(form.amount) || 0)} will be created = ${formatPrice((parseFloat(form.amount) || 0) * form.recurrenceDuration)} total`
                        }
                      </div>
                    )}
                  </div>
                )}

                <div className="md:col-span-2 flex gap-3">
                  <button type="submit" className="btn btn-primary flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    {editingId ? t('expenses.update') : t('expenses.save')}
                  </button>
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    {t('expenses.cancel')}
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
              <option value="all">{t('expenses.allMonths')}</option>
              {availableMonths.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="text-sm"
            >
              <option value="all">{t('expenses.allCategories')}</option>
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
              <p className="text-gray-400">{t('expenses.noExpenses')}</p>
              <button
                onClick={() => { resetForm(); setShowForm(true) }}
                className="btn btn-primary mt-4"
              >
                {t('expenses.addExpense')}
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
                      <div className="font-medium truncate flex items-center gap-2">
                        {expense.name}
                        {expense.isRecurring && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" />
                            {expense.recurrenceIndex + 1}/{expense.recurrenceTotal}
                          </span>
                        )}
                      </div>
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
