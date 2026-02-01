import '../styles/globals.css'
import { AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'
import { WhopAuthProvider } from '../contexts/WhopAuthProvider'
import { ThemeProvider } from '../contexts/ThemeContext'
import { LanguageProvider } from '../contexts/LanguageContext'
import { ToastProvider } from '../contexts/ToastContext'

export default function App({ Component, pageProps }) {
  const router = useRouter()

  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <WhopAuthProvider>
            <AnimatePresence mode="wait" initial={false}>
              <Component {...pageProps} key={router.route} />
            </AnimatePresence>
          </WhopAuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
