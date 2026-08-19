import { createFileRoute, Outlet, redirect, Link, useRouterState } from '@tanstack/react-router'
import { Flame, Heart, Gem, User as UserIcon, BookOpen, RotateCcw } from 'lucide-react'
import { getServerUser } from '@/lib/auth'
import { getMyStats } from '@/server/stats.functions'

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ location }) => {
    const user = await getServerUser()
    if (!user) {
      throw redirect({ to: '/login', search: { mode: 'login' } })
    }
    return { user }
  },
  loader: async () => {
    const stats = await getMyStats()
    return { stats }
  },
  component: AppLayout,
})

const navItems = [
  { to: '/learn' as const, label: 'Learn', icon: BookOpen },
  { to: '/review' as const, label: 'Review', icon: RotateCcw },
  { to: '/profile' as const, label: 'Profile', icon: UserIcon },
]

function AppLayout() {
  const { stats } = Route.useLoaderData()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <div className="min-h-screen washi-texture">
      <header className="sticky top-0 z-10 backdrop-blur border-b" style={{ background: 'rgba(248,241,228,0.9)', borderColor: 'var(--line)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl">🈴</span>
            <span className="font-display text-lg hidden sm:inline">Kaiwa</span>
          </Link>

          <nav className="flex items-center gap-1 rounded-full p-1" style={{ background: 'var(--paper-raised)', border: '1px solid var(--line)' }}>
            {navItems.map((item) => {
              const active = pathname.startsWith(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors"
                  style={active ? { background: 'var(--ink)', color: 'var(--paper)' } : { color: '#8a8272' }}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <StatPill icon={Flame} value={stats.streak} color="var(--shu)" />
            <StatPill icon={Heart} value={stats.hearts} color="#d84545" />
            <StatPill icon={Gem} value={stats.gems} color="var(--teal)" />
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}

function StatPill({ icon: Icon, value, color }: { icon: typeof Flame; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1 font-bold text-sm" style={{ color }}>
      <Icon className="w-4 h-4" fill={color} />
      {value}
    </div>
  )
}
