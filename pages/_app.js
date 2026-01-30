import '../styles/globals.css'
import { WhopAuthProvider } from '../contexts/WhopAuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { LanguageProvider } from '../contexts/LanguageContext'

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <WhopAuthProvider>
          <Component {...pageProps} />
        </WhopAuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
