import { useState, useEffect, useCallback } from 'react'
import { useWhopAuth } from '../contexts/WhopAuthContext'
import { loadExpenses, addExpense, updateExpense, deleteExpense } from '../lib/database'

export function useExpenses() {
  const { user } = useWhopAuth()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  const userId = user?.email || null

  const load = useCallback(async () => {
    if (!userId) {
      setExpenses([])
      setLoading(false)
      return
    }

    setLoading(true)
    const data = await loadExpenses(userId)
    setExpenses(data)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  const add = useCallback(async (expense) => {
    if (!userId) return null
    const result = await addExpense(userId, expense)
    if (result) {
      setExpenses(prev => [result, ...prev])
    }
    return result
  }, [userId])

  const update = useCallback(async (expenseId, updates) => {
    if (!userId) return null
    const result = await updateExpense(userId, expenseId, updates)
    if (result) {
      setExpenses(prev => prev.map(e => e.id === expenseId ? result : e))
    }
    return result
  }, [userId])

  const remove = useCallback(async (expenseId) => {
    if (!userId) return false
    const success = await deleteExpense(userId, expenseId)
    if (success) {
      setExpenses(prev => prev.filter(e => e.id !== expenseId))
    }
    return success
  }, [userId])

  return { expenses, loading, add, update, remove, refresh: load }
}