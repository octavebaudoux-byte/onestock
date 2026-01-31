import { useState, useEffect } from 'react'
import Head from 'next/head'
import { ChevronLeft, ChevronRight, X, Trash2 } from 'lucide-react'
import Layout from '../components/Layout'
import { useLanguage } from '../contexts/LanguageContext'

export default function Calendar() {
  const { language } = useLanguage()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
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
    localStorage.setItem('calendar_events', JSON.stringify(events))
  }, [events])

  const categories = {
    drop: {
      label: language === 'fr' ? 'Drop/Sortie' : 'Drop/Release',
      color: 'bg-blue-500',
      textColor: 'text-blue-400'
    },
    delivery: {
      label: language === 'fr' ? 'Livraison' : 'Delivery',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400'
    },
    sale: {
      label: language === 'fr' ? 'Vente' : 'Sale',
      color: 'bg-orange-500',
      textColor: 'text-orange-400'
    },
    other: {
      label: language === 'fr' ? 'Autre' : 'Other',
      color: 'bg-purple-500',
      textColor: 'text-purple-400'
    }
  }

  // Get calendar days for current month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = language === 'fr'
    ? ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const dayNames = language === 'fr'
    ? ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleDayClick = (date) => {
    if (!date) return
    setSelectedDate(date)
    setEditingEvent(null)
    setFormData({
      title: '',
      time: '',
      description: '',
      category: 'other'
    })
    setShowModal(true)
  }

  const getEventsForDate = (date) => {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(evt => evt.date === dateStr)
  }

  const isToday = (date) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const dateStr = selectedDate.toISOString().split('T')[0]

    if (editingEvent) {
      // Update existing event
      setEvents(events.map(evt =>
        evt.id === editingEvent.id
          ? { ...formData, date: dateStr, id: editingEvent.id }
          : evt
      ))
    } else {
      // Add new event
      const newEvent = {
        ...formData,
        date: dateStr,
        id: Date.now().toString()
      }
      setEvents([...events, newEvent])
    }

    setShowModal(false)
    setSelectedDate(null)
    setEditingEvent(null)
  }

  const handleEditEvent = (event, date) => {
    setSelectedDate(date)
    setEditingEvent(event)
    setFormData({
      title: event.title,
      time: event.time,
      description: event.description,
      category: event.category
    })
    setShowModal(true)
  }

  const handleDeleteEvent = (eventId) => {
    if (confirm(language === 'fr' ? 'Supprimer cet événement ?' : 'Delete this event?')) {
      setEvents(events.filter(evt => evt.id !== eventId))
    }
  }

  return (
    <>
      <Head>
        <title>{language === 'fr' ? 'Calendrier' : 'Calendar'} - OneStock</title>
      </Head>

      <Layout>
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h1>
                <p className="text-gray-400">{language === 'fr' ? 'Cliquez sur un jour pour ajouter un événement' : 'Click on a day to add an event'}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToday}
                  className="px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors text-sm font-medium"
                >
                  {language === 'fr' ? 'Aujourd\'hui' : 'Today'}
                </button>
                <button
                  onClick={handlePrevMonth}
                  className="p-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-6">
              {Object.entries(categories).map(([key, cat]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                  <span className="text-sm text-gray-400">{cat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-dark-800 rounded-2xl border border-blue-500/20 overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-gray-700">
              {dayNames.map((day, index) => (
                <div
                  key={index}
                  className="p-3 text-center text-sm font-semibold text-gray-400 border-r border-gray-700 last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 auto-rows-fr">
              {days.map((date, index) => {
                const dayEvents = getEventsForDate(date)
                const isTodayDate = isToday(date)

                return (
                  <div
                    key={index}
                    onClick={() => handleDayClick(date)}
                    className={`min-h-[70px] md:min-h-[80px] p-1.5 border-r border-b border-gray-700 last:border-r-0 transition-all ${
                      date
                        ? 'hover:bg-dark-700 cursor-pointer'
                        : 'bg-dark-900/50'
                    } ${
                      isTodayDate ? 'bg-blue-500/10 border-blue-500/30' : ''
                    }`}
                  >
                    {date && (
                      <>
                        <div className={`text-xs font-semibold mb-1 ${
                          isTodayDate
                            ? 'text-blue-400'
                            : date.getMonth() !== currentDate.getMonth()
                            ? 'text-gray-600'
                            : 'text-gray-300'
                        }`}>
                          {date.getDate()}
                        </div>

                        {/* Events for this day */}
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditEvent(event, date)
                              }}
                              className={`group relative px-1.5 py-0.5 rounded text-[10px] font-medium truncate ${categories[event.category].color} text-white hover:ring-1 hover:ring-white/50 transition-all`}
                            >
                              {event.time && <span className="mr-1">{event.time}</span>}
                              {event.title}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteEvent(event.id)
                                }}
                                className="absolute right-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/20 rounded transition-all"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[10px] text-gray-500 px-1">
                              +{dayEvents.length - 2}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Add/Edit Event Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark-800 rounded-2xl border border-gray-700 max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {editingEvent
                      ? (language === 'fr' ? 'Modifier l\'événement' : 'Edit Event')
                      : (language === 'fr' ? 'Nouvel événement' : 'New Event')
                    }
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {selectedDate?.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedDate(null)
                    setEditingEvent(null)
                  }}
                  className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder={language === 'fr' ? 'Ex: Drop Jordan 4' : 'Ex: Jordan 4 Drop'}
                    className="w-full px-4 py-2 bg-dark-700 border border-gray-600 rounded-lg focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    {language === 'fr' ? 'Catégorie' : 'Category'} *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(categories).map(([key, cat]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: key })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.category === key
                            ? `${cat.color} border-white text-white font-semibold`
                            : 'bg-dark-700 border-gray-600 text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    {language === 'fr' ? 'Heure (optionnel)' : 'Time (optional)'}
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-700 border border-gray-600 rounded-lg focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    {language === 'fr' ? 'Description (optionnel)' : 'Description (optional)'}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={language === 'fr' ? 'Détails supplémentaires...' : 'Additional details...'}
                    rows={3}
                    className="w-full px-4 py-2 bg-dark-700 border border-gray-600 rounded-lg focus:border-cyan-400 focus:outline-none resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setSelectedDate(null)
                      setEditingEvent(null)
                    }}
                    className="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors font-medium"
                  >
                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                  </button>
                  {editingEvent && (
                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteEvent(editingEvent.id)
                        setShowModal(false)
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors font-medium"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg transition-all font-medium"
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
