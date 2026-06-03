import { createClient } from '@supabase/supabase-js'

// VITE_SUPABASE_URL is baked at build time. If it's missing or a placeholder,
// fall back to the nginx proxy path on the same origin — works on any domain
// without needing the build arg to be set correctly.
const _buildUrl = import.meta.env.VITE_SUPABASE_URL as string
const isPlaceholder = !_buildUrl || _buildUrl.includes('placeholder') || _buildUrl.includes('undefined')
const supabaseUrl = isPlaceholder
  ? (typeof window !== 'undefined' ? `${window.location.origin}/supabase` : '/supabase')
  : _buildUrl

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (isPlaceholder) {
  console.info('VITE_SUPABASE_URL not set — using nginx proxy at /supabase')
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || 'placeholder'
)

// ── Types ──────────────────────────────────────────

export interface PortfolioItem {
  id: string
  title: string
  slug: string
  category: 'brand' | 'ai' | 'product' | 'social' | 'post' | 'elearning' | 'cooking' | 'fashion' | 'testimonial'
  client_name?: string
  thumbnail_url?: string
  video_url?: string
  vimeo_id?: string
  youtube_id?: string
  description?: string
  results?: Record<string, string>
  tags?: string[]
  featured: boolean
  homepage_featured?: boolean
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
  status?: 'draft' | 'published' | 'scheduled'
  author_name?: string
  og_image_url?: string
  category_id?: string
  featured_image_url?: string
  blog_categories?: { name: string; slug: string }
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  parent_id?: string
  created_at: string
}

export interface BlogTag {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Page {
  id: string
  slug: string
  title: string
  status: 'draft' | 'published'
  data: Record<string, unknown>
  seo: { title?: string; description?: string; og_image?: string }
  published_at?: string
  created_at: string
  updated_at: string
}

export interface ContentVersion {
  id: string
  entity_type: string
  entity_id: string
  version: number
  title?: string
  snapshot: Record<string, unknown>
  is_autosave: boolean
  author_id?: string
  author_email?: string
  created_at: string
}

export interface MediaFile {
  id: string
  filename: string
  original_name?: string
  mime_type?: string
  size?: number
  url: string
  alt?: string
  caption?: string
  created_at: string
}

// Full service record — matches the ServiceData shape used by public pages.
// Stored in Supabase `services` table (with JSONB columns for nested arrays).
export interface ServiceRecord {
  id: string
  slug: string
  service_key: string
  icon?: string
  label: string
  tagline?: string
  color?: string
  hero_desc?: string
  stats: { num: string; label: string }[]
  features: { title: string; desc: string }[]
  process: { n: string; title: string; desc: string }[]
  portfolio: { youtube_id: string; title: string; client: string }[]
  shorts: { youtube_id: string; title: string }[]
  faq: { q: string; a: string }[]
  sort_order: number
  published: boolean
  created_at?: string
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
  created_at?: string
}

export interface SiteSettingRow {
  key: string
  value: unknown
  updated_at?: string
}

export interface ContactAddress {
  line1?: string
  line2?: string
  city?: string
  region?: string
  postal?: string
  country?: string
}

export interface FooterLink {
  label: string
  href?: string
  to?: string
}

export interface SocialLink {
  label: string
  name?: string
  href: string
}

export interface HeroVideo {
  id: string
  youtube_id: string
  title: string
  slide_eyebrow?: string
  slide_headline?: string
  slide_headline_em?: string
  slide_subheadline?: string
  slide_image_url?: string
  slide_primary_cta_label?: string
  slide_primary_cta_href?: string
  slide_secondary_cta_label?: string
  slide_secondary_cta_href?: string
  sort_order: number
  active: boolean
  created_at: string
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
