import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '@/components/Seo'
import PageHero from '@/components/ui/PageHero'
import { supabase } from '@/lib/supabase'
import type { PortfolioItem } from '@/lib/supabase'

type WorkItem = {
  id: string
  youtube_id: string
  title: string
  category: string
  client: string
  tags: string[]
}

const FALLBACK: WorkItem[] = [
  { id: '1',  youtube_id: 'WqC_sML9a8A', title: 'Cinematic Spa Promo',                 category: 'brand',   client: 'Wellness Brand',     tags: ['Brand', 'Cinematic'] },
  { id: '2',  youtube_id: 'SgHHbWp64cE', title: 'Virus House Teaser',                   category: 'brand',   client: 'Film Project',       tags: ['Brand', 'Cinematic'] },
  { id: '3',  youtube_id: 'MHXXNX1LG7c', title: 'Irving Scott Trailer',                 category: 'brand',   client: 'Irving Books',       tags: ['Brand', 'Trailer'] },
  { id: '4',  youtube_id: 'Kud0bPYAobM', title: 'Perfume Ad',                           category: 'brand',   client: 'Fragrance Brand',    tags: ['Brand', 'Product'] },
  { id: '5',  youtube_id: '9k5w1iG_JHM', title: 'Gen AI Video by Imba Production',      category: 'ai',      client: 'Imba Production',    tags: ['AI', 'Innovation'] },
  { id: '6',  youtube_id: 'sV1Fop4kJVM', title: 'Raspberry Yoghurt Cups (AI Cooking)',  category: 'ai',      client: 'Food Brand',         tags: ['AI', 'Cooking'] },
  { id: '7',  youtube_id: '_YnUju357Bg', title: 'Cooking Showreel',                     category: 'cooking', client: 'Imba Production',    tags: ['Cooking', 'Reel'] },
  { id: '8',  youtube_id: 'GY3h4UO1Ck0', title: 'Focaccia Sandwich',                    category: 'cooking', client: 'Culinary Brand',     tags: ['Cooking', 'Food'] },
  { id: '9',  youtube_id: '_64Cu5FxNv8', title: 'Cooking Man — Slow Motion',            category: 'cooking', client: 'Culinary Brand',     tags: ['Cooking', 'Cinematic'] },
  { id: '10', youtube_id: 'SOt1I5u0yvE', title: 'Cooking Video Reel #1',                category: 'cooking', client: 'Culinary Brand',     tags: ['Cooking', 'Reel'] },
  { id: '11', youtube_id: 'cBJoEGPMHoE', title: 'Cooking Video Reel #2',                category: 'cooking', client: 'Culinary Brand',     tags: ['Cooking', 'Reel'] },
  { id: '12', youtube_id: 'EtBSTn9hKuY', title: 'Cooking Video Reel #3',                category: 'cooking', client: 'Food Platform',      tags: ['Cooking', 'Reel'] },
  { id: '13', youtube_id: 'Ej4HgOORaZ4', title: 'Basket of French Fries',               category: 'cooking', client: 'Restaurant Brand',   tags: ['Cooking', 'Food'] },
  { id: '14', youtube_id: 'l9aUWFEVO_4', title: 'Pumpkin Soup in a Wooden Bowl',        category: 'cooking', client: 'Culinary Brand',     tags: ['Cooking', 'Cinematic'] },
  { id: '15', youtube_id: 'jBPNnr-j0c8', title: 'Sandwiches with Hummus',               category: 'cooking', client: 'Food Creator',       tags: ['Cooking', 'Lifestyle'] },
  { id: '16', youtube_id: 'NIo6n4XdBTg', title: 'Short Food Social Ad',                 category: 'cooking', client: 'Food Brand',         tags: ['Cooking', 'Social'] },
  { id: '17', youtube_id: '_fbHbplDCwo', title: 'Yoga on the Lake, Serbia',             category: 'drone',   client: 'Wellness Brand',     tags: ['Drone', 'Lifestyle'] },
  { id: '18', youtube_id: 'BCtrr3I70sk', title: 'Vietnam Top 5 Hotels',                 category: 'drone',   client: 'Travel Publisher',   tags: ['Drone', 'Travel'] },
  { id: '19', youtube_id: 'PhjpiJ5jcBo', title: 'Ovčar Banja — Real Estate 4K',         category: 'drone',   client: 'Prime Real Estate',  tags: ['Drone', 'Real Estate'] },
  { id: '20', youtube_id: 'QQVzFOVbN_I', title: 'Fall at the Hippodrome, Kragujevac',   category: 'drone',   client: 'Travel Film',        tags: ['Drone', 'Travel'] },
  { id: '21', youtube_id: 'PHxMQ6FSiks', title: 'Natural Soap Social Media Ad',         category: 'social',  client: 'Kozica Soaps',       tags: ['Social', 'Product'] },
  { id: '22', youtube_id: 'LqPEeYQUaeQ', title: 'Fine Droplets',                        category: 'social',  client: 'Creative Project',   tags: ['Social', 'Product'] },
  { id: '23', youtube_id: 'WfvbdNlrsbc', title: 'Replay Product Video',                 category: 'social',  client: 'Replay',             tags: ['Social', 'Product'] },
  { id: '24', youtube_id: 'HOVuTC5UEJ0', title: 'Starbucks Stop-Motion Ad',             category: 'social',  client: 'Starbucks',          tags: ['Social', 'Product'] },
  { id: '25', youtube_id: 'lfGkw0j3QA8', title: 'Starbucks Coffee Ad',                  category: 'social',  client: 'Starbucks',          tags: ['Social', 'Product'] },
  { id: '26', youtube_id: 'EZUJiL9MeLw', title: 'The Creature Transformation',          category: 'post',    client: 'Creative Project',   tags: ['VFX', 'Post Production'] },
]

