// Site settings hook + types.
// Backed by the `site_settings` table (key/value JSONB).
// Each public page that needs global copy uses useSiteSettings() and
// falls back to the hard-coded defaults below if the row is missing.
// Defaults match the seed data in scripts/migrations/2026-05-13-team-and-site-settings.sql.

import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { ContactAddress, FooterLink, SocialLink } from './supabase'

export interface SiteSettings {
  contact_email: string
  contact_address: ContactAddress
  contact_response: string
  footer_tagline: string
  footer_services: FooterLink[]
  footer_company: FooterLink[]
  social_links: SocialLink[]
}

export const DEFAULT_SETTINGS: SiteSettings = {
  contact_email: 'hello@imbaproduction.com',
  contact_address: {
    line1: '007 N Orange St, 4th Floor',
    line2: 'Suite #3601',
    city: 'Wilmington',
    region: 'DE',
    postal: '19801',
    country: 'United States',
  },
  contact_response: 'We respond to all project enquiries within 24 hours, Monday to Friday.',
  footer_tagline:
    'Video production that drives revenue, not just views. Cinematic craft, AI-speed delivery, built around your business goals.',
  footer_services: [
    { label: 'Brand Video', href: '/services/brand-video' },
    { label: 'AI Video', href: '/services/ai-video' },
    { label: 'Product Video', href: '/services/product-video' },
    { label: 'Social Video', href: '/services/social-video' },
    { label: 'Post Production', href: '/services/post-production' },
    { label: 'eLearning', href: '/services/elearning-video' },
  ],
  footer_company: [
    { label: 'About Us', to: '/about' },
    { label: 'Our Work', to: '/work' },
    { label: 'Reviews', to: '/reviews' },
    { label: 'Blog', to: '/blog' },
    { label: 'Contact', to: '/contact' },
    { label: 'Careers', to: '/about' },
  ],
  social_links: [
    { label: 'IG', name: 'Instagram', href: 'https://instagram.com/imbaproduction' },
    { label: 'YT', name: 'YouTube', href: 'https://youtube.com/channel/UCV4zBHquBoo4NLw0tMi2ZKQ' },
    { label: 'TK', name: 'TikTok', href: 'https://tiktok.com/@imbaproduction' },
    { label: 'LI', name: 'LinkedIn', href: 'https://linkedin.com/company/imba-production' },
    { label: 'X',  name: 'X / Twitter', href: 'https://twitter.com/productionimba' },
    { label: 'FV', name: 'Fiverr', href: 'https://fiverr.com/imbaproduction' },
  ],
}

// Module-level cache so we don't refetch on every component mount.
let cache: SiteSettings | null = null
let inflight: Promise<SiteSettings> | null = null

async function fetchSiteSettings(): Promise<SiteSettings> {
  if (cache) return cache
  if (inflight) return inflight
  inflight = (async () => {
    const { data } = await supabase.from('site_settings').select('key, value')
    const merged: SiteSettings = { ...DEFAULT_SETTINGS }
    if (data) {
      for (const row of data as { key: string; value: unknown }[]) {
        if (row.key in merged) {
          // Trust JSONB shape from the migration; if it diverges, fallback wins.
          (merged as unknown as Record<string, unknown>)[row.key] = row.value
        }
      }
    }
    cache = merged
    inflight = null
    return merged
  })()
  return inflight
}

export function invalidateSiteSettings() {
  cache = null
  inflight = null
}

export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(cache ?? DEFAULT_SETTINGS)

  useEffect(() => {
    let mounted = true
    fetchSiteSettings().then(s => {
      if (mounted) setSettings(s)
    })
    return () => { mounted = false }
  }, [])

  return settings
}
