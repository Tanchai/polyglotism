import { createFileRoute, Link } from '@tanstack/react-router'
import { Flame, Mic, PenLine, Brain, ArrowRight } from 'lucide-react'
import { japaneseCourse, comingSoonSubjects } from '@/content/japanese'
import { useIdentity } from '@/lib/identity-context'

export const Route = createFileRoute('/')({
  component: Landing,
})

const pillars = [
  {
    icon: Brain,
    title: 'Retention that sticks',
    body: 'Every phrase you learn rejoins a spaced-repetition queue, resurfacing right before you would forget it.',
  },
  {
    icon: PenLine,
    title: 'Real sentence building',
    body: 'Drag-and-drop word banks force you to think in Japanese word order, not just memorize vocabulary.',
  },
  {
    icon: Mic,
    title: 'Speak without flinching',
    body: 'Dedicated speaking reps with instant playback build the muscle memory for real conversation.',
  },
]

function Landing() {
  const { user, ready } = useIdentity()

  return (
    <div className="min-h-screen washi-texture">
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🈴</span>
          <span className="font-display text-2xl tracking-tight" style={{ color: 'var(--ink)' }}>
            Kaiwa
          </span>
        </div>
        {ready && user ? (
          <Link
            to="/learn"
            className="px-5 py-2.5 rounded-full font-bold text-sm text-white shadow-sm hover:-translate-y-0.5 transition-transform"
            style={{ background: 'var(--shu)' }}
          >
            Continue learning
          </Link>
        ) : (
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-full font-bold text-sm text-white shadow-sm hover:-translate-y-0.5 transition-transform"
            style={{ background: 'var(--shu)' }}
          >
            Sign in
          </Link>
        )}
      </nav>

      <header className="max-w-6xl mx-auto px-6 pt-10 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-pop">
          <p
            className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-5"
            style={{ background: 'rgba(193,68,14,0.1)', color: 'var(--shu-dark)' }}
          >
            First subject: 日本語 Japanese
          </p>
          <h1
            className="font-display text-5xl sm:text-6xl leading-[1.05] mb-6"
            style={{ color: 'var(--ink)' }}
          >
            Build a language habit that actually{' '}
            <span style={{ color: 'var(--shu)' }}>survives Tuesday.</span>
          </h1>
          <p className="text-lg mb-8 max-w-lg" style={{ color: '#5a5346' }}>
            Bite-sized lessons, a review queue tuned to your memory, and real speaking practice —
            all in one streak-shaped habit loop. Japanese is live today; more subjects are coming.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to={ready && user ? '/learn' : '/login'}
              search={ready && user ? undefined : { mode: 'signup' }}
              className="px-7 py-3.5 rounded-2xl font-bold text-white flex items-center gap-2 shadow-lg hover:-translate-y-0.5 transition-transform"
              style={{ background: 'var(--shu)', boxShadow: '0 8px 0 var(--shu-dark)' }}
            >
              Start learning Japanese <ArrowRight className="w-4 h-4" />
            </Link>
            <div
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-semibold"
              style={{ background: 'var(--paper-raised)', border: '1px solid var(--line)' }}
            >
              <Flame className="w-5 h-5" style={{ color: 'var(--shu)' }} />
              Free to start, no card required
            </div>
          </div>
        </div>

        <div className="relative animate-pop" style={{ animationDelay: '0.1s' }}>
          <div
            className="rounded-3xl p-8 shadow-xl relative overflow-hidden"
            style={{ background: 'var(--paper-raised)', border: '1px solid var(--line)' }}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20" style={{ background: 'var(--teal)' }} />
            <p className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--teal)' }}>
              Unit 1 · First Words
            </p>
            <p className="font-display text-3xl mb-2">こんにちは</p>
            <p className="text-sm mb-6" style={{ color: '#7a7362' }}>konnichiwa — "hello"</p>
            <div className="grid grid-cols-2 gap-3">
              {['はい', 'こんにちは', 'いいえ', 'ありがとう'].map((opt, i) => (
                <div
                  key={opt}
                  className="px-4 py-3 rounded-xl text-center font-display border-2"
                  style={{
                    borderColor: i === 1 ? 'var(--teal)' : 'var(--line)',
                    background: i === 1 ? 'rgba(29,92,99,0.08)' : 'transparent',
                  }}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <div
              key={p.title}
              className="p-7 rounded-3xl animate-pop"
              style={{
                background: i === 1 ? 'var(--ink)' : 'var(--paper-raised)',
                color: i === 1 ? 'var(--paper)' : 'var(--ink)',
                border: i === 1 ? 'none' : '1px solid var(--line)',
                animationDelay: `${0.15 + i * 0.08}s`,
              }}
            >
              <p.icon className="w-8 h-8 mb-4" style={{ color: i === 1 ? 'var(--gold)' : 'var(--shu)' }} />
              <h3 className="font-display text-xl mb-2">{p.title}</h3>
              <p className="text-sm opacity-80 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="font-display text-3xl mb-2">One habit, many subjects</h2>
        <p className="mb-8 max-w-2xl" style={{ color: '#5a5346' }}>
          Kaiwa starts with {japaneseCourse.title} and is built to grow — the same lesson map,
          streak, and review engine will power future subjects.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link
            to="/login"
            className="p-5 rounded-2xl border-2 flex flex-col gap-2 hover:-translate-y-1 transition-transform"
            style={{ borderColor: 'var(--shu)', background: 'var(--paper-raised)' }}
          >
            <span className="text-3xl">{japaneseCourse.flag}</span>
            <span className="font-bold">{japaneseCourse.title}</span>
            <span className="text-xs" style={{ color: 'var(--shu-dark)' }}>Live now</span>
          </Link>
          {comingSoonSubjects.map((s) => (
            <div
              key={s.title}
              className="p-5 rounded-2xl border flex flex-col gap-2 opacity-60"
              style={{ borderColor: 'var(--line)', background: 'var(--paper-raised)' }}
            >
              <span className="text-3xl">{s.flag}</span>
              <span className="font-bold">{s.title}</span>
              <span className="text-xs">{s.tagline}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-10 text-sm border-t" style={{ borderColor: 'var(--line)', color: '#8a8272' }}>
        Kaiwa — built one streak at a time.
      </footer>
    </div>
  )
}
