import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function loadDbSmtpConfig(): Promise<SmtpConfig | null> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) return null

  const admin = createClient(supabaseUrl, serviceRoleKey)
  const { data, error } = await admin
    .from('crm_runtime_settings')
    .select('smtp_host,smtp_port,smtp_secure,smtp_username,smtp_password,smtp_from_name,smtp_from_email')
    .eq('id', 1)
    .maybeSingle()

  if (error || !data) return null

  return {
    host: data.smtp_host || '',
    port: data.smtp_port || '587',
    secure: Boolean(data.smtp_secure),
    username: data.smtp_username || '',
    password: data.smtp_password || '',
    from_name: data.smtp_from_name || 'Imba Production',
    from_email: data.smtp_from_email || '',
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const payload: EmailPayload = await req.json()
    const { to, to_name, subject, body } = payload
    const smtp = await loadDbSmtpConfig()

    if (!to || !subject || !body) {
      return new Response(JSON.stringify({ error: 'to, subject and body are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!smtp?.host || !smtp?.username || !smtp?.password || !smtp?.from_email) {
      return new Response(JSON.stringify({ error: 'SMTP not configured in crm_runtime_settings' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (smtp.host.includes('smtp2go')) {
      const res = await fetch('https://api.smtp2go.com/v3/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: smtp.password,
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
      const { SmtpClient } = await import('https://deno.land/x/smtp@v0.7.0/mod.ts')
      const client = new SmtpClient()
      if (smtp.secure) {
        await client.connectTLS({
          hostname: smtp.host,
          port: parseInt(smtp.port, 10) || 465,
          username: smtp.username,
          password: smtp.password,
        })
      } else {
        await client.connect({
          hostname: smtp.host,
          port: parseInt(smtp.port, 10) || 587,
          username: smtp.username,
          password: smtp.password,
        })
      }
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
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