const CATS = [
  { key: 'all',     label: 'All work' },
  { key: 'brand',   label: 'Brand & Commercial' },
  { key: 'ai',      label: 'AI Video' },
  { key: 'cooking', label: 'Cooking & Food' },
  { key: 'drone',   label: 'Drone & Aerial' },
  { key: 'social',  label: 'Short & Social' },
  { key: 'post',    label: 'Post Production' },
]

const STATS = [
  { num: '500+', label: 'Videos produced' },
  { num: '12+', label: 'Years in production' },
  { num: '48h', label: 'Average turnaround' },
  { num: '98%', label: 'Client satisfaction' },
]

function fromCms(row: PortfolioItem): WorkItem | null {
  if (!row.youtube_id) return null
  return {
    id: row.id,
    youtube_id: row.youtube_id,
    title: row.title,
    category: row.category,
    client: row.client_name || 'Imba Production',
    tags: row.tags ?? [],
  }
}

export default function Work() {
  const [items, setItems] = useState<WorkItem[]>(FALLBACK)
  const [activeCategory, setActiveCategory] = useState('all')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('portfolio_items')
      .select('*')
      .eq('published', true)
      .order('sort_order')
      .then(({ data }) => {
        const mapped = (data as PortfolioItem[] | null)?.map(fromCms).filter((x): x is WorkItem => Boolean(x))
        if (mapped?.length) setItems(mapped)
      })
  }, [])

  const filtered = activeCategory === 'all'
    ? items
    : items.filter(p => p.category === activeCategory)

  return (
    <>
      <Seo
        title="Our Work — Video Portfolio"
        description="Cinematic storytelling across brand, AI, product, social, cooking, and post-production. Browse selected work from Imba Production's video portfolio."
        canonicalPath="/work"
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
              { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://imbaproduction.com/' },
              { '@type': 'ListItem', 'position': 2, 'name': 'Work', 'item': 'https://imbaproduction.com/work' },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            'name': 'Imba Production Work',
            'url': 'https://imbaproduction.com/work',
            'hasPart': items.map(item => ({
              '@type': 'VideoObject',
              'name': item.title,
              'description': `${item.title} — ${item.category} production for ${item.client}, by Imba Production.`,
              'thumbnailUrl': `https://img.youtube.com/vi/${item.youtube_id}/maxresdefault.jpg`,
              'embedUrl': `https://www.youtube.com/embed/${item.youtube_id}`,
              'uploadDate': '2024-01-01',
              'contentUrl': `https://www.youtube.com/watch?v=${item.youtube_id}`,
              'publisher': { '@type': 'Organization', 'name': 'Imba Production' },
            })),
          },
        ]}
      />
      <PageHero
        eyebrow="Selected work"
        title="500+ brand stories."
        titleAccent="One studio."
        subtitle="12 years across brand, AI, product, social and post. Pick a category to filter or scroll through the reel."
      />

      <div className="border-y border-hairline grid grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ num, label }, i) => (
          <div key={label} className={`px-8 lg:px-10 py-7 ${i < 3 ? 'border-r border-hairline' : ''}`}>
            <div className="font-display font-bold text-smoke leading-none" style={{ fontSize: '2.4rem' }}>
              <span>{num.replace(/[+%h]/g, '')}</span>
              <em className="text-ember not-italic">{num.match(/[+%h]/)?.[0] ?? ''}</em>
            </div>
            <div className="font-mono-custom text-[0.58rem] tracking-[0.18em] uppercase text-ink-faint mt-1.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="sticky top-16 z-30 bg-canvas/90 border-b border-hairline" style={{ backdropFilter: 'blur(12px)' }}>
        <div className="px-6 lg:px-12 py-4 max-w-screen-xl mx-auto flex gap-1.5 overflow-x-auto">
          {CATS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className="flex-shrink-0 font-mono-custom text-[0.65rem] tracking-[0.12em] uppercase px-4 py-2 transition-all duration-200"
              style={{
                background: activeCategory === key ? '#E6B774' : 'transparent',
                color: activeCategory === key ? '#0C0D0F' : '#9B9D99',
                border: `1px solid ${activeCategory === key ? '#E6B774' : 'rgba(243,242,238,0.10)'}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <section className="bg-canvas py-12 px-6 lg:px-12">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-video cursor-pointer overflow-hidden bg-canvas"
              onClick={() => setPlayingId(item.youtube_id)}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <img
                src={`https://img.youtube.com/vi/${item.youtube_id}/maxresdefault.jpg`}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.03]"
                style={{ filter: hoveredId === item.id ? 'saturate(1) brightness(1)' : 'saturate(0.55) brightness(0.85)' }}
                onError={e => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${item.youtube_id}/hqdefault.jpg` }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent transition-opacity duration-500"
                style={{ opacity: hoveredId === item.id ? 0.85 : 0.7 }}
              />

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="font-mono-custom text-[0.58rem] tracking-[0.2em] uppercase mb-2 text-ember">
                  {item.client}
                </div>
                <div className="font-display font-normal text-smoke text-xl leading-tight">{item.title}</div>
                <div className="flex gap-3 mt-2 flex-wrap">
                  {item.tags.map(t => (
                    <span key={t} className="font-mono-custom text-[0.52rem] tracking-wider text-ink-faint/60 uppercase">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-canvas py-20 px-6 lg:px-12 border-t border-hairline">
        <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <p className="eyebrow mb-4">Ready to be next?</p>
            <h2 className="font-display font-bold text-smoke leading-tight"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
              Let's create something<br /><em className="italic">extraordinary together</em>
            </h2>
            <p className="text-ink-dim mt-3 max-w-md" style={{ fontSize: '0.93rem' }}>
              Every great video starts with a conversation. Tell us your vision and we'll build it — free quote, 24h reply.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
            <Link to="/contact" className="btn btn-primary">Get a free quote</Link>
            <Link to="/services" className="btn btn-ghost">Explore services →</Link>
          </div>
        </div>
      </section>

      {playingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-16"
          style={{ background: 'rgba(0,0,0,0.96)' }}
          onClick={() => setPlayingId(null)}
        >
          <div className="relative w-full max-w-5xl" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPlayingId(null)}
              className="absolute -top-10 right-0 font-mono-custom text-[0.65rem] tracking-widest uppercase text-ink-faint hover:text-smoke transition-colors"
            >
              Close ✕
            </button>
            <div className="absolute -top-px -left-px w-5 h-5 border-t border-l border-ember/50" />
            <div className="absolute -top-px -right-px w-5 h-5 border-t border-r border-ember/50" />
            <div className="absolute -bottom-px -left-px w-5 h-5 border-b border-l border-ember/50" />
            <div className="absolute -bottom-px -right-px w-5 h-5 border-b border-r border-ember/50" />
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${playingId}?autoplay=1&controls=1&rel=0&modestbranding=1`}
                className="w-full h-full"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
