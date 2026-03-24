import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars missing — running in demo mode')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

// ── Types ──────────────────────────────────────────

export interface PortfolioItem {
  id: string
  title: string
  slug: string
  category: 'brand' | 'ai' | 'product' | 'social' | 'drone' | 'post' | 'elearning'
  client_name?: string
  thumbnail_url?: string
  video_url?: string
  vimeo_id?: string
  youtube_id?: string
  description?: string
  results?: Record<string, string>
  tags?: string[]
  featured: boolean
  published: boolean
  sort_order: number
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  body?: string
  cover_image_url?: string
  author_id?: string
  category?: string
  tags?: string[]
  seo_title?: string
  seo_description?: string
  read_time_minutes?: number
  published: boolean
  published_at?: string
  created_at: string
}

export interface Service {
  id: string
  name: string
  slug: string
  tagline?: string
  description?: string
  long_description?: string
  cover_image_url?: string
  icon_key?: string
  features?: { title: string; desc: string }[]
  pricing_hint?: string
  sort_order: number
  published: boolean
}

export interface Testimonial {
  id: string
  client_name: string
  client_role?: string
  client_company?: string
  client_avatar_url?: string
  text: string
  rating?: number
  featured: boolean
  published: boolean
}

export interface TeamMember {
  id: string
  name: string
  slug: string
  role?: string
  bio?: string
  photo_url?: string
  social_links?: Record<string, string>
  sort_order: number
  published: boolean
}

export interface QuoteRequest {
  id?: string
  full_name: string
  email: string
  company?: string
  service_type?: string
  budget_range?: string
  message?: string
  status?: string
  created_at?: string
}
