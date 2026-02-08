import Link from 'next/link'
import { useRouter } from 'next/router'
import Logo from './Logo'
import GlobalSearchHeader from './GlobalSearchHeader'
import PageTransition from './PageTransition'
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  ShoppingBag,
  Plus,
  DollarSign,
  Download,
  Settings,
  CreditCard,
  Search,
  Calendar,
  User
} from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

export default function Layout({ children, onAddClick, onAddSaleClick, onExportClick }) {
  const router = useRouter()
  const { t, language } = useLanguage()

  const GmailIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="currentColor"/>
    </svg>
  )

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
    { href: '/price-checker', icon: Search, label: language === 'fr' ? 'Prix' : 'Prices' },
    { href: '/inventory', icon: Package, label: t('nav.inventory') },
    { href: '/sales', icon: ShoppingBag, label: t('nav.sales') },
    { href: '/expenses', icon: CreditCard, label: t('nav.expenses') },
    { href: '/accounts', icon: User, label: language === 'fr' ? 'Comptes' : 'Accounts' },
    { href: '/stats', icon: TrendingUp, label: t('nav.stats') },
    { href: '/calendar', icon: Calendar, label: language === 'fr' ? 'Calendrier' : 'Calendar' },
    { href: '/email', icon: GmailIcon, label: 'Email' },
    { href: '/settings', icon: Settings, label: t('nav.settings') },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-x-hidden">
      {/* Sidebar desktop - fixed, no scroll */}
      <aside className="hidden md:flex w-[60px] bg-dark-800 border-r border-blue-500/20 flex-col fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="h-12 flex items-center justify-center border-b border-blue-500/20 shrink-0">
          <Logo size="sm" showText={false} />
        </div>

        {/* Nav icons - flex column, equal spacing, no scroll */}
        <nav className="flex-1 flex flex-col justify-between py-1.5 px-1.5">
          <ul className="flex flex-col gap-[2px]">
            {navItems.map((item) => {
              const isActive = router.pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group relative flex items-center justify-center w-full aspect-square rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-blue-200/70 hover:text-white hover:bg-dark-600'
                    }`}
                    title={item.label}
                  >
                    <item.icon className="w-[18px] h-[18px]" />
                    <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-dark-700 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-blue-500/20">
                      {item.label}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Action buttons */}
        <div className="px-1.5 py-1.5 border-t border-blue-500/20 flex flex-col gap-[2px] shrink-0">
          <button
            onClick={onAddClick}
            className="group relative w-full aspect-square btn btn-primary flex items-center justify-center rounded-lg"
            title={t('actions.addToStock')}
          >
            <Plus className="w-[18px] h-[18px]" />
            <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-dark-700 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-blue-500/20">
              {t('actions.addToStock')}
            </span>
          </button>
          {onAddSaleClick && (
            <button
              onClick={onAddSaleClick}
              className="group relative w-full aspect-square btn flex items-center justify-center rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white"
              title={t('actions.recordSale')}
            >
              <DollarSign className="w-[18px] h-[18px]" />
              <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-dark-700 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-blue-500/20">
                {t('actions.recordSale')}
              </span>
            </button>
          )}
          {onExportClick && (
            <button
              onClick={onExportClick}
              className="group relative w-full aspect-square btn btn-secondary flex items-center justify-center rounded-lg"
              title={t('actions.export')}
            >
              <Download className="w-4 h-4" />
              <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-dark-700 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-blue-500/20">
                {t('actions.export')}
              </span>
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto md:ml-[60px] pb-16 md:pb-0">
        <GlobalSearchHeader />
        <PageTransition>
          {children}
        </PageTransition>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-800/95 backdrop-blur-lg border-t border-blue-500/20 z-30 safe-bottom">
        <div className="flex items-center px-1 py-1.5">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex items-center justify-center h-8 rounded-md transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 active:scale-95'
                }`}
              >
                <item.icon className="w-[15px] h-[15px]" />
              </Link>
            )
          })}
          <button
            onClick={onAddClick}
            className="flex-1 flex items-center justify-center h-8 rounded-md bg-blue-600 text-white active:scale-95 transition-transform mx-0.5"
          >
            <Plus className="w-[15px] h-[15px]" />
          </button>
        </div>
      </nav>
    </div>
  )
}