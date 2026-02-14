import { useState, useEffect, useRef, useCallback } from 'react'
import { X, ScanBarcode, Loader2, Keyboard, RotateCcw } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

export default function BarcodeScanner({ isOpen, onClose, onSelectResult }) {
  const { language } = useLanguage()
  const [scanning, setScanning] = useState(false)
  const [scannedCode, setScannedCode] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState(null)
  const scannerRef = useRef(null)
  const html5QrCodeRef = useRef(null)

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState()
        if (state === 2) { // SCANNING
          await html5QrCodeRef.current.stop()
        }
      } catch (e) {
        // ignore
      }
      html5QrCodeRef.current = null
    }
    setScanning(false)
  }, [])

  const searchBarcode = useCallback(async (code) => {
    setIsSearching(true)
    setSearchResults([])
    setError(null)

    try {
      // Utiliser l'API Retailed.io pour chercher par code-barres
      const response = await fetch(`/api/sneakers/barcode?barcode=${encodeURIComponent(code)}`)
      const data = await response.json()

      if (response.ok && data.results?.length > 0) {
        setSearchResults(data.results)
      } else if (response.status === 500 && data.message?.includes('API key')) {
        setError(language === 'fr' ? 'Clé API manquante. Consultez la console.' : 'API key missing. Check console.')
      } else {
        setSearchResults([])
        setError(language === 'fr' ? 'Aucun resultat pour ce code-barres' : 'No results for this barcode')
      }
    } catch {
      setError(language === 'fr' ? 'Erreur de recherche' : 'Search error')
    } finally {
      setIsSearching(false)
    }
  }, [language])

  const startScanner = useCallback(async () => {
    if (!scannerRef.current) return

    try {
      const { Html5Qrcode } = await import('html5-qrcode')

      const scanner = new Html5Qrcode('barcode-reader')
      html5QrCodeRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 280, height: 150 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Barcode detected
          setScannedCode(decodedText)
          stopScanner()
          searchBarcode(decodedText)
        },
        () => {
          // QR code parse error - ignore, keep scanning
        }
      )

      setScanning(true)
      setError(null)
    } catch (err) {
      console.error('Scanner error:', err)
      setError(
        language === 'fr'
          ? 'Impossible d\'acceder a la camera. Verifiez les permissions.'
          : 'Cannot access camera. Check permissions.'
      )
    }
  }, [stopScanner, searchBarcode, language])

  useEffect(() => {
    if (isOpen) {
      setScannedCode(null)
      setSearchResults([])
      setError(null)
      setIsSearching(false)

      // Small delay to let the DOM render
      const timeout = setTimeout(() => {
        startScanner()
      }, 300)

      return () => clearTimeout(timeout)
    } else {
      stopScanner()
    }
  }, [isOpen])

  const handleClose = () => {
    stopScanner()
    onClose()
  }

  const handleSelectResult = (result) => {
    stopScanner()
    onSelectResult({
      name: result.name || '',
      brand: result.brand || '',
      sku: result.sku || '',
      imageUrl: result.imageUrl || '',
    })
  }

  const handleManualEntry = () => {
    stopScanner()
    onSelectResult(null) // null = open modal without pre-fill
  }

  const handleRescan = () => {
    setScannedCode(null)
    setSearchResults([])
    setError(null)
    startScanner()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] bg-dark-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-dark-800 border-b border-blue-500/20">
        <div className="flex items-center gap-2">
          <ScanBarcode className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">
            {language === 'fr' ? 'Scanner une paire' : 'Scan a pair'}
          </h2>
        </div>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Camera / Results area */}
      <div className="flex-1 overflow-y-auto">
        {/* Camera view */}
        {!scannedCode && (
          <div className="flex flex-col items-center px-4 pt-6">
            <div
              ref={scannerRef}
              id="barcode-reader"
              className="w-full max-w-sm rounded-2xl overflow-hidden bg-black"
              style={{ minHeight: '300px' }}
            />

            {scanning && (
              <p className="text-blue-300 text-sm mt-4 text-center animate-pulse">
                {language === 'fr'
                  ? 'Placez le code-barres de la boite dans le cadre'
                  : 'Place the box barcode in the frame'}
              </p>
            )}

            {error && !scannedCode && (
              <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 w-full max-w-sm">
                <p className="text-red-400 text-sm text-center">{error}</p>
                <button
                  onClick={startScanner}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition-colors text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  {language === 'fr' ? 'Reessayer' : 'Retry'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Scanned code + Results */}
        {scannedCode && (
          <div className="px-4 pt-4">
            {/* Scanned code display */}
            <div className="bg-dark-700 border border-blue-500/30 rounded-xl p-3 mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400">
                  {language === 'fr' ? 'Code scanne' : 'Scanned code'}
                </div>
                <div className="text-white font-mono font-bold">{scannedCode}</div>
              </div>
              <button
                onClick={handleRescan}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm px-3 py-1.5 bg-blue-500/10 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {language === 'fr' ? 'Rescanner' : 'Rescan'}
              </button>
            </div>

            {/* Loading */}
            {isSearching && (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                <p className="text-gray-400 text-sm mt-3">
                  {language === 'fr' ? 'Recherche en cours...' : 'Searching...'}
                </p>
              </div>
            )}

            {/* Results list */}
            {searchResults.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  {language === 'fr'
                    ? `${searchResults.length} resultat${searchResults.length > 1 ? 's' : ''}`
                    : `${searchResults.length} result${searchResults.length > 1 ? 's' : ''}`}
                </h3>
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelectResult(result)}
                      className="w-full flex items-center gap-3 p-3 bg-dark-700 hover:bg-dark-600 border border-gray-700 hover:border-blue-500/40 rounded-xl transition-all text-left"
                    >
                      <div className="w-14 h-14 bg-dark-600 rounded-lg overflow-hidden flex-shrink-0">
                        {result.imageUrl ? (
                          <img
                            src={result.imageUrl}
                            alt={result.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">
                            👟
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate text-sm">
                          {result.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {result.brand}
                          {result.colorway && ` • ${result.colorway}`}
                        </div>
                        {result.sku && (
                          <div className="text-xs text-gray-500 font-mono">{result.sku}</div>
                        )}
                      </div>
                      {result.lowestPrice && (
                        <div className="text-sm text-emerald-400 font-medium flex-shrink-0">
                          €{result.lowestPrice}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {!isSearching && searchResults.length === 0 && error && (
              <div className="text-center py-6">
                <div className="text-3xl mb-3">🔍</div>
                <p className="text-gray-400 text-sm mb-1">{error}</p>
                <p className="text-gray-500 text-xs">
                  {language === 'fr'
                    ? 'Essayez la saisie manuelle'
                    : 'Try manual entry'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="px-4 py-3 bg-dark-800 border-t border-blue-500/20 safe-bottom">
        <button
          onClick={handleManualEntry}
          className="w-full flex items-center justify-center gap-2 bg-dark-700 hover:bg-dark-600 border border-gray-600 text-white py-3 rounded-xl transition-colors"
        >
          <Keyboard className="w-4 h-4" />
          {language === 'fr' ? 'Saisie manuelle' : 'Manual entry'}
        </button>
      </div>
    </div>
  )
}