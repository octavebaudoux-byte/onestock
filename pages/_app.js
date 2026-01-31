import '../styles/globals.css'
import { WhopAuthProvider } from '../contexts/WhopAuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { LanguageProvider } from '../contexts/LanguageContext'
import { ToastProvider } from '../contexts/ToastContext'

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <WhopAuthProvider>
            <Component {...pageProps} />
          </WhopAuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
