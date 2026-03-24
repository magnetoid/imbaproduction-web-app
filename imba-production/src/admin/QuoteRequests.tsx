import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { QuoteRequest } from '@/lib/supabase'

export default function QuoteRequests() {
  const [rows, setRows] = useState<QuoteRequest[]>([])
  useEffect(() => {
    supabase.from('quote_requests').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setRows(data)
    })
  }, [])
  return (
    <div className="p-8">
      <h1 className="font-display font-light text-3xl text-smoke mb-8">Quote Requests</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8">
              {['Name','Email','Company','Service','Status','Date'].map(h => (
                <th key={h} className="text-left font-mono-custom text-[0.6rem] tracking-wider text-smoke-faint uppercase py-3 pr-6">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                <td className="py-3 pr-6 text-smoke">{r.full_name}</td>
                <td className="py-3 pr-6 text-smoke-dim">{r.email}</td>
                <td className="py-3 pr-6 text-smoke-dim">{r.company}</td>
                <td className="py-3 pr-6 text-smoke-dim">{r.service_type}</td>
                <td className="py-3 pr-6">
                  <span className="font-mono-custom text-[0.58rem] px-2 py-1 bg-ember/10 text-ember uppercase tracking-wider">{r.status}</span>
                </td>
                <td className="py-3 pr-6 text-smoke-faint font-mono-custom text-[0.62rem]">
                  {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="py-8 text-smoke-faint text-center">No requests yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
