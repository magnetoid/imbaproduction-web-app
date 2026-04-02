import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Payload {
  prompt: string
  maxTokens?: number
  model?: string
  temperature?: number
  json?: boolean
}

async function loadRuntimeDefaults() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) return null

  const admin = createClient(supabaseUrl, serviceRoleKey)
  const { data } = await admin
    .from('crm_runtime_settings')
    .select('anthropic_model, anthropic_temperature')
    .eq('id', 1)
    .maybeSingle()

  return data || null
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured on the server.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const payload: Payload = await req.json()
    if (!payload?.prompt?.trim()) {
      return new Response(JSON.stringify({ error: 'Prompt is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const runtime = await loadRuntimeDefaults()
    const model = payload.model || runtime?.anthropic_model || 'claude-sonnet-4-20250514'
    const max_tokens = payload.maxTokens || 1200
    const temperature = payload.temperature ?? runtime?.anthropic_temperature ?? 0.2

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens,
        temperature,
        messages: [{ role: 'user', content: payload.prompt }],
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data?.error?.message || 'Anthropic request failed', raw: data }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const text = data?.content?.map((part: { text?: string }) => part.text || '').join('\n').trim() || ''

    if (payload.json) {
      const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/m)
      if (!match) {
        return new Response(JSON.stringify({ error: 'No JSON found in model response', raw: text }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      return new Response(JSON.stringify({ result: JSON.parse(match[0]) }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ result: text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
