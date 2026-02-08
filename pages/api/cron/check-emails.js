import { ImapFlow } from 'imapflow'
import { supabaseServer } from '../../../lib/supabaseServer'

// Sécurité : vérifier que c'est bien Vercel Cron ou un admin
function isAuthorized(req) {
  // Vercel Cron envoie ce header
  if (req.headers['authorization'] === `Bearer ${process.env.CRON_SECRET}`) return true
  // Fallback : header Vercel interne
  if (req.headers['x-vercel-cron']) return true
  return false
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  try {
    // 1. Charger toutes les connexions email actives
    const { data: connections, error: connError } = await supabaseServer
      .from('email_connections')
      .select('*')
      .eq('is_active', true)

    if (connError) throw connError
    if (!connections || connections.length === 0) {
      return res.status(200).json({ message: 'No active connections', checked: 0 })
    }

    let totalNotifs = 0
    const results = []

    // 2. Pour chaque connexion, vérifier les emails
    for (const conn of connections) {
      try {
        const result = await checkUserEmails(conn)
        results.push({ userId: conn.user_id, ...result })
        totalNotifs += result.newNotifs

        // Mettre à jour last_check_at
        await supabaseServer
          .from('email_connections')
          .update({ last_check_at: new Date().toISOString(), last_error: null })
          .eq('id', conn.id)
      } catch (err) {
        console.error(`Error checking emails for ${conn.user_id}:`, err.message)
        results.push({ userId: conn.user_id, error: err.message })

        // Sauvegarder l'erreur
        await supabaseServer
          .from('email_connections')
          .update({ last_error: err.message })
          .eq('id', conn.id)
      }
    }

    return res.status(200).json({
      message: 'Email check completed',
      checked: connections.length,
      totalNotifs,
      results,
    })
  } catch (error) {
    console.error('Cron check-emails error:', error)
    return res.status(500).json({ error: error.message })
  }
}

async function checkUserEmails(conn) {
  // Charger les triggers de cet utilisateur
  const { data: triggers, error: trigError } = await supabaseServer
    .from('email_triggers')
    .select('*')
    .eq('user_id', conn.user_id)

  if (trigError) throw trigError
  if (!triggers || triggers.length === 0) {
    return { newNotifs: 0, message: 'No triggers configured' }
  }

  // Chercher les emails depuis le dernier check (ou 24h par défaut)
  const sinceDate = conn.last_check_at
    ? new Date(conn.last_check_at)
    : new Date(Date.now() - 24 * 60 * 60 * 1000)

  // Connexion IMAP
  const client = new ImapFlow({
    host: conn.imap_host || 'imap.gmail.com',
    port: conn.imap_port || 993,
    secure: true,
    auth: {
      user: conn.email,
      pass: conn.app_password,
    },
    logger: false,
  })

  let newNotifs = 0

  try {
    await client.connect()

    // Ouvrir INBOX en lecture seule
    await client.mailboxOpen('INBOX', { readOnly: true })

    // Chercher les emails depuis la dernière vérification
    const since = sinceDate.toISOString().split('T')[0] // Format YYYY-MM-DD
    const searchResult = await client.search({ since: new Date(since) })

    if (!searchResult || searchResult.length === 0) {
      return { newNotifs: 0, message: 'No new emails' }
    }

    // Récupérer les messages (max 100 pour ne pas surcharger)
    const uidsToFetch = searchResult.slice(-100)

    for await (const msg of client.fetch(uidsToFetch, {
      envelope: true,
      bodyStructure: true,
      source: { maxBytes: 2000 }, // Juste le début du mail
    })) {
      const uid = String(msg.uid)
      const subject = msg.envelope?.subject || ''
      const from = msg.envelope?.from?.[0]?.address || ''
      const date = msg.envelope?.date

      // Extraire un snippet du body si disponible
      let snippet = ''
      if (msg.source) {
        const raw = msg.source.toString('utf-8')
        // Extraire du texte simple à partir du raw
        const textMatch = raw.match(/\r\n\r\n([\s\S]{0,500})/)
        if (textMatch) {
          snippet = textMatch[1]
            .replace(/<[^>]*>/g, '') // Retirer HTML
            .replace(/\s+/g, ' ')    // Normaliser espaces
            .trim()
            .slice(0, 200)
        }
      }

      // Vérifier chaque trigger
      const searchText = `${subject} ${snippet}`.toLowerCase()

      for (const trigger of triggers) {
        const phrase = trigger.phrase.toLowerCase()

        if (searchText.includes(phrase)) {
          // Vérifier si cette notification existe déjà
          const emailUid = `email-${conn.user_id}-${uid}-${trigger.id}`

          const { data: existing } = await supabaseServer
            .from('email_notifications')
            .select('id')
            .eq('user_id', conn.user_id)
            .eq('email_uid', emailUid)
            .single()

          if (!existing) {
            // Créer la notification
            await supabaseServer
              .from('email_notifications')
              .insert({
                user_id: conn.user_id,
                trigger_phrase: trigger.phrase,
                trigger_label: trigger.label,
                email_subject: subject.slice(0, 500),
                email_from: from.slice(0, 200),
                email_snippet: snippet.slice(0, 500),
                email_date: date ? new Date(date).toISOString() : new Date().toISOString(),
                email_uid: emailUid,
              })

            newNotifs++
          }
        }
      }
    }

    return { newNotifs, message: `Checked ${uidsToFetch.length} emails` }
  } finally {
    try {
      await client.logout()
    } catch {}
  }
}

// Augmenter le timeout pour Vercel (IMAP peut être lent)
export const config = {
  maxDuration: 60,
}