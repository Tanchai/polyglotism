import { createFileRoute, Link } from '@tanstack/react-router'
import { Check, Lock, Star, Play, ShieldCheck } from 'lucide-react'
import { japaneseCourse } from '@/content/japanese'
import type { Lesson, Unit } from '@/content/japanese'
import { getCourseProgress } from '@/server/progress.functions'

export const Route = createFileRoute('/_app/learn')({
  loader: async () => {
    const progress = await getCourseProgress({ data: { courseSlug: japaneseCourse.slug } })
    return { progress }
  },
  component: LearnPage,
})

const OFFSETS = [0, 56, 88, 56, 0, -56, -88, -56]

interface PathNode {
  unit: Unit
  lesson: Lesson
  isExam: boolean
  offset: number
}

function buildNodes(): PathNode[] {
  const nodes: PathNode[] = []
  let off = 0
  for (const unit of japaneseCourse.units) {
    for (const lesson of unit.lessons) {
      nodes.push({ unit, lesson, isExam: false, offset: OFFSETS[off % OFFSETS.length] })
      off++
    }
    if (unit.exam) {
      nodes.push({ unit, lesson: unit.exam, isExam: true, offset: OFFSETS[off % OFFSETS.length] })
      off++
    }
  }
  return nodes
}

/** Nearest preceding NON-exam lesson id (exams never gate anything). */
function prevNormalLesson(nodes: PathNode[], idx: number): string | null {
  for (let i = idx - 1; i >= 0; i--) {
    if (!nodes[i].isExam) return nodes[i].lesson.id
  }
  return null
}

function LearnPage() {
  const { progress } = Route.useLoaderData()
  const completed = new Set(progress.filter((p) => p.status === 'completed').map((p) => p.lessonId))
  const nodes = buildNodes()

  const isLocked = (node: PathNode, idx: number) => {
    if (node.isExam) {
      const unitLessonIds = node.unit.lessons.map((l) => l.id)
      return !unitLessonIds.every((id) => completed.has(id))
    }
    const prevId = prevNormalLesson(nodes, idx)
    return prevId ? !completed.has(prevId) : false
  }

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
            {nodes
              .filter((n) => n.unit.id === unit.id)
              .map((node) => {
                const idx = nodes.indexOf(node)
                const isDone = completed.has(node.lesson.id)
                const locked = isLocked(node, idx)
                const offset = node.offset
                return (
                  <div
                    key={node.lesson.id}
                    style={{ transform: `translateX(${offset}px)` }}
                    className="flex flex-col items-center gap-2"
                  >
                    {locked ? (
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center border-4"
                        style={{ borderColor: 'var(--line)', background: '#ece2cd' }}
                        title={
                          node.isExam
                            ? 'Finish every lesson in this unit to unlock the exam'
                            : 'Complete the previous lesson to unlock'
                        }
                      >
                        <Lock className="w-7 h-7" style={{ color: '#a89c80' }} />
                      </div>
                    ) : (
                      <Link
                        to="/lesson/$lessonId"
                        params={{ lessonId: node.lesson.id }}
                        className="w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-lg hover:-translate-y-1 transition-transform"
                        style={{
                          borderColor: isDone ? '#e8c14e' : node.isExam ? '#d9a441' : 'white',
                          background: isDone
                            ? 'var(--gold)'
                            : node.isExam
                              ? 'var(--plum)'
                              : unit.color,
                        }}
                      >
                        {isDone ? (
                          <Star className="w-8 h-8 text-white" fill="white" />
                        ) : node.isExam ? (
                          <ShieldCheck className="w-8 h-8 text-white" />
                        ) : (
                          <Play className="w-7 h-7 text-white" fill="white" />
                        )}
                      </Link>
                    )}
                    <div className="text-center">
                      {node.isExam && (
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide mb-1"
                          style={{ background: 'rgba(122,73,136,0.14)', color: 'var(--plum)' }}
                        >
                          Exam
                        </span>
                      )}
                      <p className="font-bold text-sm">{node.lesson.title}</p>
                      <p className="text-xs font-display" style={{ color: '#8a8272' }}>
                        {node.lesson.subtitle}
                      </p>
                    </div>
                    {isDone && (
                      <span
                        className="flex items-center gap-1 text-xs font-bold"
                        style={{ color: node.isExam ? 'var(--plum)' : 'var(--teal)' }}
                      >
                        <Check className="w-3 h-3" /> {node.isExam ? 'certified' : 'completed'}
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