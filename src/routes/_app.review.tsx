import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { RotateCcw, Volume2, PartyPopper } from 'lucide-react'
import { japaneseCourse } from '@/content/japanese'
import { getDueReviewItems, touchReviewItems } from '@/server/review.functions'

export const Route = createFileRoute('/_app/review')({
  loader: async () => {
    const due = await getDueReviewItems({ data: { courseSlug: japaneseCourse.slug } })
    return { due }
  },
  component: ReviewPage,
})

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'ja-JP'
  utter.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utter)
}

function ReviewPage() {
  const { due } = Route.useLoaderData()
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(false)

  const items = due.map((d) => ({ ...d, vocab: japaneseCourse.vocab[d.itemId] })).filter((d) => d.vocab)
  const current = items[index]

  const rate = async (quality: 0 | 1 | 2) => {
    await touchReviewItems({ data: { courseSlug: japaneseCourse.slug, itemIds: [current.itemId], quality } })
    if (index + 1 >= items.length) setDone(true)
    else {
      setIndex(index + 1)
      setRevealed(false)
    }
  }

  if (items.length === 0 || done) {
    return (
      <div className="max-w-md mx-auto text-center py-16 animate-pop">
        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(29,92,99,0.12)' }}>
          <PartyPopper className="w-10 h-10" style={{ color: 'var(--teal)' }} />
        </div>
        <h1 className="font-display text-3xl mb-2">{done ? 'Review complete!' : 'Nothing due right now'}</h1>
        <p className="mb-8" style={{ color: '#7a7362' }}>
          {done
            ? 'Great work — those words just got pushed further out in your memory schedule.'
            : 'Finish more lessons to build up a review queue, or check back later.'}
        </p>
        <Link to="/learn" className="px-6 py-3 rounded-xl font-bold text-white inline-block" style={{ background: 'var(--shu)' }}>
          Back to Learn
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-8 font-bold" style={{ color: 'var(--teal)' }}>
        <RotateCcw className="w-5 h-5" /> {index + 1} / {items.length} due for review
      </div>

      <div
        className="rounded-3xl p-10 text-center shadow-lg animate-pop"
        style={{ background: 'var(--paper-raised)', border: '1px solid var(--line)' }}
        key={current.itemId}
      >
        <p className="font-display text-4xl mb-3">{current.vocab.jp}</p>
        <button onClick={() => speak(current.vocab.jp)} className="flex items-center gap-1 mx-auto text-sm font-semibold mb-6" style={{ color: 'var(--plum)' }}>
          <Volume2 className="w-4 h-4" /> Hear it
        </button>

        {revealed ? (
          <p className="font-display text-xl mb-2" style={{ color: 'var(--teal-dark)' }}>{current.vocab.en}</p>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="px-6 py-3 rounded-xl font-bold"
            style={{ background: 'var(--ink)', color: 'var(--paper)' }}
          >
            Show meaning
          </button>
        )}
      </div>

      {revealed && (
        <div className="grid grid-cols-3 gap-3 mt-6">
          <button onClick={() => rate(0)} className="py-3 rounded-xl font-bold text-white" style={{ background: '#b33333' }}>
            Forgot
          </button>
          <button onClick={() => rate(1)} className="py-3 rounded-xl font-bold text-white" style={{ background: 'var(--gold)' }}>
            Hard
          </button>
          <button onClick={() => rate(2)} className="py-3 rounded-xl font-bold text-white" style={{ background: 'var(--teal)' }}>
            Easy
          </button>
        </div>
      )}
    </div>
  )
}
