// Supabase Edge Function — send-email
// Deploy: supabase functions deploy send-email --no-verify-jwt
// Deno runtime — uses native fetch for SMTP via smtp2go/resend fallback or nodemailer-compatible SMTP

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface SmtpConfig {
  host: string
  port: string
  secure: boolean
  username: string
  password: string
  from_name: string
  from_email: string
}

interface EmailPayload {
  to: string
  to_name?: string
  subject: string
  body: string
  smtp: SmtpConfig
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: EmailPayload = await req.json()
    const { to, to_name, subject, body, smtp } = payload

    if (!smtp?.host || !smtp?.username || !smtp?.password) {
      return new Response(JSON.stringify({ error: 'SMTP not configured' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Use SMTP2GO API if host is smtp.smtp2go.com, otherwise use raw SMTP via fetch relay
    // Primary: attempt via smtp2go REST API (simplest from Deno)
    if (smtp.host.includes('smtp2go')) {
      const res = await fetch('https://api.smtp2go.com/v3/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: smtp.password, // smtp2go uses password as API key
          to: [to_name ? `${to_name} <${to}>` : to],
          sender: `${smtp.from_name} <${smtp.from_email}>`,
          subject,
          text_body: body,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.data?.error) {
        throw new Error(data.data?.error || 'smtp2go send failed')
      }
    } else {
      // Generic SMTP: use Deno's built-in SMTP capability via smtp library
      // Deno doesn't have native nodemailer, so we use the deno-smtp library
      const SmtpClient = (await import('https://deno.land/x/smtp@v0.7.0/mod.ts')).SmtpClient
      const client = new SmtpClient()
      await client.connectTLS({
        hostname: smtp.host,
        port: parseInt(smtp.port) || (smtp.secure ? 465 : 587),
        username: smtp.username,
        password: smtp.password,
      })
      await client.send({
        from: `${smtp.from_name} <${smtp.from_email}>`,
        to,
        subject,
        content: body,
      })
      await client.close()
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('send-email error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
