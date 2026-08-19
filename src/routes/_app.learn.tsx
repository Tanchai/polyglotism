import { createFileRoute, Link } from '@tanstack/react-router'
import { Check, Lock, Star, Play } from 'lucide-react'
import { japaneseCourse } from '@/content/japanese'
import { getCourseProgress } from '@/server/progress.functions'

export const Route = createFileRoute('/_app/learn')({
  loader: async () => {
    const progress = await getCourseProgress({ data: { courseSlug: japaneseCourse.slug } })
    return { progress }
  },
  component: LearnPage,
})

const OFFSETS = [0, 56, 88, 56, 0, -56, -88, -56]

function LearnPage() {
  const { progress } = Route.useLoaderData()
  const completed = new Set(progress.filter((p) => p.status === 'completed').map((p) => p.lessonId))

  const flatLessons = japaneseCourse.units.flatMap((unit) => unit.lessons.map((lesson) => ({ unit, lesson })))
  let globalIndex = 0

  return (
    <div className="flex flex-col items-center gap-14 pb-20">
      {japaneseCourse.units.map((unit) => (
        <section key={unit.id} className="w-full max-w-md">
          <div
            className="rounded-2xl px-6 py-4 mb-10 text-white shadow-md"
            style={{ background: unit.color }}
          >
            <p className="text-xs uppercase tracking-widest opacity-80 font-bold">Unit</p>
            <h2 className="font-display text-2xl">{unit.title}</h2>
            <p className="text-sm opacity-90">{unit.description}</p>
          </div>

          <div className="flex flex-col items-center gap-8">
            {unit.lessons.map((lesson) => {
              const idx = globalIndex++
              const isDone = completed.has(lesson.id)
              const prevLesson = flatLessons[idx - 1]?.lesson
              const isLocked = idx > 0 && prevLesson ? !completed.has(prevLesson.id) : false
              const offset = OFFSETS[idx % OFFSETS.length]

              return (
                <div key={lesson.id} style={{ transform: `translateX(${offset}px)` }} className="flex flex-col items-center gap-2">
                  {isLocked ? (
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center border-4"
                      style={{ borderColor: 'var(--line)', background: '#ece2cd' }}
                      title="Complete the previous lesson to unlock"
                    >
                      <Lock className="w-7 h-7" style={{ color: '#a89c80' }} />
                    </div>
                  ) : (
                    <Link
                      to="/lesson/$lessonId"
                      params={{ lessonId: lesson.id }}
                      className="w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-lg hover:-translate-y-1 transition-transform"
                      style={{
                        borderColor: isDone ? '#e8c14e' : 'white',
                        background: isDone ? 'var(--gold)' : unit.color,
                      }}
                    >
                      {isDone ? <Star className="w-8 h-8 text-white" fill="white" /> : <Play className="w-7 h-7 text-white" fill="white" />}
                    </Link>
                  )}
                  <div className="text-center">
                    <p className="font-bold text-sm">{lesson.title}</p>
                    <p className="text-xs font-display" style={{ color: '#8a8272' }}>{lesson.subtitle}</p>
                  </div>
                  {isDone && (
                    <span className="flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--teal)' }}>
                      <Check className="w-3 h-3" /> completed
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
