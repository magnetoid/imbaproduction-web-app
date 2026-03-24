import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [counts, setCounts] = useState({ portfolio:0, blog:0, quotes:0 })
  useEffect(() => {
    Promise.all([
      supabase.from('portfolio_items').select('*', { count:'exact', head:true }),
      supabase.from('blog_posts').select('*', { count:'exact', head:true }),
      supabase.from('quote_requests').select('*', { count:'exact', head:true }),
    ]).then(([p, b, q]) => setCounts({ portfolio: p.count||0, blog: b.count||0, quotes: q.count||0 }))
  }, [])
  return (
    <div className="p-8">
      <h1 className="font-display font-light text-3xl text-smoke mb-8">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        {[['Portfolio Items', counts.portfolio], ['Blog Posts', counts.blog], ['Quote Requests', counts.quotes]].map(([label, val]) => (
          <div key={String(label)} className="bg-ink-2 border border-white/5 p-6">
            <div className="font-display text-4xl text-smoke">{val}</div>
            <div className="font-mono-custom text-[0.62rem] tracking-wider text-smoke-faint uppercase mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
