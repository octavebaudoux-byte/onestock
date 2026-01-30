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
      {/* Compact Sidebar - icons only */}
      <aside className="hidden md:flex w-20 bg-dark-800 border-r border-blue-500/20 flex-col fixed inset-y-0 left-0 z-30">
        {/* Logo - compact */}
        <div className="p-4 border-b border-blue-500/20 flex items-center justify-center">
          <Logo size="sm" />
        </div>

        {/* Navigation - icons only with tooltips */}
        <nav className="flex-1 p-2 pt-4">
          <ul className="space-y-3">
            {navItems.map((item) => {
              const isActive = router.pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group relative flex items-center justify-center w-full h-14 rounded-xl transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-blue-200/70 hover:text-white hover:bg-dark-600'
                    }`}
                    title={item.label}
                  >
                    <item.icon className="w-6 h-6" />
                    {/* Tooltip */}
                    <span className="absolute left-full ml-4 px-3 py-2 bg-dark-700 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-blue-500/20">
                      {item.label}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Add buttons - icons only */}
        <div className="p-2 border-t border-blue-500/20 space-y-2">
          <button
            onClick={onAddClick}
            className="group relative w-full h-14 btn btn-primary flex items-center justify-center rounded-xl"
            title="Ajouter au stock"
          >
            <Plus className="w-6 h-6" />
            <span className="absolute left-full ml-4 px-3 py-2 bg-dark-700 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-blue-500/20">
              Ajouter au stock
            </span>
          </button>
          {onAddSaleClick && (
            <button
              onClick={onAddSaleClick}
              className="group relative w-full h-14 btn flex items-center justify-center rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white"
              title="Vente"
            >
              <DollarSign className="w-6 h-6" />
              <span className="absolute left-full ml-4 px-3 py-2 bg-dark-700 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-blue-500/20">
                Enregistrer une vente
              </span>
            </button>
          )}
          {onExportClick && (
            <button
              onClick={onExportClick}
              className="group relative w-full h-12 btn btn-secondary flex items-center justify-center rounded-xl"
              title="Exporter"
            >
              <Download className="w-5 h-5" />
              <span className="absolute left-full ml-4 px-3 py-2 bg-dark-700 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-blue-500/20">
                Exporter CSV
              </span>
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto md:ml-20 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom navigation - icons only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-800/95 backdrop-blur-lg border-t border-blue-500/20 z-30 safe-bottom">
        <div className="flex items-center justify-around px-1 py-3">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-400 active:scale-95'
                }`}
              >
                <item.icon className="w-6 h-6" />
              </Link>
            )
          })}
          <button
            onClick={onAddClick}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-600 text-white shadow-lg shadow-cyan-500/30 active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </nav>
    </div>
  )
}
