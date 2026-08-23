import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import { Flame, Heart, Gem, Sparkles, LogOut } from 'lucide-react'
import { japaneseCourse } from '@/content/japanese'
import { getMyStats } from '@/server/stats.functions'
import { getCourseProgress } from '@/server/progress.functions'
import { useIdentity } from '@/lib/identity-context'
import { useNavigate } from '@tanstack/react-router'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

export const Route = createFileRoute('/_app/profile')({
  loader: async () => {
    const [stats, progress] = await Promise.all([
      getMyStats(),
      getCourseProgress({ data: { courseSlug: japaneseCourse.slug } }),
    ])
    return { stats, progress }
  },
  component: ProfilePage,
})

function ProfilePage() {
  const { stats, progress } = Route.useLoaderData()
  const { user, logout } = useIdentity()
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const totalLessons = japaneseCourse.units.reduce((n, u) => n + u.lessons.length, 0)
  const completedLessons = progress.filter((p) => p.status === 'completed').length

  const unitAccuracy = japaneseCourse.units.map((unit) => {
    const unitLessonIds = new Set(unit.lessons.map((l) => l.id))
    const relevant = progress.filter((p) => unitLessonIds.has(p.lessonId))
    const avg = relevant.length ? Math.round(relevant.reduce((s, p) => s + p.bestAccuracy, 0) / relevant.length) : 0
    return { title: unit.title, avg, color: unit.color }
  })

  const cards = [
    { label: 'Day streak', value: stats.streak, icon: Flame, color: 'var(--shu)' },
    { label: 'Hearts', value: stats.hearts, icon: Heart, color: '#d84545' },
    { label: 'Gems', value: stats.gems, icon: Gem, color: 'var(--teal)' },
    { label: 'Total XP', value: stats.xp, icon: Sparkles, color: 'var(--gold)' },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl mb-1">{user?.name || user?.email}</h1>
          <p style={{ color: '#8a8272' }}>
            Learning {japaneseCourse.title} {japaneseCourse.flag}
            {user?.lastSignInAt && (
              <span className="block mt-0.5">
                Last sign-in: {new Date(user.lastSignInAt).toLocaleString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={async () => {
            await logout()
            navigate({ to: '/' })
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border"
          style={{ borderColor: 'var(--line)', color: '#8a8272' }}
        >
          <LogOut className="w-4 h-4" /> Log out
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="p-5 rounded-2xl text-center animate-pop" style={{ background: 'var(--paper-raised)', border: '1px solid var(--line)' }}>
            <c.icon className="w-6 h-6 mx-auto mb-2" style={{ color: c.color }} />
            <p className="font-display text-2xl">{c.value}</p>
            <p className="text-xs" style={{ color: '#8a8272' }}>{c.label}</p>
          </div>
        ))}
      </div>

      {mounted && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl" style={{ background: 'var(--paper-raised)', border: '1px solid var(--line)' }}>
            <h2 className="font-display text-lg mb-4">Course completion</h2>
            <div className="max-w-[220px] mx-auto">
              <Doughnut
                data={{
                  labels: ['Completed', 'Remaining'],
                  datasets: [
                    {
                      data: [completedLessons, Math.max(totalLessons - completedLessons, 0)],
                      backgroundColor: ['#1d5c63', '#e4d8bd'],
                      borderWidth: 0,
                    },
                  ],
                }}
                options={{ plugins: { legend: { position: 'bottom' } } }}
              />
            </div>
          </div>
          <div className="p-6 rounded-2xl" style={{ background: 'var(--paper-raised)', border: '1px solid var(--line)' }}>
            <h2 className="font-display text-lg mb-4">Accuracy by unit</h2>
            <Bar
              data={{
                labels: unitAccuracy.map((u) => u.title),
                datasets: [
                  {
                    label: 'Best accuracy %',
                    data: unitAccuracy.map((u) => u.avg),
                    backgroundColor: unitAccuracy.map((u) => u.color),
                    borderRadius: 6,
                  },
                ],
              }}
              options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
