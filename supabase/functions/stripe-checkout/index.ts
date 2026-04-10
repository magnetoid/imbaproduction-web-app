// Stripe Checkout Edge Function
// Creates a Stripe Checkout Session for a CRM invoice and returns the payment URL
// Stores the session ID and URL on the invoice row.
//
// Request body: { invoice_id: string }
// Response: { url: string, session_id: string }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvoiceRow {
  id: string
  invoice_number: string
  total: number
  currency: string
  lead_id: string
  status: string
  stripe_invoice_id: string | null
  stripe_payment_url: string | null
  crm_leads: { name: string; email: string | null; company: string | null } | null
}

interface RuntimeSettings {
  stripe_secret_key: string
  stripe_success_url: string
  stripe_cancel_url: string
  company_name: string
}

async function loadRuntime(admin: ReturnType<typeof createClient>): Promise<RuntimeSettings | null> {
  const { data, error } = await admin
    .from('crm_runtime_settings')
    .select('stripe_secret_key, stripe_success_url, stripe_cancel_url, company_name')
    .eq('id', 1)
    .maybeSingle()
  if (error || !data) return null
  return {
    stripe_secret_key: data.stripe_secret_key || '',
    stripe_success_url: data.stripe_success_url || '',
    stripe_cancel_url: data.stripe_cancel_url || '',
    company_name: data.company_name || 'Imba Production',
  }
}

async function createCheckoutSession(
  secretKey: string,
  invoice: InvoiceRow,
  runtime: RuntimeSettings,
): Promise<{ id: string; url: string }> {
  // Build URL-encoded form for Stripe API
  const params = new URLSearchParams()
  params.append('mode', 'payment')
  params.append('payment_method_types[]', 'card')
  params.append('line_items[0][price_data][currency]', invoice.currency.toLowerCase() || 'usd')
  params.append('line_items[0][price_data][product_data][name]', `Invoice ${invoice.invoice_number}`)
  params.append('line_items[0][price_data][product_data][description]', `${runtime.company_name} — ${invoice.crm_leads?.company || invoice.crm_leads?.name || 'Client'}`)
  // Stripe expects amounts in smallest currency unit (cents)
  params.append('line_items[0][price_data][unit_amount]', Math.round(invoice.total * 100).toString())
  params.append('line_items[0][quantity]', '1')
  params.append('success_url', runtime.stripe_success_url || 'https://imbaproduction.com/thank-you?session_id={CHECKOUT_SESSION_ID}')
  params.append('cancel_url', runtime.stripe_cancel_url || 'https://imbaproduction.com')
  if (invoice.crm_leads?.email) params.append('customer_email', invoice.crm_leads.email)
  params.append('metadata[invoice_id]', invoice.id)
  params.append('metadata[invoice_number]', invoice.invoice_number)
  params.append('metadata[lead_id]', invoice.lead_id)

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error?.message || `Stripe API error: ${res.status}`)
  }
  return { id: data.id, url: data.url }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Missing Supabase env vars' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const admin = createClient(supabaseUrl, serviceRoleKey)
    const { invoice_id } = await req.json()

    if (!invoice_id) {
      return new Response(JSON.stringify({ error: 'invoice_id is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Load runtime settings (Stripe key)
    const runtime = await loadRuntime(admin)
    if (!runtime || !runtime.stripe_secret_key) {
      return new Response(JSON.stringify({ error: 'Stripe secret key not configured in CRM Settings' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Load invoice with lead info
    const { data: invoice, error: invErr } = await admin
      .from('crm_invoices')
      .select('id, invoice_number, total, currency, lead_id, status, stripe_invoice_id, stripe_payment_url, crm_leads(name,email,company)')
      .eq('id', invoice_id)
      .single()

    if (invErr || !invoice) {
      return new Response(JSON.stringify({ error: invErr?.message || 'Invoice not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // If already has a payment URL, return it
    if (invoice.stripe_payment_url) {
      return new Response(JSON.stringify({ url: invoice.stripe_payment_url, session_id: invoice.stripe_invoice_id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create the Checkout Session
    const session = await createCheckoutSession(runtime.stripe_secret_key, invoice as unknown as InvoiceRow, runtime)

    // Save back to the invoice row
    await admin.from('crm_invoices').update({
      stripe_invoice_id: session.id,
      stripe_payment_url: session.url,
      status: invoice.status === 'draft' ? 'sent' : invoice.status,
    }).eq('id', invoice_id)

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
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
