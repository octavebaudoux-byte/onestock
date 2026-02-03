import { useState } from 'react'
import { Edit2, Trash2, Eye, EyeOff, Copy, Check, Mail, Lock } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useToast } from '../contexts/ToastContext'

export default function AccountCard({ account, onEdit, onDelete }) {
  const { language } = useLanguage()
  const { showToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [copiedField, setCopiedField] = useState(null)

  async function copyToClipboard(text, field) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      showToast(language === 'fr' ? 'Copié' : 'Copied', 'success')
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      showToast(language === 'fr' ? 'Erreur' : 'Error', 'error')
    }
  }

  return (
    <div className="card p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      {/* Header avec site */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-white">{account.site}</h3>
          {account.notes && (
            <p className="text-xs text-gray-500 mt-1">{account.notes}</p>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(account)}
            className="p-2 hover:bg-blue-600/20 text-blue-400 rounded-lg transition-colors"
            title={language === 'fr' ? 'Modifier' : 'Edit'}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="p-2 hover:bg-red-600/20 text-red-400 rounded-lg transition-colors"
            title={language === 'fr' ? 'Supprimer' : 'Delete'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Email */}
      <div className="mb-3">
        <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
          <Mail className="w-3 h-3" />
          <span>Email</span>
        </div>
        <div className="flex items-center gap-2 bg-dark-700 rounded-lg px-3 py-2">
          <span className="text-sm text-gray-300 flex-1 truncate">{account.email}</span>
          <button
            onClick={() => copyToClipboard(account.email, 'email')}
            className="p-1 hover:bg-dark-600 rounded transition-colors shrink-0"
          >
            {copiedField === 'email' ? (
              <Check className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Mot de passe */}
      <div>
        <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
          <Lock className="w-3 h-3" />
          <span>{language === 'fr' ? 'Mot de passe' : 'Password'}</span>
        </div>
        <div className="flex items-center gap-2 bg-dark-700 rounded-lg px-3 py-2">
          <span className="text-sm text-gray-300 font-mono flex-1">
            {showPassword ? account.password : '••••••••'}
          </span>
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="p-1 hover:bg-dark-600 rounded transition-colors shrink-0"
          >
            {showPassword ? (
              <EyeOff className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>
          <button
            onClick={() => copyToClipboard(account.password, 'password')}
            className="p-1 hover:bg-dark-600 rounded transition-colors shrink-0"
          >
            {copiedField === 'password' ? (
              <Check className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
