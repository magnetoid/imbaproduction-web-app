import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Render, type Data } from '@puckeditor/core'
import { config } from '@/admin/page-builder/puck.config'
import { supabase } from '@/lib/supabase'
import type { Page } from '@/lib/supabase'
import Seo from '@/components/Seo'
import { Loader2 } from 'lucide-react'

// Renders a published, visually-built page from its stored Puck JSON.
// Blocks are styled with Tailwind in the shared config, so no editor CSS
// is needed here — the public bundle stays clean.
export default function RenderedPage() {
  const { slug } = useParams<{ slug: string }>()
  const [page, setPage] = useState<Page | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'notfound'>('loading')

  useEffect(() => {
    if (!slug) { setState('notfound'); return }
    supabase.from('pages').select('*').eq('slug', slug).eq('status', 'published').maybeSingle()
      .then(({ data }) => {
        if (!data) { setState('notfound'); return }
        setPage(data as Page)
        setState('ready')
      })
  }, [slug])

  if (state === 'loading') return (
    <div className="min-h-[60vh] grid place-items-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )

  if (state === 'notfound' || !page) return (
    <div className="min-h-[60vh] grid place-items-center text-center px-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">Page not found</h1>
        <p className="text-muted-foreground">This page doesn’t exist or isn’t published.</p>
      </div>
    </div>
  )

  const seo = page.seo || {}
  return (
    <>
      <Seo
        title={seo.title || page.title}
        description={seo.description}
        ogImage={seo.og_image}
        canonicalPath={`/p/${page.slug}`}
        ogType="website"
      />
      <Render config={config} data={page.data as unknown as Data} />
    </>
  )
}
