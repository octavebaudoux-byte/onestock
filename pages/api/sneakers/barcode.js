// API route pour lookup de code-barres via Retailed.io
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { barcode } = req.query

  if (!barcode) {
    return res.status(400).json({ error: 'Barcode parameter required' })
  }

  const apiKey = process.env.RETAILED_API_KEY

  if (!apiKey) {
    return res.status(500).json({
      error: 'API key not configured',
      message: 'Please add RETAILED_API_KEY to your .env.local file'
    })
  }

  try {
    // Retailed.io endpoint avec query params complexes
    const url = `https://app.retailed.io/api/v1/db/variants?where[or][0][and][0][id][equals]=${barcode}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
    })

    if (!response.ok) {
      console.error('Retailed.io API error:', response.status, response.statusText)
      return res.status(response.status).json({
        error: 'API request failed',
        status: response.status
      })
    }

    const data = await response.json()

    // Transformer la réponse Retailed.io en format compatible avec notre app
    if (data.docs && data.docs.length > 0) {
      const results = data.docs.map(item => ({
        id: item.id || item.sku,
        name: item.title || item.model,
        brand: item.brand,
        sku: item.sku,
        colorway: item.color,
        imageUrl: item.images?.[0]?.url || item.images?.[0],
        releaseDate: item.releaseDate,
        size: item.size,
        barcode: item.id,
        barcodeFormats: item.barcodeFormats,
      }))

      return res.status(200).json({ results })
    } else {
      return res.status(200).json({ results: [] })
    }
  } catch (error) {
    console.error('Barcode lookup error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
}