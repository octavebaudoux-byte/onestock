import { useEffect } from 'react'
import { X, AlertCircle, CheckCircle, Bell } from 'lucide-react'

export default function Toast({ message, platforms, onClose, onRemindLater, autoClose = true }) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, 8000) // 8 secondes pour laisser le temps de lire

      return () => clearTimeout(timer)
    }
  }, [autoClose, onClose])

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideIn">
      <div className="bg-dark-800 border-2 border-emerald-500/50 rounded-2xl shadow-2xl shadow-emerald-500/20 p-5 max-w-md">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />

          <div className="flex-1">
            <p className="text-white font-semibold mb-2">{message}</p>

            {platforms && platforms.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-400 mb-2">
                  N'oubliez pas de retirer l'annonce de :
                </p>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((platform, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs rounded-lg font-medium"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {onRemindLater && platforms && platforms.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={onRemindLater}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
                >
                  <Bell className="w-3 h-3" />
                  Me rappeler plus tard
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-gray-300 text-sm rounded-lg transition-colors"
                >
                  Compris
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1 hover:bg-dark-700 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}
