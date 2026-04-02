import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type AIProvider = 'anthropic' | 'openai' | 'gemini' | 'perplexity' | 'ollama'

type RuntimeSettings = {
  active_ai_provider?: AIProvider
  active_ai_model?: string
  anthropic_api_key?: string
  anthropic_model?: string
  anthropic_models?: string[]
  anthropic_temperature?: number
  openai_api_key?: string
  openai_model?: string
  openai_models?: string[]
  gemini_api_key?: string
  gemini_model?: string
  gemini_models?: string[]
  perplexity_api_key?: string
  perplexity_model?: string
  perplexity_models?: string[]
  ollama_base_url?: string
  ollama_model?: string
  ollama_models?: string[]
}

interface Payload {
  action?: 'fetch-models'
  provider?: AIProvider
  prompt?: string
  maxTokens?: number
  model?: string
  temperature?: number
  json?: boolean
  settings?: Partial<RuntimeSettings>
}

const DEFAULT_MODELS: Record<AIProvider, string> = {
  anthropic: 'claude-sonnet-4-20250514',
  openai: 'gpt-4o-mini',
  gemini: 'gemini-2.5-flash',
  perplexity: 'sonar',
  ollama: 'llama3.1',
}

const MODEL_CACHE_KEYS: Record<AIProvider, keyof RuntimeSettings> = {
  anthropic: 'anthropic_models',
  openai: 'openai_models',
  gemini: 'gemini_models',
  perplexity: 'perplexity_models',
  ollama: 'ollama_models',
}

