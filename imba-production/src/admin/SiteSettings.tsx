import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DEFAULT_SETTINGS, invalidateSiteSettings, type SiteSettings } from '@/lib/site-settings'
import type { ContactAddress, FooterLink, SocialLink } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

type StringKey =
  | 'contact_email'
  | 'contact_response'
  | 'footer_tagline'

const STRING_KEYS: StringKey[] = ['contact_email', 'contact_response', 'footer_tagline']

export default function SiteSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [s, setS] = useState<SiteSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    setLoading(true)
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      const merged: SiteSettings = { ...DEFAULT_SETTINGS }
      if (data) {
        for (const row of data as { key: string; value: unknown }[]) {
          if (row.key in merged) {
            (merged as unknown as Record<string, unknown>)[row.key] = row.value
          }
        }
      }
      setS(merged)
      setLoading(false)
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    const rows: { key: string; value: unknown }[] = [
      ...STRING_KEYS.map(k => ({ key: k, value: s[k] })),
      { key: 'contact_address', value: s.contact_address },
      { key: 'footer_services', value: s.footer_services },
      { key: 'footer_company',  value: s.footer_company },
      { key: 'social_links',    value: s.social_links },
    ]
    const { error } = await supabase
      .from('site_settings')
      .upsert(rows, { onConflict: 'key' })
    setSaving(false)
    if (error) {
      toast.error(`Save failed: ${error.message}`)
    } else {
      invalidateSiteSettings()
      toast.success('Site settings saved')
    }
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-1">Global site copy</p>
          <h1 className="text-3xl font-semibold text-foreground">Site Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Contact info, footer links, and social handles shared across every public page.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : <><Save className="mr-2 h-4 w-4" />Save all</>}
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Contact info</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ss-email">Contact email</Label>
              <Input
                id="ss-email"
                type="email"
                value={s.contact_email}
                onChange={e => setS({ ...s, contact_email: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Address</Label>
              <div className="grid grid-cols-2 gap-3">
                {(['line1', 'line2', 'city', 'region', 'postal', 'country'] as const).map(field => (
                  <Input
                    key={field}
                    placeholder={field}
                    value={s.contact_address[field] || ''}
                    onChange={e => setS({ ...s, contact_address: { ...s.contact_address, [field]: e.target.value } as ContactAddress })}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ss-response">Response-time blurb</Label>
              <Textarea
                id="ss-response"
                value={s.contact_response}
                onChange={e => setS({ ...s, contact_response: e.target.value })}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Footer</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ss-tagline">Footer tagline</Label>
              <Textarea
                id="ss-tagline"
                value={s.footer_tagline}
                onChange={e => setS({ ...s, footer_tagline: e.target.value })}
                rows={3}
              />
            </div>

            <LinkListEditor
              label="Services column"
              urlPlaceholder="/services/…"
              urlField="href"
              items={s.footer_services}
              onChange={v => setS({ ...s, footer_services: v })}
            />

            <LinkListEditor
              label="Company column"
              urlPlaceholder="/about"
              urlField="to"
              items={s.footer_company}
              onChange={v => setS({ ...s, footer_company: v })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Social links</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {s.social_links.map((row, idx) => (
              <div key={idx} className="grid grid-cols-[60px_1fr_2fr_auto] gap-2 items-center">
                <Input
                  placeholder="IG"
                  value={row.label}
                  onChange={e => setS({ ...s, social_links: s.social_links.map((r, i) => i === idx ? { ...r, label: e.target.value } : r) })}
                />
                <Input
                  placeholder="Instagram"
                  value={row.name || ''}
                  onChange={e => setS({ ...s, social_links: s.social_links.map((r, i) => i === idx ? { ...r, name: e.target.value } : r) })}
                />
                <Input
                  placeholder="https://…"
                  value={row.href}
                  onChange={e => setS({ ...s, social_links: s.social_links.map((r, i) => i === idx ? { ...r, href: e.target.value } : r) })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setS({ ...s, social_links: s.social_links.filter((_, i) => i !== idx) })}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => setS({ ...s, social_links: [...s.social_links, { label: '', name: '', href: '' } as SocialLink] })}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add social link
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : <><Save className="mr-2 h-4 w-4" />Save all</>}
          </Button>
        </div>
      </div>
    </div>
  )
}

function LinkListEditor({
  label,
  items,
  onChange,
  urlField,
  urlPlaceholder,
}: {
  label: string
  items: FooterLink[]
  onChange: (v: FooterLink[]) => void
  urlField: 'href' | 'to'
  urlPlaceholder: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {items.map((row, idx) => (
        <div key={idx} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-center">
          <Input
            placeholder="Label"
            value={row.label}
            onChange={e => onChange(items.map((r, i) => i === idx ? { ...r, label: e.target.value } : r))}
          />
          <Input
            placeholder={urlPlaceholder}
            value={row[urlField] || ''}
            onChange={e => onChange(items.map((r, i) => i === idx ? { ...r, [urlField]: e.target.value } : r))}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange(items.filter((_, i) => i !== idx))}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => onChange([...items, { label: '', [urlField]: '' } as FooterLink])}
      >
        <Plus className="h-3.5 w-3.5 mr-1" />
        Add link
      </Button>
    </div>
  )
}
