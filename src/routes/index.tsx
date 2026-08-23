import { createFileRoute, Link } from '@tanstack/react-router'
import { Flame, Mic, PenLine, Brain, ArrowRight, Sparkles, Globe } from 'lucide-react'
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

const kanaStrip = [
  'あ い う え お · か き く け こ · さ し す せ そ · ',
  'た ち つ て と · な に ぬ ね の · は ひ ふ へ ほ · ',
  'ま み む め も · や ゆ よ · ら り る れ ろ · ',
  'わ を ん · が ぎ ぐ げ ご · ざ じ ず ぜ ぞ · ',
]

function Landing() {
  const { user, ready } = useIdentity()

  return (
    <div className="min-h-screen hero-bg text-white">
      {/* aurora orbs */}
      <div className="orb w-96 h-96 -top-24 -left-24" style={{ background: 'rgba(255,122,60,0.5)' }} />
      <div className="orb w-[28rem] h-[28rem] top-1/3 right-0 translate-x-1/3" style={{ background: 'rgba(46,180,205,0.45)' }} />
      <div className="orb w-80 h-80 bottom-0 left-1/4" style={{ background: 'rgba(217,164,65,0.35)' }} />
      <div className="absolute inset-0 hero-grid" />

      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🈴</span>
          <span className="font-display text-2xl tracking-tight text-white">
            Duniya
          </span>
        </div>
        {ready && user ? (
          <Link
            to="/learn"
            className="px-5 py-2.5 rounded-full font-bold text-sm text-white btn-neon"
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

      <header className="max-w-6xl mx-auto px-6 pt-14 pb-16 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="animate-pop">
          <p
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase chip-glass"
          >
            <Sparkles className="w-3.5 h-3.5 inline" style={{ color: 'var(--gold)' }} /> First subject: 日本語 Japanese
          </p>
          <h1 className="font-display text-5xl sm:text-6xl leading-[1.05] mb-6">
            Fluency, made{' '}
            <span className="text-glow">easy.</span>
          </h1>
          <p className="text-lg mb-8 max-w-lg opacity-85">
            Bite-sized lessons, a review queue tuned to your memory, and real speaking practice —
            all wrapped in one streak-shaped habit loop. Japanese is live today; more of the world is coming.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to={ready && user ? '/learn' : '/login'}
              search={ready && user ? undefined : { mode: 'signup' }}
              className="px-7 py-3.5 rounded-2xl font-bold text-white flex items-center gap-2 btn-neon"
              style={{ background: 'var(--shu)' }}
            >
              Start learning Japanese <ArrowRight className="w-4 h-4" />
            </Link>
            <div
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-semibold chip-glass"
            >
              <Flame className="w-5 h-5" style={{ color: 'var(--shu)' }} />
              Free to start, no card required
            </div>
          </div>

          {/* marquee of kana */}
          <div
            className="mt-8 overflow-hidden relative border-t border-white/10"
            aria-hidden
          >
            <div className="marquee whitespace-nowrap">
              {[...kanaStrip, ...kanaStrip].map((line, i) => (
                <span key={i} className="text-sm tracking-[0.4em] opacity-50 px-4">
                  {line}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative animate-pop" style={{ animationDelay: '0.1s' }}>
          <div className="glass rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <div
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-25"
              style={{ background: 'var(--teal)' }}
            />
            <div className="shine-line h-px absolute top-0 inset-x-0" />
            <p className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--teal)' }}>
              Unit 1 · First Words
            </p>
            <p className="font-display text-3xl mb-2 text-white">こんにちは</p>
            <p className="text-sm mb-6 opacity-60">konnichiwa — "hello"</p>
            <div className="grid grid-cols-2 gap-3">
              {['はい', 'こんにちは', 'いいえ', 'ありがとう'].map((opt, i) => (
                <div
                  key={opt}
                  className="px-4 py-3 rounded-xl text-center font-display border-2 glass-glow"
                  style={{
                    borderColor: i === 1 ? 'var(--teal)' : 'rgba(255,255,255,0.18)',
                    background:
                      i === 1 ? 'rgba(46,180,205,0.12)' : 'rgba(255,255,255,0.04)',
                  }}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
          <Globe className="w-8 h-8 absolute -bottom-4 -left-4 text-white/40" />
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pb-16 relative z-10">
        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <div
              key={p.title}
              className="p-7 rounded-3xl animate-pop glass-glow"
              style={{
                background:
                  i === 1
                    ? 'linear-gradient(150deg, rgba(10,12,20,0.9), rgba(20,24,40,0.7))'
                    : 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.14)',
                animationDelay: `${0.15 + i * 0.08}s`,
              }}
            >
              <p.icon className="w-8 h-8 mb-4" style={{ color: i === 1 ? 'var(--gold)' : 'var(--teal)' }} />
              <h3 className="font-display text-xl mb-2 text-white">{p.title}</h3>
              <p className="text-sm opacity-80 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20 relative z-10">
        <h2 className="font-display text-3xl mb-2 text-white">One mind, every language</h2>
        <p className="mb-8 max-w-2xl opacity-80">
          Duniya starts with {japaneseCourse.title} and spans the globe — the same lesson map,
          streak, and review engine will power every language you add.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link
            to="/login"
            className="p-5 rounded-2xl border flex flex-col gap-2 hover:-translate-y-1 transition-transform glass-glow"
            style={{ borderColor: 'var(--shu)', background: 'rgba(255,255,255,0.06)' }}
          >
            <span className="text-3xl">{japaneseCourse.flag}</span>
            <span className="font-bold text-white">{japaneseCourse.title}</span>
            <span className="text-xs" style={{ color: 'var(--shu)' }}>Live now</span>
          </Link>
          {comingSoonSubjects.map((s) => (
            <div
              key={s.title}
              className="p-5 rounded-2xl border flex flex-col gap-2 opacity-55"
              style={{ borderColor: 'rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.03)' }}
            >
              <span className="text-3xl">{s.flag}</span>
              <span className="font-bold text-white">{s.title}</span>
              <span className="text-xs opacity-70">{s.tagline}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-10 text-sm border-t" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
        <span className="opacity-80">Duniya — the world, one language at a time.</span>
      </footer>
    </div>
  )
}