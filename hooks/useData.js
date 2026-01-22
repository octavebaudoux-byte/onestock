import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { loadSneakers, addSneaker, updateSneaker, deleteSneaker } from '../lib/database'
import { loadData, saveData, generateId } from '../lib/store'

// Hook principal pour gérer les données (Supabase si connecté, sinon localStorage)
export function useData() {
  const { user, isAuthEnabled } = useAuth()
  const [sneakers, setSneakers] = useState([])
  const [loading, setLoading] = useState(true)

  // Charger les données
  const load = useCallback(async () => {
    setLoading(true)

    if (isAuthEnabled && user) {
      // Mode Supabase
      const data = await loadSneakers(user.id)
      setSneakers(data)
    } else {
      // Mode localStorage
      const data = loadData()
      setSneakers(data.sneakers || [])
    }

    setLoading(false)
  }, [user, isAuthEnabled])

  useEffect(() => {
    load()
  }, [load])

  // Ajouter une sneaker
  const add = useCallback(async (sneaker) => {
    if (isAuthEnabled && user) {
      const result = await addSneaker(user.id, sneaker)
      if (result) {
        setSneakers(prev => [result, ...prev])
      }
      return result
    } else {
      // localStorage
      const data = loadData()
      const newSneaker = { ...sneaker, id: sneaker.id || generateId() }
      data.sneakers = [newSneaker, ...data.sneakers]
      saveData(data)
      setSneakers(data.sneakers)
      return newSneaker
    }
  }, [user, isAuthEnabled])

  // Mettre à jour une sneaker
  const update = useCallback(async (sneakerId, updates) => {
    if (isAuthEnabled && user) {
      const result = await updateSneaker(user.id, sneakerId, updates)
      if (result) {
        setSneakers(prev => prev.map(s => s.id === sneakerId ? result : s))
      }
      return result
    } else {
      const data = loadData()
      data.sneakers = data.sneakers.map(s =>
        s.id === sneakerId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      )
      saveData(data)
      setSneakers(data.sneakers)
      return data.sneakers.find(s => s.id === sneakerId)
    }
  }, [user, isAuthEnabled])

  // Supprimer une sneaker
  const remove = useCallback(async (sneakerId) => {
    if (isAuthEnabled && user) {
      const success = await deleteSneaker(user.id, sneakerId)
      if (success) {
        setSneakers(prev => prev.filter(s => s.id !== sneakerId))
      }
      return success
    } else {
      const data = loadData()
      data.sneakers = data.sneakers.filter(s => s.id !== sneakerId)
      saveData(data)
      setSneakers(data.sneakers)
      return true
    }
  }, [user, isAuthEnabled])

  // Sauvegarder (ajouter ou mettre à jour)
  const save = useCallback(async (sneaker) => {
    const existing = sneakers.find(s => s.id === sneaker.id)
    if (existing) {
      return await update(sneaker.id, sneaker)
    } else {
      return await add(sneaker)
    }
  }, [sneakers, update, add])

  // Rafraîchir les données
  const refresh = useCallback(async () => {
    await load()
  }, [load])

  return {
    sneakers,
    loading,
    add,
    update,
    remove,
    save,
    refresh,
    isCloud: isAuthEnabled && !!user,
  }
}
