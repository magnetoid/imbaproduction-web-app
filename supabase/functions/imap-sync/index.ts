// imap-sync — pull new mail over IMAP into crm_inbox_messages.
//
// ⚠️ SPIKE / UNVERIFIED: research flagged two unknowns that MUST be validated
// before relying on this in production (see ./README.md):
//   1. Whether `deno-imap` runs inside the Supabase edge runtime, which needs
//      outbound TCP/TLS sockets (Deno.connect / Deno.connectTls). If the edge
//      sandbox forbids raw sockets, run this logic as an EXTERNAL WORKER (a
//      small Deno/Node process on a VM/Cloud Run) hitting the same DB instead.
//   2. `deno-imap`'s UID-based cursor support (refuted 1-2 in research). If UID
//      operations are unreliable, swap the client or track by Message-ID.
//
// The sync is idempotent: crm_inbox_messages has a UNIQUE (mailbox, uid) index
// (migration V014), so re-runs never double-insert.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// NOTE: verify this specifier resolves in the edge runtime; pin a version.
import { ImapClient } from 'jsr:@workingdevshero/deno-imap'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Settings {
  imap_host: string
  imap_port: string
  imap_username: string
  imap_password: string
  imap_secure: boolean
  imap_mailbox: string
  imap_last_uid: number
  imap_uidvalidity: number
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Missing Supabase env' }, 500)
  const admin = createClient(supabaseUrl, serviceRoleKey)

  // 1. Load IMAP config from the single runtime-settings row.
  const { data: s, error: sErr } = await admin
    .from('crm_runtime_settings')
    .select('imap_host,imap_port,imap_username,imap_password,imap_secure,imap_mailbox,imap_last_uid,imap_uidvalidity')
    .eq('id', 1)
    .maybeSingle()
  if (sErr || !s) return json({ error: 'Could not load settings' }, 500)
  const cfg = s as Settings
  if (!cfg.imap_host || !cfg.imap_username) return json({ error: 'IMAP is not configured in CRM Settings' }, 400)

  const mailbox = cfg.imap_mailbox || 'INBOX'

  try {
    const client = new ImapClient({
      host: cfg.imap_host,
      port: parseInt(cfg.imap_port || '993', 10),
      tls: cfg.imap_secure,
      username: cfg.imap_username,
      password: cfg.imap_password,
    })
    await client.connect()

    // 2. Select mailbox; honour UIDVALIDITY per RFC 4549 — if it changed,
    //    the server's UID space reset, so discard our cursor.
    const box = await client.selectMailbox(mailbox)
    const uidValidity = Number(box?.uidValidity ?? 0)
    let lastUid = cfg.imap_last_uid || 0
    if (uidValidity && uidValidity !== cfg.imap_uidvalidity) lastUid = 0

    // 3. Find messages with UID greater than our cursor.
    const uids: number[] = await client.search(['UID', `${lastUid + 1}:*`])
    const fresh = uids.filter((u) => u > lastUid)

    let inserted = 0
    let maxUid = lastUid
    // Batch ~100 to bound memory/time (extend with pagination for big backlogs).
    for (const uid of fresh.slice(0, 100)) {
      const msg = await client.fetch(uid, { envelope: true, bodyParts: ['TEXT'] })
      const from = msg?.envelope?.from?.[0]
      const fromEmail = from ? `${from.mailbox}@${from.host}` : null
      const subject = msg?.envelope?.subject ?? null
      const body = msg?.bodyParts?.TEXT ?? msg?.text ?? ''
      const receivedAt = msg?.envelope?.date ?? new Date().toISOString()

      const { error: insErr } = await admin.from('crm_inbox_messages').insert([{
        direction: 'inbound',
        subject,
        body,
        from_email: fromEmail,
        to_email: cfg.imap_username,
        status: 'unread',
        received_at: receivedAt,
        uid,
        mailbox,
      }])
      // Unique (mailbox, uid) index makes duplicate inserts a no-op error — ignore.
      if (!insErr) inserted++
      if (uid > maxUid) maxUid = uid
    }

    await client.disconnect()

    // 4. Advance the cursor.
    await admin.from('crm_runtime_settings')
      .update({ imap_last_uid: maxUid, imap_uidvalidity: uidValidity })
      .eq('id', 1)

    return json({ ok: true, scanned: fresh.length, inserted, lastUid: maxUid })
  } catch (err) {
    // Most likely cause in the edge sandbox: raw TCP/TLS not permitted. See README.
    return json({
      error: `IMAP sync failed: ${err instanceof Error ? err.message : String(err)}`,
      hint: 'If this is a socket/permission error, run imap-sync as an external worker (see README).',
    }, 502)
  }
})
