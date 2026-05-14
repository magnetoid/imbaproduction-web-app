import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Editorial Cinema palette ──
        // Light surface (canvas) is the default. Cinema is reserved for hero
        // reel + selected-work sections — places that need to feel like a film
        // still on a black gallery wall.
        canvas:     '#F4F1EC',         // warm off-white default
        paper:      '#FFFFFF',         // pure white, minimal use (lifted cards)
        ink:        '#15140F',         // warm near-black body text on light
        'ink-dim':  '#5C5856',
        'ink-faint':'#908A82',
        hairline:   'rgba(21,20,15,0.10)',

        cinema:     '#0E0E0E',         // deep neutral for video sections
        'cinema-2': '#161614',
        'paper-cinema': '#E8E5DE',     // warm off-white text on cinema
        'hairline-cinema': 'rgba(232,229,222,0.12)',

        'ink-navy': '#2D4A5A',         // single accent, used sparingly

        // ── Legacy aliases ──
        // Keep all previously-used tailwind colour names so existing className
        // references compile. They now point at the editorial palette.
        ground:     '#0E0E0E',
        surface:    '#161614',
        'surface-2':'#1F1F1B',
        'surface-3':'#28282A',
        'paper-dim': '#5C5856',
        'paper-faint': '#908A82',
        moss:       '#2D4A5A',
        ink2: {
          DEFAULT: '#0E0E0E',
          2: '#161614',
          3: '#1F1F1B',
          4: '#28282A',
        },
        // Tailwind names: existing className refs (`text-ink`, `bg-ink-2`, etc.)
        ink_: {
          DEFAULT: '#15140F',
          2: '#161614',
          3: '#1F1F1B',
          4: '#28282A',
        },
        smoke: {
          DEFAULT: '#15140F',
          dim: '#5C5856',
          faint: '#908A82',
        },
        ember: {
          DEFAULT: '#2D4A5A',
          dim: '#1A2D38',
          bright: '#3D6275',
        },
        gold: {
          DEFAULT: '#15140F',
          dim: '#5C5856',
        },
        cyber: {
          DEFAULT: '#15140F',
          dim: '#5C5856',
          glow: 'rgba(21,20,15,0.06)',
        },

        // shadcn tokens for admin
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ['Inter Tight', 'system-ui', 'sans-serif'],
        sans: ['Inter Tight', 'system-ui', 'sans-serif'],
        tight: ['Inter Tight', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem', letterSpacing: '0.12em' }],
      },
      spacing: {
        section: '8rem',          // py-32 default
        'section-lg': '10rem',    // py-40 on lg+
      },
      animation: {
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
