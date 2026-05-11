import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  LayoutDashboard, ArrowRight, FileText, Image, MessageSquare, Film, FolderOpen, Search, Star,
} from 'lucide-react'

export default function AdminLanding() {
  const navigate = useNavigate()
  const [counts, setCounts] = useState({ portfolio: 0, blog: 0, quotes: 0, heroVideos: 0 })

  useEffect(() => {
    Promise.all([
      supabase.from('portfolio_items').select('*', { count: 'exact', head: true }),
      supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
      supabase.from('quote_requests').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('hero_videos').select('*', { count: 'exact', head: true }),
    ]).then(([p, b, q, h]) =>
      setCounts({
        portfolio: p.count || 0,
        blog: b.count || 0,
        quotes: q.count || 0,
        heroVideos: h.count || 0,
      })
    )
  }, [])

  return (
    <div className="p-8 min-h-full">
      <div className="mb-10">
        <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-2">Imba Production</p>
        <h1 className="text-3xl font-semibold text-foreground">Content Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your site content, media, and SEO.</p>
      </div>

      {/* Open CMS tile */}
      <div className="grid grid-cols-1 gap-6 mb-10">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="group relative overflow-hidden text-left rounded-lg border border-border bg-card hover:border-primary/40 transition-all duration-300 p-8"
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
              <LayoutDashboard className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Open dashboard</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xl">
              Manage portfolio, blog posts, hero videos, testimonials, media library, translations, and SEO settings.
            </p>

            {/* Mini stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="flex items-center gap-2">
                <Image className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{counts.portfolio} portfolio items</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{counts.blog} blog posts</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{counts.quotes} new quotes</span>
              </div>
              <div className="flex items-center gap-2">
                <Film className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{counts.heroVideos} hero videos</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-primary font-mono text-xs tracking-widest uppercase">
              <span>Open dashboard</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>
      </div>

      {/* Quick shortcuts */}
      <div className="border border-border rounded-lg p-5">
        <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-4">Quick access</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Portfolio', to: '/admin/portfolio', icon: Image },
            { label: 'Blog', to: '/admin/blog', icon: FileText },
            { label: 'Hero Videos', to: '/admin/hero-videos', icon: Film },
            { label: 'Testimonials', to: '/admin/testimonials', icon: Star },
            { label: 'Quote Requests', to: '/admin/quotes', icon: MessageSquare },
            { label: 'Media', to: '/admin/media', icon: FolderOpen },
            { label: 'SEO Studio', to: '/admin/seo', icon: Search },
          ].map(({ label, to, icon: Icon }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all text-left"
            >
              <Icon className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
