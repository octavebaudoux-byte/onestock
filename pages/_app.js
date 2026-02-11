import '../styles/globals.css'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/router'
import { WhopAuthProvider } from '../contexts/WhopAuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { LanguageProvider } from '../contexts/LanguageContext'
import { ToastProvider } from '../contexts/ToastContext'
import { NotificationProvider } from '../contexts/NotificationContext'

export default function App({ Component, pageProps }) {
  const router = useRouter()

  // Enregistrer le service worker pour la PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ PWA Service Worker enregistré')
        })
        .catch((error) => {
          console.log('❌ Erreur Service Worker:', error)
        })
    }

    // Demander la permission de notifications après 5 secondes
    const notifTimer = setTimeout(() => {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }, 5000)

    return () => clearTimeout(notifTimer)
  }, [])

  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <WhopAuthProvider>
            <NotificationProvider>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={router.route}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <Component {...pageProps} />
                </motion.div>
              </AnimatePresence>
            </NotificationProvider>
          </WhopAuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}