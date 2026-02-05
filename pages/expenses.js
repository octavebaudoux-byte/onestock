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
  { value: 'none', labelFr: 'Unique', labelEn: 'One-time' },
  { value: 'monthly', labelFr: 'Mensuelle', labelEn: 'Monthly' },
  { value: 'weekly', labelFr: 'Hebdomadaire', labelEn: 'Weekly' },
  { value: 'yearly', labelFr: 'Annuelle', labelEn: 'Yearly' },
]

// Helper: calculer le nombre de mois entre deux dates
function monthsDiff(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1
}

// Helper: calculer le total d'une dépense récurrente
function getRecurringTotal(expense) {
  if (expense.recurrence === 'none' || !expense.recurrence) {
    return expense.amount
  }

  const now = new Date()
  const startDate = new Date(expense.date)
  const endDate = expense.recurrenceEndDate ? new Date(expense.recurrenceEndDate) : now

  // Si la date de fin est dans le futur et indéfini, calculer jusqu'à maintenant
  const calcEnd = endDate > now ? now : endDate

  let occurrences = 1
  if (expense.recurrence === 'monthly') {
    occurrences = monthsDiff(startDate, calcEnd)
  } else if (expense.recurrence === 'weekly') {
    occurrences = Math.ceil((calcEnd - startDate) / (7 * 24 * 60 * 60 * 1000)) + 1
  } else if (expense.recurrence === 'yearly') {
    occurrences = calcEnd.getFullYear() - startDate.getFullYear() + 1
  }

  return expense.amount * Math.max(1, occurrences)
}

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
    recurrenceEndDate: '',
    isIndefinite: false,
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

  // Stats - avec calcul des récurrents
  const stats = useMemo(() => {
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Pour ce mois: inclure les dépenses récurrentes actives
    let totalThisMonth = 0
    expenses.forEach(e => {
      const expenseDate = new Date(e.date)
      const endDate = e.recurrenceEndDate ? new Date(e.recurrenceEndDate) : null

      if (e.recurrence === 'none' || !e.recurrence) {
        // Dépense unique - compte si dans ce mois
        if (expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()) {
          totalThisMonth += parseFloat(e.amount) || 0
        }
      } else {
        // Dépense récurrente - compte si active ce mois
        const isActiveThisMonth = expenseDate <= thisMonthEnd && (e.isIndefinite || !endDate || endDate >= thisMonthStart)
        if (isActiveThisMonth) {
          if (e.recurrence === 'monthly') {
            totalThisMonth += parseFloat(e.amount) || 0
          } else if (e.recurrence === 'weekly') {
            totalThisMonth += (parseFloat(e.amount) || 0) * 4 // ~4 semaines par mois
          } else if (e.recurrence === 'yearly' && expenseDate.getMonth() === now.getMonth()) {
            totalThisMonth += parseFloat(e.amount) || 0
          }
        }
      }
    })

    // Total cumulé (avec récurrents)
    const totalAll = expenses.reduce((sum, e) => sum + getRecurringTotal(e), 0)
    const totalFiltered = filteredExpenses.reduce((sum, e) => sum + getRecurringTotal(e), 0)

    // Par catégorie
    const byCategory = {}
    filteredExpenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + getRecurringTotal(e)
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
      recurrenceEndDate: '',
      isIndefinite: false,
    })
    setShowForm(false)
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.amount) return

    const expense = {
      name: form.name,
      amount: parseFloat(form.amount),
      date: form.date,
      category: form.category,
      notes: form.notes,
      recurrence: form.recurrence,
      recurrenceEndDate: form.isIndefinite ? null : (form.recurrenceEndDate || null),
      isIndefinite: form.recurrence !== 'none' ? form.isIndefinite : false,
    }

    if (editingId) {
      update(editingId, expense)
    } else {
      add(expense)
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
      recurrenceEndDate: expense.recurrenceEndDate?.split('T')[0] || '',
      isIndefinite: expense.isIndefinite || false,
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
        <div className="p-4 md:p-8 max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3">
              <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-orange-400" />
              <div>
                <h1 className="text-xl md:text-3xl font-bold">{t('expenses.title')}</h1>
                <p className="text-xs md:text-base text-gray-400 hidden md:block">{t('expenses.subtitle')}</p>
              </div>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true) }}
              className="btn btn-primary flex items-center gap-1 md:gap-2 text-sm md:text-base px-3 md:px-4 py-2"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden md:inline">{t('expenses.add')}</span>
            </button>
          </div>

          {/* Stats cards - 2 colonnes sur mobile */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-8">
            <div className="card p-3 md:p-5">
              <div className="text-[10px] md:text-sm text-gray-400 mb-0.5 md:mb-1">{t('expenses.thisMonth')}</div>
              <div className="text-lg md:text-2xl font-bold text-orange-400">-{formatPrice(stats.totalThisMonth)}</div>
            </div>
            <div className="card p-3 md:p-5">
              <div className="text-[10px] md:text-sm text-gray-400 mb-0.5 md:mb-1">{t('expenses.totalGlobal')}</div>
              <div className="text-lg md:text-2xl font-bold text-red-400">-{formatPrice(stats.totalAll)}</div>
            </div>
            <div className="card p-3 md:p-5 col-span-2 md:col-span-1">
              <div className="text-[10px] md:text-sm text-gray-400 mb-0.5 md:mb-1">{t('expenses.filtered')}</div>
              <div className="text-lg md:text-2xl font-bold text-white">{filteredExpenses.length} {t('expenses.expensesCount')} • {formatPrice(stats.totalFiltered)}</div>
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
                <div className="md:col-span-2 p-4 bg-dark-700 rounded-xl border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <RefreshCw className="w-4 h-4 text-blue-400" />
                    <span className="font-medium text-sm">{language === 'fr' ? 'Récurrence' : 'Recurrence'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">{language === 'fr' ? 'Fréquence' : 'Frequency'}</label>
                      <select
                        value={form.recurrence}
                        onChange={e => setForm(p => ({ ...p, recurrence: e.target.value, isIndefinite: e.target.value === 'none' ? false : p.isIndefinite }))}
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
                        <label className="block text-sm text-gray-400 mb-1">{language === 'fr' ? 'Date de fin' : 'End date'}</label>
                        {form.isIndefinite ? (
                          <div className="w-full px-3 py-2 bg-blue-500/20 border border-blue-500/40 rounded-lg text-blue-400 text-sm">
                            ∞ {language === 'fr' ? 'Indéfini' : 'Indefinite'}
                          </div>
                        ) : (
                          <input
                            type="date"
                            value={form.recurrenceEndDate}
                            onChange={e => setForm(p => ({ ...p, recurrenceEndDate: e.target.value }))}
                            min={form.date}
                            className="w-full"
                          />
                        )}
                      </div>
                    )}
                  </div>
                  {form.recurrence !== 'none' && (
                    <div className="mt-3">
                      <label
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          form.isIndefinite
                            ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                            : 'bg-dark-600 border-gray-600 text-gray-400 hover:border-gray-500'
                        }`}
                        onClick={() => setForm(p => ({ ...p, isIndefinite: !p.isIndefinite, recurrenceEndDate: '' }))}
                      >
                        <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${form.isIndefinite ? 'bg-blue-500' : 'bg-gray-600'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${form.isIndefinite ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                        <span className="text-sm font-medium">
                          {language === 'fr' ? 'Dépense indéfinie (sans date de fin)' : 'Indefinite expense (no end date)'}
                        </span>
                      </label>
                    </div>
                  )}
                  {form.recurrence !== 'none' && (
                    <div className="mt-3 text-sm text-blue-400 bg-blue-500/10 px-3 py-2 rounded-lg">
                      {language === 'fr'
                        ? `${formatPrice(parseFloat(form.amount) || 0)} / ${form.recurrence === 'monthly' ? 'mois' : form.recurrence === 'weekly' ? 'semaine' : 'an'}${form.isIndefinite ? ' (indéfini)' : form.recurrenceEndDate ? ` jusqu'au ${new Date(form.recurrenceEndDate).toLocaleDateString('fr-FR')}` : ''}`
                        : `${formatPrice(parseFloat(form.amount) || 0)} / ${form.recurrence === 'monthly' ? 'month' : form.recurrence === 'weekly' ? 'week' : 'year'}${form.isIndefinite ? ' (indefinite)' : form.recurrenceEndDate ? ` until ${new Date(form.recurrenceEndDate).toLocaleDateString('en-US')}` : ''}`
                      }
                    </div>
                  )}
                </div>

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
          <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
            <select
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="text-xs md:text-sm py-2"
            >
              <option value="all">{t('expenses.allMonths')}</option>
              {availableMonths.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="text-xs md:text-sm py-2"
            >
              <option value="all">{t('expenses.allCategories')}</option>
              {EXPENSE_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Breakdown by category - caché sur mobile */}
          {Object.keys(stats.byCategory).length > 0 && (
            <div className="hidden md:flex flex-wrap gap-2 mb-6">
              {Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]).map(([cat, total]) => (
                <span key={cat} className="px-3 py-1.5 bg-dark-700 rounded-lg text-sm">
                  {cat}: <span className="text-orange-400 font-medium">{formatPrice(total)}</span>
                </span>
              ))}
            </div>
          )}

          {/* Expenses list */}
          {filteredExpenses.length === 0 ? (
            <div className="card p-8 md:p-12 text-center">
              <CreditCard className="w-10 h-10 md:w-12 md:h-12 text-gray-600 mx-auto mb-3 md:mb-4" />
              <p className="text-sm md:text-base text-gray-400">{t('expenses.noExpenses')}</p>
              <button
                onClick={() => { resetForm(); setShowForm(true) }}
                className="btn btn-primary mt-3 md:mt-4 text-sm md:text-base"
              >
                {t('expenses.addExpense')}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredExpenses.map(expense => (
                <div
                  key={expense.id}
                  className="card p-3 md:p-4 flex items-center justify-between hover:border-orange-500/30 transition-all"
                >
                  <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm md:text-base font-medium truncate flex items-center gap-1 md:gap-2">
                        {expense.name}
                        {expense.recurrence && expense.recurrence !== 'none' && (
                          <span className="text-[10px] md:text-xs bg-blue-500/20 text-blue-400 px-1.5 md:px-2 py-0.5 rounded-full flex items-center gap-0.5 md:gap-1">
                            <RefreshCw className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            {expense.recurrence === 'monthly' ? (language === 'fr' ? '/mois' : '/mo') :
                             expense.recurrence === 'weekly' ? (language === 'fr' ? '/sem' : '/wk') :
                             (language === 'fr' ? '/an' : '/yr')}
                            {expense.isIndefinite && ' ∞'}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] md:text-sm text-gray-400 flex items-center gap-1 md:gap-2 flex-wrap">
                        <span>{formatDate(expense.date)}</span>
                        <span className="text-gray-600 hidden md:inline">•</span>
                        <span className="text-orange-400/70 hidden md:inline">{expense.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 md:gap-3">
                    <div className="text-right">
                      <span className="text-sm md:text-lg font-bold text-orange-400 whitespace-nowrap">
                        -{formatPrice(expense.amount)}
                      </span>
                      {expense.recurrence && expense.recurrence !== 'none' && (
                        <div className="text-[10px] md:text-xs text-gray-500 hidden md:block">
                          {language === 'fr' ? 'Total:' : 'Total:'} {formatPrice(getRecurringTotal(expense))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleEdit(expense)}
                      className="p-1.5 md:p-2 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="p-1.5 md:p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
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
