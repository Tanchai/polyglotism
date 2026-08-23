import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { login, signup, AuthError, MissingIdentityError } from '@netlify/identity'
import { useIdentity } from '@/lib/identity-context'

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): { mode: 'login' | 'signup' } => ({
    mode: search.mode === 'signup' ? 'signup' : 'login',
  }),
  component: LoginPage,
})

function LoginPage() {
  const { mode } = Route.useSearch()
  const navigate = useNavigate()
  const { user, ready, refresh } = useIdentity()
  const [isSignup, setIsSignup] = useState(mode === 'signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'pending'>('idle')
  const [error, setError] = useState('')
  const [confirmSent, setConfirmSent] = useState(false)

  if (ready && user) {
    navigate({ to: '/learn' })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('pending')
    setError('')
    try {
      if (isSignup) {
        const u = await signup(email, password, { full_name: name })
        if (u.confirmedAt) {
          refresh()
          navigate({ to: '/learn' })
        } else {
          setConfirmSent(true)
        }
      } else {
        await login(email, password)
        refresh()
        navigate({ to: '/learn' })
      }
    } catch (err) {
      if (err instanceof MissingIdentityError) {
        setError('Sign-in only works once this site is deployed to Netlify — it cannot run on localhost.')
      } else if (err instanceof AuthError) {
        setError(err.status === 401 ? 'Invalid email or password.' : err.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setStatus('idle')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center washi-texture px-6">
      <div
        className="w-full max-w-md rounded-3xl p-8 shadow-xl animate-pop"
        style={{ background: 'var(--paper-raised)', border: '1px solid var(--line)' }}
      >
        <Link to="/" className="flex items-center gap-2 mb-8">
          <span className="text-2xl">🈴</span>
          <span className="font-display text-xl">Duniya</span>
        </Link>

        {confirmSent ? (
          <div className="text-center py-6">
            <p className="font-display text-2xl mb-3">Check your inbox</p>
            <p className="text-sm" style={{ color: '#7a7362' }}>
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl mb-1">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
            <p className="text-sm mb-6" style={{ color: '#7a7362' }}>
              {isSignup ? 'Start your streak today.' : 'Pick up your streak where you left off.'}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {isSignup && (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  required
                  className="px-4 py-3 rounded-xl border outline-none focus:border-[var(--shu)]"
                  style={{ borderColor: 'var(--line)' }}
                />
              )}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="px-4 py-3 rounded-xl border outline-none focus:border-[var(--shu)]"
                style={{ borderColor: 'var(--line)' }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="px-4 py-3 rounded-xl border outline-none focus:border-[var(--shu)]"
                style={{ borderColor: 'var(--line)' }}
              />
              {error && (
                <p className="text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(193,68,14,0.1)', color: 'var(--shu-dark)' }}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={status === 'pending'}
                className="mt-2 px-5 py-3.5 rounded-2xl font-bold text-white disabled:opacity-60"
                style={{ background: 'var(--shu)', boxShadow: '0 6px 0 var(--shu-dark)' }}
              >
                {status === 'pending' ? 'One moment…' : isSignup ? 'Sign up' : 'Log in'}
              </button>
            </form>

            <button
              className="mt-5 text-sm font-semibold w-full text-center"
              style={{ color: 'var(--teal)' }}
              onClick={() => setIsSignup((v) => !v)}
            >
              {isSignup ? 'Already have an account? Log in' : "New here? Create an account"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
