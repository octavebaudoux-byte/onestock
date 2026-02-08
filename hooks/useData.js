import { useState, useEffect, useCallback } from 'react'
import { useWhopAuth } from '../contexts/WhopAuthContext'
import { loadSneakers, addSneaker, updateSneaker, deleteSneaker } from '../lib/database'
import { generateId } from '../lib/store'

// Hook pour gérer les données - 100% Supabase, chaque utilisateur a ses données isolées
export function useData() {
  const { user } = useWhopAuth()
  const [sneakers, setSneakers] = useState([])
  const [loading, setLoading] = useState(true)

  const userId = user?.email || null

  const load = useCallback(async () => {
    if (!userId) {
      setSneakers([])
      setLoading(false)
      return
    }

    setLoading(true)
    const data = await loadSneakers(userId)
    setSneakers(data)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  const add = useCallback(async (sneaker) => {
    if (!userId) return null
    const result = await addSneaker(userId, sneaker)
    if (result) {
      setSneakers(prev => [result, ...prev])
    }
    return result
  }, [userId])

  const update = useCallback(async (sneakerId, updates) => {
    if (!userId) return null
    const result = await updateSneaker(userId, sneakerId, updates)
    if (result) {
      setSneakers(prev => prev.map(s => s.id === sneakerId ? result : s))
    }
    return result
  }, [userId])

  const remove = useCallback(async (sneakerId) => {
    if (!userId) return false
    const success = await deleteSneaker(userId, sneakerId)
    if (success) {
      setSneakers(prev => prev.filter(s => s.id !== sneakerId))
    }
    return success
  }, [userId])

  const save = useCallback(async (sneaker) => {
    const existing = sneakers.find(s => s.id === sneaker.id)
    if (existing) {
      return await update(sneaker.id, sneaker)
    } else {
      return await add({ ...sneaker, id: sneaker.id || generateId() })
    }
  }, [sneakers, update, add])

  return {
    sneakers,
    loading,
    add,
    update,
    remove,
    save,
    refresh: load,
  }
}