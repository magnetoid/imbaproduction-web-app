-- V009 — multi-provider CRM AI runtime settings

ALTER TABLE public.crm_runtime_settings
  ADD COLUMN IF NOT EXISTS active_ai_provider TEXT DEFAULT 'anthropic',
  ADD COLUMN IF NOT EXISTS active_ai_model TEXT DEFAULT 'claude-sonnet-4-20250514',
  ADD COLUMN IF NOT EXISTS anthropic_api_key TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS anthropic_models JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS openai_api_key TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS openai_model TEXT DEFAULT 'gpt-4o-mini',
  ADD COLUMN IF NOT EXISTS openai_models JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS gemini_api_key TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS gemini_model TEXT DEFAULT 'gemini-2.5-flash',
  ADD COLUMN IF NOT EXISTS gemini_models JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS perplexity_api_key TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS perplexity_model TEXT DEFAULT 'sonar',
  ADD COLUMN IF NOT EXISTS perplexity_models JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ollama_base_url TEXT DEFAULT 'http://host.docker.internal:11434',
  ADD COLUMN IF NOT EXISTS ollama_model TEXT DEFAULT 'llama3.1',
  ADD COLUMN IF NOT EXISTS ollama_models JSONB DEFAULT '[]'::jsonb;

UPDATE public.crm_runtime_settings
SET
  active_ai_provider = COALESCE(NULLIF(active_ai_provider, ''), 'anthropic'),
  active_ai_model = COALESCE(NULLIF(active_ai_model, ''), anthropic_model, 'claude-sonnet-4-20250514'),
  anthropic_api_key = COALESCE(anthropic_api_key, ''),
  anthropic_models = COALESCE(anthropic_models, '[]'::jsonb),
  openai_api_key = COALESCE(openai_api_key, ''),
  openai_model = COALESCE(NULLIF(openai_model, ''), 'gpt-4o-mini'),
  openai_models = COALESCE(openai_models, '[]'::jsonb),
  gemini_api_key = COALESCE(gemini_api_key, ''),
  gemini_model = COALESCE(NULLIF(gemini_model, ''), 'gemini-2.5-flash'),
  gemini_models = COALESCE(gemini_models, '[]'::jsonb),
  perplexity_api_key = COALESCE(perplexity_api_key, ''),
  perplexity_model = COALESCE(NULLIF(perplexity_model, ''), 'sonar'),
  perplexity_models = COALESCE(perplexity_models, '[]'::jsonb),
  ollama_base_url = COALESCE(NULLIF(ollama_base_url, ''), 'http://host.docker.internal:11434'),
  ollama_model = COALESCE(NULLIF(ollama_model, ''), 'llama3.1'),
  ollama_models = COALESCE(ollama_models, '[]'::jsonb),
  updated_at = NOW()
WHERE id = 1;
