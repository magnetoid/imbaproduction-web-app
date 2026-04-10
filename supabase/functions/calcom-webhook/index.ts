// Cal.com Webhook Handler
// Listens for BOOKING_CREATED events and creates/updates a CRM lead.
//
// Configure in Cal.com:
//   Settings → Developer → Webhooks → New Webhook
//   Endpoint: https://<your-project>.supabase.co/functions/v1/calcom-webhook
//   Events: BOOKING_CREATED, BOOKING_CANCELLED
//   Secret: set via `supabase functions secrets set CALCOM_WEBHOOK_SECRET=...`
//
// On BOOKING_CREATED:
//   - If a lead with the attendee email exists → move to "qualified" + log activity
//   - If not → create a new lead with source='cal_booking' and stage='qualified'

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cal-signature-256',
}

async function verifyCalSignature(payload: string, header: string, secret: string): Promise<boolean> {
  if (!header) return false
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  const hex = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('')
  return hex === header || `sha256=${hex}` === header
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const webhookSecret = Deno.env.get('CALCOM_WEBHOOK_SECRET')

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Missing Supabase env vars' }), { status: 500 })
    }

    const admin = createClient(supabaseUrl, serviceRoleKey)
    const rawBody = await req.text()

    if (webhookSecret) {
      const signature = req.headers.get('x-cal-signature-256') || ''
      const valid = await verifyCalSignature(rawBody, signature, webhookSecret)
      if (!valid) {
        return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400, headers: corsHeaders })
      }
    }

    const event = JSON.parse(rawBody)
    const triggerEvent: string = event?.triggerEvent || event?.type || ''
    const payload = event?.payload || event?.data || {}
    const attendees: Array<{ email?: string; name?: string; timeZone?: string }> = payload?.attendees || []
    const primary = attendees[0] || {}
    const email = (primary.email || payload?.customerEmail || '').trim().toLowerCase()
    const name = primary.name || payload?.customerName || email || 'Cal.com booking'
    const meetingTitle: string = payload?.title || payload?.eventTitle || 'Booked meeting'
    const startTime: string = payload?.startTime || payload?.start || new Date().toISOString()

    if (triggerEvent !== 'BOOKING_CREATED' && triggerEvent !== 'booking.created') {
      // Ignore other event types but respond 200 so Cal.com doesn't retry
      return new Response(JSON.stringify({ received: true, ignored: triggerEvent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!email) {
      return new Response(JSON.stringify({ error: 'No attendee email in payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Look for existing lead by email
    const { data: existing } = await admin
      .from('crm_leads')
      .select('id, stage, name, company')
      .eq('email', email)
      .maybeSingle()

    let leadId: string

    if (existing) {
      leadId = existing.id
      // Upgrade stage if still early
      const shouldUpgrade = ['new', 'qualified'].includes(existing.stage)
      if (shouldUpgrade) {
        await admin.from('crm_leads').update({
          stage: 'qualified',
          last_contacted_at: new Date().toISOString(),
        }).eq('id', existing.id)
      } else {
        await admin.from('crm_leads').update({ last_contacted_at: new Date().toISOString() }).eq('id', existing.id)
      }
    } else {
      const { data: inserted, error: insertErr } = await admin.from('crm_leads').insert({
        name,
        email,
        source: 'cal_booking',
        stage: 'qualified',
        probability: 60,
        notes: `Booked via Cal.com: ${meetingTitle}\nStart: ${startTime}`,
        last_contacted_at: new Date().toISOString(),
      }).select('id').single()

      if (insertErr || !inserted) {
        return new Response(JSON.stringify({ error: insertErr?.message || 'Failed to create lead' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      leadId = inserted.id
    }

    // Log the meeting activity
    await admin.from('crm_activities').insert({
      lead_id: leadId,
      type: 'meeting',
      subject: `Meeting booked via Cal.com: ${meetingTitle}`,
      body: `Start: ${new Date(startTime).toLocaleString()}${primary.timeZone ? ` (${primary.timeZone})` : ''}`,
      created_by: 'calcom-webhook',
    })

    return new Response(JSON.stringify({ received: true, lead_id: leadId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
