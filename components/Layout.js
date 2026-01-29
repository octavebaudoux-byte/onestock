import Link from 'next/link'
import { useRouter } from 'next/router'
import Logo from './Logo'
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  ShoppingBag,
  Plus,
  DollarSign,
  Download,
  Settings,
  CreditCard
} from 'lucide-react'

export default function Layout({ children, onAddClick, onAddSaleClick, onExportClick }) {
  const router = useRouter()

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/inventory', icon: Package, label: 'Inventaire' },
    { href: '/sales', icon: ShoppingBag, label: 'Ventes' },
    { href: '/expenses', icon: CreditCard, label: 'Dépenses' },
    { href: '/stats', icon: TrendingUp, label: 'Stats' },
    { href: '/settings', icon: Settings, label: 'Paramètres' },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - hidden on mobile */}
      <aside className="hidden md:flex w-64 bg-dark-800 border-r border-blue-500/20 flex-col fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="p-6 border-b border-blue-500/20">
          <Logo size="md" />
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
      <main className="flex-1 overflow-auto md:ml-64 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-blue-500/20 z-30 safe-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-blue-400'
                    : 'text-gray-500'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : ''}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
          <button
            onClick={onAddClick}
            className="flex flex-col items-center gap-1 px-3 py-2 text-cyan-400"
          >
            <Plus className="w-6 h-6" />
            <span className="text-[10px] font-medium">Ajouter</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