async function loadRuntimeDefaults() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) return null

  const admin = createClient(supabaseUrl, serviceRoleKey)
  const { data } = await admin
    .from('crm_runtime_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle()

  return data || null
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function normalizeModels(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

function mergeRuntime(runtime: RuntimeSettings | null, overrides?: Partial<RuntimeSettings>): RuntimeSettings {
  const merged: RuntimeSettings = { ...(runtime || {}), ...(overrides || {}) }
  merged.active_ai_provider = merged.active_ai_provider || 'anthropic'
  merged.active_ai_model = merged.active_ai_model || merged[`${merged.active_ai_provider}_model` as keyof RuntimeSettings] as string || DEFAULT_MODELS[merged.active_ai_provider]
  merged.anthropic_models = normalizeModels(merged.anthropic_models)
  merged.openai_models = normalizeModels(merged.openai_models)
  merged.gemini_models = normalizeModels(merged.gemini_models)
  merged.perplexity_models = normalizeModels(merged.perplexity_models)
  merged.ollama_models = normalizeModels(merged.ollama_models)
  return merged
}

function getProviderApiKey(provider: AIProvider, settings: RuntimeSettings): string {
  if (provider === 'anthropic') return settings.anthropic_api_key || Deno.env.get('ANTHROPIC_API_KEY') || ''
  if (provider === 'openai') return settings.openai_api_key || Deno.env.get('OPENAI_API_KEY') || ''
  if (provider === 'gemini') return settings.gemini_api_key || Deno.env.get('GEMINI_API_KEY') || ''
  if (provider === 'perplexity') return settings.perplexity_api_key || Deno.env.get('PERPLEXITY_API_KEY') || ''
  return ''
}

function getProviderModel(provider: AIProvider, settings: RuntimeSettings, payload?: Payload): string {
  if (payload?.model) return payload.model
  if (payload?.provider && settings.active_ai_provider === payload.provider && settings.active_ai_model) return settings.active_ai_model
  if (provider === 'anthropic') return settings.anthropic_model || settings.active_ai_model || DEFAULT_MODELS.anthropic
  if (provider === 'openai') return settings.openai_model || settings.active_ai_model || DEFAULT_MODELS.openai
  if (provider === 'gemini') return settings.gemini_model || settings.active_ai_model || DEFAULT_MODELS.gemini
  if (provider === 'perplexity') return settings.perplexity_model || settings.active_ai_model || DEFAULT_MODELS.perplexity
  return settings.ollama_model || settings.active_ai_model || DEFAULT_MODELS.ollama
}

async function fetchAnthropicModels(apiKey: string) {
  const res = await fetch('https://api.anthropic.com/v1/models', {
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || 'Anthropic model fetch failed')
  return Array.isArray(data?.data) ? data.data.map((item: { id?: string }) => item.id).filter(Boolean) : []
}

async function fetchOpenAIModels(apiKey: string) {
  const res = await fetch('https://api.openai.com/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || 'OpenAI model fetch failed')
  return Array.isArray(data?.data) ? data.data.map((item: { id?: string }) => item.id).filter(Boolean) : []
}

async function fetchGeminiModels(apiKey: string) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || 'Gemini model fetch failed')
  return Array.isArray(data?.models)
    ? data.models
        .map((item: { name?: string; supportedGenerationMethods?: string[] }) => ({ name: item.name?.replace(/^models\//, ''), methods: item.supportedGenerationMethods || [] }))
        .filter((item: { name?: string; methods: string[] }) => item.name && item.methods.includes('generateContent'))
        .map((item: { name?: string }) => item.name as string)
    : []
}

async function fetchPerplexityModels(apiKey: string) {
  const res = await fetch('https://api.perplexity.ai/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || 'Perplexity model fetch failed')
  return Array.isArray(data?.data) ? data.data.map((item: { id?: string }) => item.id).filter(Boolean) : []
}

async function fetchOllamaModels(baseUrl: string) {
  const normalizedBase = baseUrl.replace(/\/$/, '')
  const res = await fetch(`${normalizedBase}/api/tags`)
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || 'Ollama model fetch failed')
  return Array.isArray(data?.models) ? data.models.map((item: { name?: string }) => item.name).filter(Boolean) : []
}

async function fetchModelsForProvider(provider: AIProvider, settings: RuntimeSettings) {
  if (provider === 'anthropic') {
    const apiKey = getProviderApiKey(provider, settings)
    if (!apiKey) throw new Error('Anthropic API key is not configured.')
    return fetchAnthropicModels(apiKey)
  }
  if (provider === 'openai') {
    const apiKey = getProviderApiKey(provider, settings)
    if (!apiKey) throw new Error('OpenAI API key is not configured.')
    return fetchOpenAIModels(apiKey)
  }
  if (provider === 'gemini') {
    const apiKey = getProviderApiKey(provider, settings)
    if (!apiKey) throw new Error('Gemini API key is not configured.')
    return fetchGeminiModels(apiKey)
  }
  if (provider === 'perplexity') {
    const apiKey = getProviderApiKey(provider, settings)
    if (!apiKey) throw new Error('Perplexity API key is not configured.')
    return fetchPerplexityModels(apiKey)
  }
  return fetchOllamaModels(settings.ollama_base_url || 'http://host.docker.internal:11434')
}

async function generateText(provider: AIProvider, settings: RuntimeSettings, payload: Payload) {
  const prompt = payload.prompt?.trim()
  if (!prompt) throw new Error('Prompt is required.')

  const model = getProviderModel(provider, settings, payload)
  const maxTokens = payload.maxTokens || 1200
  const temperature = payload.temperature ?? settings.anthropic_temperature ?? 0.2

  if (provider === 'anthropic') {
    const apiKey = getProviderApiKey(provider, settings)
    if (!apiKey) throw new Error('Anthropic API key is not configured.')
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error?.message || 'Anthropic request failed')
    return data?.content?.map((part: { text?: string }) => part.text || '').join('\n').trim() || ''
  }

  if (provider === 'openai') {
    const apiKey = getProviderApiKey(provider, settings)
    if (!apiKey) throw new Error('OpenAI API key is not configured.')
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error?.message || 'OpenAI request failed')
    return data?.choices?.[0]?.message?.content?.trim?.() || ''
  }

  if (provider === 'gemini') {
    const apiKey = getProviderApiKey(provider, settings)
    if (!apiKey) throw new Error('Gemini API key is not configured.')
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error?.message || 'Gemini request failed')
    return data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('\n').trim() || ''
  }

  if (provider === 'perplexity') {
    const apiKey = getProviderApiKey(provider, settings)
    if (!apiKey) throw new Error('Perplexity API key is not configured.')
    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error?.message || 'Perplexity request failed')
    return data?.choices?.[0]?.message?.content?.trim?.() || ''
  }

  const baseUrl = (settings.ollama_base_url || 'http://host.docker.internal:11434').replace(/\/$/, '')
  const res = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: { temperature, num_predict: maxTokens },
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || 'Ollama request failed')
  return data?.response?.trim?.() || ''
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const payload: Payload = await req.json()
    const runtime = mergeRuntime(await loadRuntimeDefaults(), payload.settings)
    const provider = payload.provider || runtime.active_ai_provider || 'anthropic'

    if (payload.action === 'fetch-models') {
      const models = await fetchModelsForProvider(provider, runtime)
      const cacheKey = MODEL_CACHE_KEYS[provider]
      return jsonResponse({ provider, models, cacheKey })
    }

    const text = await generateText(provider, runtime, payload)

    if (payload.json) {
      const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/m)
      if (!match) return jsonResponse({ error: 'No JSON found in model response', raw: text }, 500)
      return jsonResponse({ result: JSON.parse(match[0]) })
    }

    return jsonResponse({ result: text })
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unknown error' }, 500)
  }
})
