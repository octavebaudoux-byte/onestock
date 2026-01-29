import { useState, useEffect, useCallback } from 'react'
import { useWhopAuth } from '../contexts/WhopAuthContext'
import { loadSneakers, addSneaker, updateSneaker, deleteSneaker } from '../lib/database'
import { isSupabaseConfigured } from '../lib/supabase'
import { loadData, saveData, generateId } from '../lib/store'

// Hook principal pour gérer les données (Supabase si connecté, sinon localStorage)
export function useData() {
  const { user } = useWhopAuth()
  const [sneakers, setSneakers] = useState([])
  const [loading, setLoading] = useState(true)

  // Utiliser l'email comme userId pour Supabase
  const userId = user?.email || null
  const useCloud = isSupabaseConfigured() && !!userId

  // Charger les données
  const load = useCallback(async () => {
    setLoading(true)

    if (useCloud) {
      // Mode Supabase
      const data = await loadSneakers(userId)
      setSneakers(data)
    } else {
      // Mode localStorage
      const data = loadData()
      setSneakers(data.sneakers || [])
    }

    setLoading(false)
  }, [userId, useCloud])

  useEffect(() => {
    load()
  }, [load])

  // Ajouter une sneaker
  const add = useCallback(async (sneaker) => {
    if (useCloud) {
      const result = await addSneaker(userId, sneaker)
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
  }, [userId, useCloud])

  // Mettre à jour une sneaker
  const update = useCallback(async (sneakerId, updates) => {
    if (useCloud) {
      const result = await updateSneaker(userId, sneakerId, updates)
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
  }, [userId, useCloud])

  // Supprimer une sneaker
  const remove = useCallback(async (sneakerId) => {
    if (useCloud) {
      const success = await deleteSneaker(userId, sneakerId)
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
  }, [userId, useCloud])

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
    isCloud: useCloud,
  }
}
