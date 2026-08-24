import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Heart, X, Trophy, Sparkles } from 'lucide-react'
import { courses } from '@/content/japanese'
import { ExerciseView } from '@/components/ExerciseView'
import { getMyStats, recordActivity, refillHearts, HEART_REFILL_GEM_COST } from '@/server/stats.functions'
import { completeLesson } from '@/server/progress.functions'
import { touchReviewItems } from '@/server/review.functions'

function findLesson(lessonId: string) {
  for (const course of Object.values(courses)) {
    for (const unit of course.units) {
      const lesson = unit.lessons.find((l) => l.id === lessonId)
      if (lesson) return { course, unit, lesson }
      if (unit.exam?.id === lessonId) return { course, unit, lesson: unit.exam }
    }
  }
  return null
}

export const Route = createFileRoute('/_app/lesson/$lessonId')({
  loader: async ({ params }) => {
    const found = findLesson(params.lessonId)
    if (!found) throw new Error('Lesson not found')
    const stats = await getMyStats()
    return { ...found, hearts: stats.hearts }
  },
  component: LessonPage,
})

function LessonPage() {
  const { course, unit, lesson, hearts: startingHearts } = Route.useLoaderData()
  const navigate = useNavigate()

  const [index, setIndex] = useState(0)
  const [hearts, setHearts] = useState(startingHearts)
  const [correctCount, setCorrectCount] = useState(0)
  const [quality, setQuality] = useState<Record<string, 0 | 2>>({})
  const [phase, setPhase] = useState<'playing' | 'summary' | 'out-of-hearts'>(hearts <= 0 ? 'out-of-hearts' : 'playing')
  const [finishing, setFinishing] = useState(false)
  const [refilling, setRefilling] = useState(false)
  const [refillMsg, setRefillMsg] = useState('')

  const doRefill = async () => {
    setRefilling(true)
    setRefillMsg('')
    const res = await refillHearts()
    if (res.ok) {
      navigate({ to: '/learn' })
    } else if (res.reason === 'not_enough_gems') {
      setRefillMsg(`You need ${HEART_REFILL_GEM_COST} gems — you have ${res.stats.gems}.`)
    } else if (res.reason === 'already_full') {
      navigate({ to: '/learn' })
    } else {
      setRefillMsg('Something went wrong refilling your hearts.')
    }
    setRefilling(false)
  }

  const total = lesson.exercises.length
  const current = lesson.exercises[index]
  const progressPct = Math.round((index / total) * 100)

  const finish = async (finalCorrect: number, finalQuality: Record<string, 0 | 2>) => {
    setFinishing(true)
    const accuracy = Math.round((finalCorrect / total) * 100)
    const wrongCount = total - finalCorrect
    await Promise.all([
      completeLesson({ data: { courseSlug: course.slug, lessonId: lesson.id, accuracy } }),
      recordActivity({ data: { xpGained: finalCorrect * 10, heartsLost: wrongCount } }),
    ])
    const byQuality: Record<'0' | '2', string[]> = { '0': [], '2': [] }
    for (const [vocabId, q] of Object.entries(finalQuality)) {
      byQuality[String(q) as '0' | '2'].push(vocabId)
    }
    await Promise.all(
      (['0', '2'] as const)
        .filter((q) => byQuality[q].length > 0)
        .map((q) => touchReviewItems({ data: { courseSlug: course.slug, itemIds: byQuality[q], quality: Number(q) as 0 | 2 } })),
    )
    setFinishing(false)
    setPhase('summary')
  }

  const handleResult = (correct: boolean) => {
    const nextQuality = { ...quality }
    for (const vId of current.vocabIds) {
      if (!correct) nextQuality[vId] = 0
      else if (nextQuality[vId] === undefined) nextQuality[vId] = 2
    }
    setQuality(nextQuality)

    const nextCorrect = correct ? correctCount + 1 : correctCount
    setCorrectCount(nextCorrect)

    if (!correct) {
      const nextHearts = hearts - 1
      setHearts(nextHearts)
      if (nextHearts <= 0) {
        finish(nextCorrect, nextQuality)
        setPhase('out-of-hearts')
        return
      }
    }

    if (index + 1 >= total) {
      finish(nextCorrect, nextQuality)
    } else {
      setIndex(index + 1)
    }
  }

  if (phase === 'out-of-hearts') {
    return (
      <div className="max-w-md mx-auto text-center py-16 animate-pop">
        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(216,69,69,0.12)' }}>
          <Heart className="w-10 h-10" style={{ color: '#d84545' }} />
        </div>
        <h1 className="font-display text-3xl mb-3">Out of hearts</h1>
        <p className="mb-6" style={{ color: '#7a7362' }}>
          Complete lessons to earn gems, then spend {HEART_REFILL_GEM_COST} to refill.
        </p>
        <button
          onClick={doRefill}
          disabled={refilling}
          className="w-full px-6 py-3.5 rounded-xl font-bold text-white mb-3 disabled:opacity-60"
          style={{ background: 'var(--shu)' }}
        >
          {refilling ? 'Refilling…' : `Refill hearts · ${HEART_REFILL_GEM_COST} gems`}
        </button>
        {refillMsg && (
          <p className="mb-3 text-sm" style={{ color: '#b33333' }}>{refillMsg}</p>
        )}
        <Link to="/learn" className="px-6 py-3 rounded-xl font-bold text-white inline-block" style={{ background: 'var(--ink)' }}>
          Back to the path
        </Link>
      </div>
    )
  }

  if (phase === 'summary') {
    const accuracy = Math.round((correctCount / total) * 100)
    return (
      <div className="max-w-md mx-auto text-center py-16 animate-pop">
        <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6" style={{ background: 'var(--gold)' }}>
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <h1 className="font-display text-3xl mb-2">Lesson complete!</h1>
        <p className="mb-8" style={{ color: '#7a7362' }}>{lesson.title} · {unit.title}</p>
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="p-5 rounded-2xl" style={{ background: 'var(--paper-raised)', border: '1px solid var(--line)' }}>
            <Sparkles className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--gold)' }} />
            <p className="font-display text-2xl">{correctCount * 10} XP</p>
          </div>
          <div className="p-5 rounded-2xl" style={{ background: 'var(--paper-raised)', border: '1px solid var(--line)' }}>
            <p className="font-display text-2xl">{accuracy}%</p>
            <p className="text-xs" style={{ color: '#8a8272' }}>accuracy</p>
          </div>
        </div>
        <Link to="/learn" className="px-6 py-3 rounded-xl font-bold text-white inline-block" style={{ background: 'var(--shu)' }}>
          Continue
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate({ to: '/learn' })} aria-label="Exit lesson" style={{ color: '#8a8272' }}>
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'var(--line)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%`, background: unit.color }}
          />
        </div>
        <div className="flex items-center gap-1 font-bold" style={{ color: '#d84545' }}>
          <Heart className="w-5 h-5" fill="#d84545" /> {hearts}
        </div>
      </div>

      {finishing ? (
        <p className="text-center py-16" style={{ color: '#8a8272' }}>Saving your progress…</p>
      ) : (
        <ExerciseView exercise={current} onResult={handleResult} />
      )}
    </div>
  )
}
