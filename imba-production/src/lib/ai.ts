import { supabase } from '@/lib/supabase'

export interface AIRequestOptions {
  maxTokens?: number
  model?: string
  temperature?: number
  json?: boolean
}

export interface CRMRuntimeSettings {
  anthropic_model: string
  anthropic_temperature: number
  smtp_host: string
  smtp_port: string
  smtp_secure: boolean
  smtp_username: string
  smtp_password: string
  smtp_from_name: string
  smtp_from_email: string
  ai_outreach_tone: string
  ai_auto_enrich: boolean
  ai_inbox_auto_categorize: boolean
  company_name: string
  company_description: string
  usp: string
  scheduling_url: string
  lead_sources_enabled: string[]
  outreach_daily_limit: number
}

export const DEFAULT_CRM_RUNTIME_SETTINGS: CRMRuntimeSettings = {
  anthropic_model: 'claude-sonnet-4-20250514',
  anthropic_temperature: 0.2,
  smtp_host: '',
  smtp_port: '587',
  smtp_secure: false,
  smtp_username: '',
  smtp_password: '',
  smtp_from_name: 'Imba Production',
  smtp_from_email: '',
  ai_outreach_tone: 'professional',
  ai_auto_enrich: true,
  ai_inbox_auto_categorize: true,
  company_name: 'Imba Production',
  company_description: 'Cinematic video production powered by AI strategy.',
  usp: 'We combine human creativity with AI to produce cinematic-quality videos at scale.',
  scheduling_url: '',
  lead_sources_enabled: ['manual', 'quote_form', 'ai_search'],
  outreach_daily_limit: 50,
}

export async function callAI<T = string>(prompt: string, options?: AIRequestOptions): Promise<T> {
  const { data, error } = await supabase.functions.invoke('ai-proxy', {
    body: {
      prompt,
      maxTokens: options?.maxTokens,
      model: options?.model,
      temperature: options?.temperature,
      json: options?.json,
    },
  })

  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data?.result as T
}

export async function callAIText(prompt: string, options?: Omit<AIRequestOptions, 'json'>): Promise<string> {
  return callAI<string>(prompt, options)
}

export async function callAIJSON<T>(prompt: string, options?: Omit<AIRequestOptions, 'json'>): Promise<T> {
  return callAI<T>(prompt, { ...options, json: true })
}

export async function getCRMRuntimeSettings(): Promise<CRMRuntimeSettings> {
  const { data, error } = await supabase
    .from('crm_runtime_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle()

  if (error) throw error
  return {
    ...DEFAULT_CRM_RUNTIME_SETTINGS,
    ...(data || {}),
  } as CRMRuntimeSettings
}

export function buildCompanyContext(settings: CRMRuntimeSettings) {
  return [
    `Company: ${settings.company_name}`,
    `Description: ${settings.company_description || 'N/A'}`,
    `USP: ${settings.usp || 'N/A'}`,
    settings.scheduling_url ? `Scheduling URL: ${settings.scheduling_url}` : null,
  ].filter(Boolean).join('\n')
}
