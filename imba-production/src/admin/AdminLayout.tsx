import { Outlet, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const NAV = [
  { to: '/admin', label: 'Dashboard', exact: true },
  { to: '/admin/hero-videos', label: 'Hero Videos' },
  { to: '/admin/portfolio', label: 'Portfolio' },
  { to: '/admin/blog', label: 'Blog' },
  { to: '/admin/quotes', label: 'Quote Requests' },
]

export default function AdminLayout() {
  const [session, setSession] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setLoginError(error.message)
  }

  if (loading) return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <div className="font-mono-custom text-smoke-faint text-sm animate-pulse">Loading...</div>
    </div>
  )

  if (!session) return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="font-display font-light text-3xl text-smoke mb-8">
          imba<span className="text-ember italic">.</span>admin
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {loginError && <p className="text-ember text-sm">{loginError}</p>}
          <button type="submit" className="btn btn-primary">Sign in</button>
        </form>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-ink flex">
      {/* Sidebar */}
      <aside className="w-56 bg-ink-2 border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <div className="font-display font-light text-xl text-smoke">
            imba<span className="text-ember italic">.</span>cms
          </div>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {NAV.map(({ to, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `px-3 py-2 font-mono-custom text-[0.68rem] tracking-[0.1em] uppercase transition-colors ${
                  isActive ? 'bg-ember/10 text-ember' : 'text-smoke-dim hover:text-smoke hover:bg-white/4'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => supabase.auth.signOut()}
            className="font-mono-custom text-[0.62rem] tracking-wider text-smoke-faint hover:text-ember transition-colors uppercase"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
