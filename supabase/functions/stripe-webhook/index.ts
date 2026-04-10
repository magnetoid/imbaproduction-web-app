// Stripe Webhook Handler
// Listens for checkout.session.completed events and marks invoices as paid.
//
// Configure in Stripe Dashboard:
//   Endpoint: https://<your-project>.supabase.co/functions/v1/stripe-webhook
//   Events: checkout.session.completed, payment_intent.succeeded
//
// The webhook signing secret must be set via:
//   supabase functions secrets set STRIPE_WEBHOOK_SECRET=whsec_...

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

// Minimal HMAC-SHA256 verification for Stripe signature header (t=...,v1=...)
async function verifyStripeSignature(payload: string, header: string, secret: string): Promise<boolean> {
  const parts = header.split(',').reduce<Record<string, string>>((acc, p) => {
    const [k, v] = p.split('=')
    if (k && v) acc[k.trim()] = v.trim()
    return acc
  }, {})
  const timestamp = parts.t
  const signature = parts.v1
  if (!timestamp || !signature) return false

  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signedPayload = `${timestamp}.${payload}`
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(signedPayload))
  const hex = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('')
  return hex === signature
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Missing Supabase env vars' }), { status: 500 })
    }

    const admin = createClient(supabaseUrl, serviceRoleKey)
    const rawBody = await req.text()

    // Verify signature (only if secret is configured)
    if (webhookSecret) {
      const signature = req.headers.get('stripe-signature') || ''
      const valid = await verifyStripeSignature(rawBody, signature, webhookSecret)
      if (!valid) {
        return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400, headers: corsHeaders })
      }
    }

    const event = JSON.parse(rawBody)
    const type = event?.type as string

    if (type === 'checkout.session.completed' || type === 'checkout.session.async_payment_succeeded') {
      const session = event.data?.object
      const invoiceId: string | undefined = session?.metadata?.invoice_id
      if (invoiceId) {
        const { data: invoice } = await admin.from('crm_invoices').select('lead_id, invoice_number, total').eq('id', invoiceId).maybeSingle()
        await admin.from('crm_invoices').update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        }).eq('id', invoiceId)

        // Log activity on the lead timeline
        if (invoice?.lead_id) {
          await admin.from('crm_activities').insert({
            lead_id: invoice.lead_id,
            type: 'invoice',
            subject: `Invoice ${invoice.invoice_number} paid via Stripe`,
            body: `$${Number(invoice.total || 0).toLocaleString()}`,
            created_by: 'stripe-webhook',
          })
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
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
