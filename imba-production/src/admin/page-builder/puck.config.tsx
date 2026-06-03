import type { Config } from '@puckeditor/core'

/**
 * Puck block palette for the visual page builder.
 * Each component is editable in the admin and rendered identically on the
 * public site via <Render> — one registry, no drift. Styled with the
 * project's Tailwind design tokens.
 */

export type PageComponents = {
  Hero: { title: string; subtitle: string; align: 'left' | 'center'; ctaLabel: string; ctaHref: string; backgroundUrl: string }
  Heading: { text: string; level: 'h2' | 'h3' | 'h4'; align: 'left' | 'center' | 'right' }
  Text: { text: string; align: 'left' | 'center' | 'right' }
  Image: { src: string; alt: string; caption: string; rounded: boolean }
  Button: { label: string; href: string; variant: 'primary' | 'outline' }
  Spacer: { size: 'sm' | 'md' | 'lg' | 'xl' }
  Divider: Record<string, never>
}

const ALIGN = {
  type: 'select' as const,
  options: [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ],
}

const alignClass = (a: string) =>
  a === 'center' ? 'text-center' : a === 'right' ? 'text-right' : 'text-left'

const SPACER_H: Record<string, string> = { sm: 'h-6', md: 'h-12', lg: 'h-20', xl: 'h-32' }

export const config: Config<PageComponents> = {
  root: {
    render: ({ children }) => <div className="page-canvas">{children}</div>,
  },
  components: {
    Hero: {
      label: 'Hero',
      fields: {
        title: { type: 'text' },
        subtitle: { type: 'textarea' },
        align: { type: 'select', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }] },
        ctaLabel: { type: 'text', label: 'CTA label' },
        ctaHref: { type: 'text', label: 'CTA link' },
        backgroundUrl: { type: 'text', label: 'Background image URL' },
      },
      defaultProps: {
        title: 'Cinematic video, powered by AI strategy',
        subtitle: 'A short supporting line that frames the value proposition.',
        align: 'center', ctaLabel: 'Get a quote', ctaHref: '/contact', backgroundUrl: '',
      },
      render: ({ title, subtitle, align, ctaLabel, ctaHref, backgroundUrl }) => (
        <section
          className={`relative px-6 py-24 md:py-32 ${align === 'center' ? 'text-center' : 'text-left'} ${backgroundUrl ? 'text-white' : 'text-foreground'}`}
          style={backgroundUrl ? { backgroundImage: `url(${backgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          {backgroundUrl && <div className="absolute inset-0 bg-black/50" />}
          <div className={`relative max-w-3xl ${align === 'center' ? 'mx-auto' : ''}`}>
            <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">{title}</h1>
            {subtitle && <p className="mt-5 text-lg md:text-xl opacity-90">{subtitle}</p>}
            {ctaLabel && (
              <a href={ctaHref || '#'} className={`mt-8 inline-flex items-center rounded-md px-6 py-3 text-sm font-medium transition-colors ${backgroundUrl ? 'bg-white text-black hover:bg-white/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
                {ctaLabel}
              </a>
            )}
          </div>
        </section>
      ),
    },

    Heading: {
      label: 'Heading',
      fields: {
        text: { type: 'text' },
        level: { type: 'select', options: [{ label: 'H2', value: 'h2' }, { label: 'H3', value: 'h3' }, { label: 'H4', value: 'h4' }] },
        align: ALIGN,
      },
      defaultProps: { text: 'Section heading', level: 'h2', align: 'left' },
      render: ({ text, level, align }) => {
        const Tag = level
        const size = level === 'h2' ? 'text-3xl md:text-4xl' : level === 'h3' ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'
        return (
          <div className="max-w-3xl mx-auto px-6">
            <Tag className={`font-display font-semibold tracking-tight text-foreground ${size} ${alignClass(align)}`}>{text}</Tag>
          </div>
        )
      },
    },

    Text: {
      label: 'Text',
      fields: { text: { type: 'textarea' }, align: ALIGN },
      defaultProps: { text: 'Write a paragraph of body copy here.', align: 'left' },
      render: ({ text, align }) => (
        <div className="max-w-3xl mx-auto px-6">
          <p className={`text-base md:text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap ${alignClass(align)}`}>{text}</p>
        </div>
      ),
    },

    Image: {
      label: 'Image',
      fields: {
        src: { type: 'text', label: 'Image URL' },
        alt: { type: 'text' },
        caption: { type: 'text' },
        rounded: { type: 'radio', options: [{ label: 'Rounded', value: true }, { label: 'Square', value: false }] },
      },
      defaultProps: { src: '', alt: '', caption: '', rounded: true },
      render: ({ src, alt, caption, rounded }) => (
        <figure className="max-w-4xl mx-auto px-6">
          {src
            ? <img src={src} alt={alt} className={`w-full object-cover ${rounded ? 'rounded-xl' : ''}`} />
            : <div className="w-full aspect-video rounded-xl border border-dashed border-border grid place-items-center text-sm text-muted-foreground">Add an image URL</div>}
          {caption && <figcaption className="mt-2 text-center text-sm text-muted-foreground">{caption}</figcaption>}
        </figure>
      ),
    },

    Button: {
      label: 'Button',
      fields: {
        label: { type: 'text' },
        href: { type: 'text', label: 'Link' },
        variant: { type: 'select', options: [{ label: 'Primary', value: 'primary' }, { label: 'Outline', value: 'outline' }] },
      },
      defaultProps: { label: 'Learn more', href: '#', variant: 'primary' },
      render: ({ label, href, variant }) => (
        <div className="px-6 text-center">
          <a
            href={href || '#'}
            className={`inline-flex items-center rounded-md px-6 py-3 text-sm font-medium transition-colors ${
              variant === 'primary'
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'border border-input bg-transparent text-foreground hover:bg-accent'
            }`}
          >
            {label}
          </a>
        </div>
      ),
    },

    Spacer: {
      label: 'Spacer',
      fields: { size: { type: 'select', options: [{ label: 'Small', value: 'sm' }, { label: 'Medium', value: 'md' }, { label: 'Large', value: 'lg' }, { label: 'XL', value: 'xl' }] } },
      defaultProps: { size: 'md' },
      render: ({ size }) => <div className={SPACER_H[size] ?? 'h-12'} aria-hidden />,
    },

    Divider: {
      label: 'Divider',
      fields: {},
      defaultProps: {},
      render: () => (
        <div className="max-w-3xl mx-auto px-6">
          <hr className="border-border" />
        </div>
      ),
    },
  },
}
