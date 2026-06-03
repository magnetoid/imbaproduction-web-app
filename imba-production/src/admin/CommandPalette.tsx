import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  LayoutDashboard, Film, Image, FileText, Tag, Star, Users, MessageSquare,
  Upload, Globe, Settings, Bot, Search, Layers, FolderOpen, FilePlus, Plus, Layout, Inbox,
} from 'lucide-react'

interface Cmd {
  label: string
  to: string
  icon: React.ElementType
  keywords?: string
}

const NAVIGATE: Cmd[] = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Hero Videos', to: '/admin/hero-videos', icon: Film },
  { label: 'Portfolio', to: '/admin/portfolio', icon: Image },
  { label: 'Pages', to: '/admin/pages', icon: Layout, keywords: 'landing builder visual' },
  { label: 'Services', to: '/admin/services', icon: Layers },
  { label: 'Media Library', to: '/admin/media', icon: FolderOpen, keywords: 'images files assets' },
  { label: 'Blog', to: '/admin/blog', icon: FileText, keywords: 'posts articles' },
  { label: 'Blog Categories', to: '/admin/blog/categories', icon: Tag },
  { label: 'Testimonials', to: '/admin/testimonials', icon: Star, keywords: 'reviews' },
  { label: 'Team', to: '/admin/team', icon: Users },
  { label: 'Quote Requests', to: '/admin/quotes', icon: MessageSquare, keywords: 'leads enquiries' },
  { label: 'Inbox', to: '/admin/inbox', icon: Inbox, keywords: 'email imap mail' },
  { label: 'Import / Export', to: '/admin/import', icon: Upload },
  { label: 'Translations', to: '/admin/translations', icon: Globe, keywords: 'i18n locale' },
  { label: 'Site Settings', to: '/admin/settings', icon: Settings },
  { label: 'CRM Settings', to: '/admin/crm-settings', icon: Bot, keywords: 'ai smtp provider' },
  { label: 'SEO & AI Studio', to: '/admin/seo', icon: Search },
]

const CREATE: Cmd[] = [
  { label: 'New blog post', to: '/admin/blog/new', icon: FilePlus, keywords: 'create article write' },
  { label: 'New page', to: '/admin/pages', icon: Layout, keywords: 'create landing builder' },
  { label: 'New portfolio item', to: '/admin/portfolio/new', icon: Plus, keywords: 'create work' },
  { label: 'New service', to: '/admin/services/new', icon: Plus, keywords: 'create' },
  { label: 'New testimonial', to: '/admin/testimonials/new', icon: Plus, keywords: 'create review' },
  { label: 'New team member', to: '/admin/team/new', icon: Plus, keywords: 'create person' },
  { label: 'New hero video', to: '/admin/hero-videos/new', icon: Plus, keywords: 'create' },
]

export default function CommandPalette() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    const onTrigger = () => setOpen(true)
    document.addEventListener('keydown', onKey)
    window.addEventListener('open-command-palette', onTrigger)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('open-command-palette', onTrigger)
    }
  }, [])

  const go = (to: string) => { setOpen(false); navigate(to) }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 overflow-hidden gap-0 max-w-xl">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <Command
          className="flex flex-col [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-[0.6rem] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-muted-foreground/50"
        >
          <Command.Input
            placeholder="Search pages and actions…"
            className="w-full px-4 py-3.5 bg-transparent border-b border-border outline-none text-sm placeholder:text-muted-foreground/50"
          />
          <Command.List className="max-h-[60vh] overflow-y-auto p-1.5">
            <Command.Empty className="px-3 py-8 text-center text-sm text-muted-foreground">
              No matches.
            </Command.Empty>

            <Command.Group heading="Create">
              {CREATE.map(item => (
                <Item key={item.to} item={item} onSelect={() => go(item.to)} />
              ))}
            </Command.Group>

            <Command.Group heading="Go to">
              {NAVIGATE.map(item => (
                <Item key={item.to} item={item} onSelect={() => go(item.to)} />
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function Item({ item, onSelect }: { item: Cmd; onSelect: () => void }) {
  const Icon = item.icon
  return (
    <Command.Item
      value={`${item.label} ${item.keywords ?? ''}`}
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer text-foreground aria-selected:bg-accent aria-selected:text-accent-foreground"
    >
      <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
      {item.label}
    </Command.Item>
  )
}
