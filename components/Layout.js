import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  ShoppingBag,
  Plus,
  DollarSign,
  Download,
  Settings
} from 'lucide-react'

export default function Layout({ children, onAddClick, onAddSaleClick, onExportClick }) {
  const router = useRouter()

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/inventory', icon: Package, label: 'Inventaire' },
    { href: '/sales', icon: ShoppingBag, label: 'Ventes' },
    { href: '/stats', icon: TrendingUp, label: 'Stats' },
    { href: '/settings', icon: Settings, label: 'Paramètres' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-800 border-r border-blue-500/20 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-blue-500/20">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">👟</span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              OneStock
            </span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = router.pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-blue-200/70 hover:text-white hover:bg-dark-600'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Add buttons */}
        <div className="p-4 border-t border-blue-500/20 space-y-2">
          <button
            onClick={onAddClick}
            className="w-full btn btn-primary flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Ajouter au stock
          </button>
          {onAddSaleClick && (
            <button
              onClick={onAddSaleClick}
              className="w-full btn flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              <DollarSign className="w-5 h-5" />
              Enregistrer une vente
            </button>
          )}
          {onExportClick && (
            <button
              onClick={onExportClick}
              className="w-full btn btn-secondary flex items-center justify-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
