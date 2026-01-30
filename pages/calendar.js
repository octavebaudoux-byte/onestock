import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Calendar as CalendarIcon, Plus, X, Trash2, Edit } from 'lucide-react'
import Layout from '../components/Layout'
import { useLanguage } from '../contexts/LanguageContext'

export default function Calendar() {
  const { language } = useLanguage()
  const [events, setEvents] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    category: 'other'
  })

  // Load events from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('calendar_events')
    if (saved) {
      setEvents(JSON.parse(saved))
    }
  }, [])

  // Save events to localStorage
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('calendar_events', JSON.stringify(events))
    }
  }, [events])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (editingEvent) {
      // Update existing event
      setEvents(events.map(evt =>
        evt.id === editingEvent.id
          ? { ...formData, id: editingEvent.id }
          : evt
      ))
    } else {
      // Add new event
      const newEvent = {
        ...formData,
        id: Date.now().toString()
      }
      setEvents([...events, newEvent])
    }

    // Reset form
    setFormData({
      title: '',
      date: '',
      time: '',
      description: '',
      category: 'other'
    })
    setEditingEvent(null)
    setShowModal(false)
  }

  const handleEdit = (event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      description: event.description,
      category: event.category
    })
    setShowModal(true)
  }

  const handleDelete = (id) => {
    setEvents(events.filter(evt => evt.id !== id))
  }

  const openAddModal = () => {
    setEditingEvent(null)
    setFormData({
      title: '',
      date: '',
      time: '',
      description: '',
      category: 'other'
    })
    setShowModal(true)
  }

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.date + ' ' + (a.time || '00:00'))
    const dateB = new Date(b.date + ' ' + (b.time || '00:00'))
    return dateA - dateB
  })

  // Separate upcoming and past events
  const now = new Date()
  const upcomingEvents = sortedEvents.filter(evt => new Date(evt.date) >= now)
  const pastEvents = sortedEvents.filter(evt => new Date(evt.date) < now)

  const categories = {
    drop: { label: language === 'fr' ? 'Drop/Sortie' : 'Drop/Release', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' },
    delivery: { label: language === 'fr' ? 'Livraison' : 'Delivery', color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30' },
    sale: { label: language === 'fr' ? 'Vente' : 'Sale', color: 'from-orange-500/20 to-red-500/20 border-orange-500/30' },
    other: { label: language === 'fr' ? 'Autre' : 'Other', color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30' }
  }

  return (
    <>
      <Head>
        <title>{language === 'fr' ? 'Calendrier' : 'Calendar'} - OneStock</title>
      </Head>

      <Layout>
        <div className="min-h-screen p-4 md:p-8">
          {/* Header */}
          <div className="max-w-6xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl border border-blue-500/30">
                  <CalendarIcon className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent">
                    {language === 'fr' ? 'Calendrier' : 'Calendar'}
                  </h1>
                  <p className="text-gray-400 text-sm md:text-base">
                    {language === 'fr' ? 'Gérez vos événements et rappels' : 'Manage your events and reminders'}
                  </p>
                </div>
              </div>

              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden md:inline">{language === 'fr' ? 'Ajouter' : 'Add Event'}</span>
              </button>
            </div>

            {/* Upcoming Events */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                {language === 'fr' ? 'Événements à venir' : 'Upcoming Events'} ({upcomingEvents.length})
              </h2>

              {upcomingEvents.length === 0 ? (
                <div className="card p-8 text-center">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-gray-400">
                    {language === 'fr' ? 'Aucun événement à venir' : 'No upcoming events'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingEvents.map(event => (
                    <div
                      key={event.id}
                      className={`card p-6 bg-gradient-to-br ${categories[event.category].color}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-dark-700/50 rounded-lg text-xs font-semibold text-blue-300">
                              {categories[event.category].label}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>📅 {new Date(event.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}</span>
                            {event.time && <span>🕐 {event.time}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(event)}
                            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-gray-300 text-sm">{event.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  {language === 'fr' ? 'Événements passés' : 'Past Events'} ({pastEvents.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60">
                  {pastEvents.map(event => (
                    <div
                      key={event.id}
                      className="card p-6 bg-dark-800/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-400 mb-2">{event.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>📅 {new Date(event.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}</span>
                            {event.time && <span>🕐 {event.time}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      {event.description && (
                        <p className="text-gray-500 text-sm">{event.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Event Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="card max-w-2xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingEvent
                    ? (language === 'fr' ? 'Modifier l\'événement' : 'Edit Event')
                    : (language === 'fr' ? 'Ajouter un événement' : 'Add Event')
                  }
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingEvent(null)
                  }}
                  className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    {language === 'fr' ? 'Titre' : 'Title'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={language === 'fr' ? 'Ex: Drop Jordan 4 Military Black' : 'Ex: Jordan 4 Military Black Drop'}
                    className="input w-full"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    {language === 'fr' ? 'Catégorie' : 'Category'} *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input w-full"
                  >
                    {Object.entries(categories).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      {language === 'fr' ? 'Date' : 'Date'} *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      {language === 'fr' ? 'Heure' : 'Time'}
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="input w-full"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    {language === 'fr' ? 'Description' : 'Description'}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={language === 'fr' ? 'Détails supplémentaires...' : 'Additional details...'}
                    rows={4}
                    className="input w-full"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingEvent(null)
                    }}
                    className="flex-1 btn btn-secondary"
                  >
                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                  >
                    {editingEvent
                      ? (language === 'fr' ? 'Modifier' : 'Update')
                      : (language === 'fr' ? 'Ajouter' : 'Add')
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Layout>
    </>
  )
}
