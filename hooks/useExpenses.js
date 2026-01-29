import { useState, useEffect, useCallback } from 'react'
import { useWhopAuth } from '../contexts/WhopAuthContext'
import { loadExpenses, addExpense, updateExpense, deleteExpense } from '../lib/database'
import { isSupabaseConfigured } from '../lib/supabase'
import { loadData, saveData, generateId } from '../lib/store'

export function useExpenses() {
  const { user } = useWhopAuth()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  // Utiliser l'email comme userId pour Supabase
  const userId = user?.email || null
  const useCloud = isSupabaseConfigured() && !!userId

  const load = useCallback(async () => {
    setLoading(true)

    if (useCloud) {
      // Mode Supabase
      const data = await loadExpenses(userId)
      setExpenses(data)
    } else {
      // Mode localStorage
      const data = loadData()
      setExpenses(data.expenses || [])
    }

    setLoading(false)
  }, [userId, useCloud])

  useEffect(() => {
    load()
  }, [load])

  const add = useCallback(async (expense) => {
    if (useCloud) {
      const result = await addExpense(userId, expense)
      if (result) {
        setExpenses(prev => [result, ...prev])
      }
      return result
    } else {
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
    }
  }, [userId, useCloud])

  const update = useCallback(async (expenseId, updates) => {
    if (useCloud) {
      const result = await updateExpense(userId, expenseId, updates)
      if (result) {
        setExpenses(prev => prev.map(e => e.id === expenseId ? result : e))
      }
      return result
    } else {
      const data = loadData()
      data.expenses = (data.expenses || []).map(e =>
        e.id === expenseId ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
      )
      saveData(data)
      setExpenses(data.expenses)
      return data.expenses.find(e => e.id === expenseId)
    }
  }, [userId, useCloud])

  const remove = useCallback(async (expenseId) => {
    if (useCloud) {
      const success = await deleteExpense(userId, expenseId)
      if (success) {
        setExpenses(prev => prev.filter(e => e.id !== expenseId))
      }
      return success
    } else {
      const data = loadData()
      data.expenses = (data.expenses || []).filter(e => e.id !== expenseId)
      saveData(data)
      setExpenses(data.expenses)
      return true
    }
  }, [userId, useCloud])

  return { expenses, loading, add, update, remove, refresh: load, isCloud: useCloud }
}
