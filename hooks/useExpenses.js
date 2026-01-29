import { useState, useEffect, useCallback } from 'react'
import { loadData, saveData, generateId } from '../lib/store'

export function useExpenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    const data = loadData()
    setExpenses(data.expenses || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const add = useCallback((expense) => {
    const data = loadData()
    const newExpense = {
      ...expense,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    data.expenses = [newExpense, ...(data.expenses || [])]
    saveData(data)
    setExpenses(data.expenses)
    return newExpense
  }, [])

  const update = useCallback((expenseId, updates) => {
    const data = loadData()
    data.expenses = (data.expenses || []).map(e =>
      e.id === expenseId ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
    )
    saveData(data)
    setExpenses(data.expenses)
    return data.expenses.find(e => e.id === expenseId)
  }, [])

  const remove = useCallback((expenseId) => {
    const data = loadData()
    data.expenses = (data.expenses || []).filter(e => e.id !== expenseId)
    saveData(data)
    setExpenses(data.expenses)
    return true
  }, [])

  return { expenses, loading, add, update, remove, refresh: load }
}
