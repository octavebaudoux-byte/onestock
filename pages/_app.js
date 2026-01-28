import '../styles/globals.css'
import { WhopAuthProvider } from '../contexts/WhopAuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <WhopAuthProvider>
        <Component {...pageProps} />
      </WhopAuthProvider>
    </ThemeProvider>
  )
}
