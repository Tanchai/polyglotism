import { useEffect, useMemo, useState } from 'react'
import { Volume2, Mic, Check, X } from 'lucide-react'
import type { Exercise } from '@/content/japanese'

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'ja-JP'
  utter.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utter)
}

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/[、。！？\s]/g, '')
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(((i + 7) * 2654435761) % (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function ExerciseView({
  exercise,
  onResult,
}: {
  exercise: Exercise
  onResult: (correct: boolean) => void
}) {
  const [checked, setChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const submit = (correct: boolean) => {
    setIsCorrect(correct)
    setChecked(true)
  }

  const advance = () => onResult(isCorrect)

  return (
    <div key={exercise.id} className="animate-pop">
      <ExerciseBody exercise={exercise} checked={checked} isCorrect={isCorrect} onSubmit={submit} />
      {checked && (
        <div
          className="mt-6 -mx-6 sm:mx-0 sm:rounded-2xl px-6 py-4 flex items-center justify-between"
          style={{ background: isCorrect ? 'rgba(29,92,99,0.12)' : 'rgba(216,69,69,0.12)' }}
        >
          <div className="flex items-center gap-2 font-bold" style={{ color: isCorrect ? 'var(--teal-dark)' : '#b33333' }}>
            {isCorrect ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
            {isCorrect ? 'Nice!' : 'Not quite'}
          </div>
          <button
            onClick={advance}
            className="px-6 py-2.5 rounded-xl font-bold text-white"
            style={{ background: isCorrect ? 'var(--teal)' : '#b33333' }}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  )
}

function ExerciseBody({
  exercise,
  checked,
  isCorrect,
  onSubmit,
}: {
  exercise: Exercise
  checked: boolean
  isCorrect: boolean
  onSubmit: (correct: boolean) => void
}) {
  switch (exercise.type) {
    case 'multiple_choice':
      return <MultipleChoice exercise={exercise} checked={checked} onSubmit={onSubmit} />
    case 'word_bank':
      return <WordBank exercise={exercise} checked={checked} onSubmit={onSubmit} />
    case 'listening':
      return <Listening exercise={exercise} checked={checked} onSubmit={onSubmit} />
    case 'speaking':
      return <Speaking exercise={exercise} checked={checked} isCorrect={isCorrect} onSubmit={onSubmit} />
    case 'writing':
      return <Writing exercise={exercise} checked={checked} onSubmit={onSubmit} />
    case 'matching':
      return <Matching exercise={exercise} checked={checked} onSubmit={onSubmit} />
  }
}

function MultipleChoice({ exercise, checked, onSubmit }: any) {
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <div>
      <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--teal)' }}>
        Select the correct meaning
      </p>
      <h3 className="font-display text-2xl mb-6">{exercise.prompt}</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {exercise.options.map((opt: { id: string; text: string }) => {
          const isSel = selected === opt.id
          const showCorrect = checked && opt.id === exercise.correctOptionId
          const showWrong = checked && isSel && opt.id !== exercise.correctOptionId
          return (
            <button
              key={opt.id}
              disabled={checked}
              onClick={() => setSelected(opt.id)}
              className={`px-5 py-4 rounded-2xl border-2 font-display text-lg text-left transition-colors ${
                showWrong ? 'animate-shake' : ''
              }`}
              style={{
                borderColor: showCorrect ? 'var(--teal)' : showWrong ? '#b33333' : isSel ? 'var(--ink)' : 'var(--line)',
                background: showCorrect ? 'rgba(29,92,99,0.1)' : showWrong ? 'rgba(179,51,51,0.1)' : 'var(--paper-raised)',
              }}
            >
              {opt.text}
            </button>
          )
        })}
      </div>
      {!checked && (
        <button
          disabled={!selected}
          onClick={() => onSubmit(selected === exercise.correctOptionId)}
          className="mt-6 px-6 py-2.5 rounded-xl font-bold text-white disabled:opacity-40"
          style={{ background: 'var(--ink)' }}
        >
          Check
        </button>
      )}
    </div>
  )
}

function WordBank({ exercise, checked, onSubmit }: any) {
  const shuffled = useMemo(() => shuffle(exercise.bank.map((w: string, i: number) => ({ word: w, key: i }))), [exercise.id])
  const [chosenKeys, setChosenKeys] = useState<number[]>([])

  const chosenWords = chosenKeys.map((k) => shuffled.find((s: any) => s.key === k)!.word)
  const available = shuffled.filter((s: any) => !chosenKeys.includes(s.key))

  return (
    <div>
      <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--teal)' }}>
        Tap the words in order
      </p>
      <h3 className="font-display text-2xl mb-6">{exercise.prompt}</h3>

      <div className="min-h-16 flex flex-wrap gap-2 mb-6 pb-3 border-b-2" style={{ borderColor: 'var(--line)' }}>
        {chosenKeys.map((k, i) => (
          <button
            key={k}
            disabled={checked}
            onClick={() => setChosenKeys((c) => c.filter((_, idx) => idx !== i))}
            className="px-4 py-2 rounded-xl font-display text-lg text-white"
            style={{ background: 'var(--ink)' }}
          >
            {shuffled.find((s: any) => s.key === k)!.word}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {available.map((s: any) => (
          <button
            key={s.key}
            disabled={checked}
            onClick={() => setChosenKeys((c) => [...c, s.key])}
            className="px-4 py-2 rounded-xl font-display text-lg border-2"
            style={{ borderColor: 'var(--line)', background: 'var(--paper-raised)' }}
          >
            {s.word}
          </button>
        ))}
      </div>

      {!checked && (
        <button
          disabled={chosenKeys.length === 0}
          onClick={() => onSubmit(JSON.stringify(chosenWords) === JSON.stringify(exercise.correctOrder))}
          className="mt-6 px-6 py-2.5 rounded-xl font-bold text-white disabled:opacity-40"
          style={{ background: 'var(--ink)' }}
        >
          Check
        </button>
      )}
    </div>
  )
}

function Listening({ exercise, checked, onSubmit }: any) {
  const [value, setValue] = useState('')
  useEffect(() => {
    const t = setTimeout(() => speak(exercise.audioText), 250)
    return () => clearTimeout(t)
  }, [exercise.id])

  return (
    <div>
      <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--teal)' }}>
        Type what you hear
      </p>
      <button
        onClick={() => speak(exercise.audioText)}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-md"
        style={{ background: 'var(--teal)' }}
      >
        <Volume2 className="w-9 h-9 text-white" />
      </button>
      <p className="text-sm mb-4" style={{ color: '#8a8272' }}>Hint: {exercise.hint}</p>
      <input
        disabled={checked}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type in romaji or kana"
        className="w-full px-4 py-3 rounded-xl border-2 outline-none font-display text-lg"
        style={{ borderColor: 'var(--line)' }}
      />
      {!checked && (
        <button
          disabled={!value.trim()}
          onClick={() => onSubmit(exercise.accepted.some((a: string) => normalize(a) === normalize(value)))}
          className="mt-6 px-6 py-2.5 rounded-xl font-bold text-white disabled:opacity-40"
          style={{ background: 'var(--ink)' }}
        >
          Check
        </button>
      )}
    </div>
  )
}

function Speaking({ exercise, checked, isCorrect, onSubmit }: any) {
  const [recording, setRecording] = useState(false)
  const [heard, setHeard] = useState('')
  const supported = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return
    const rec = new SpeechRecognition()
    rec.lang = 'ja-JP'
    rec.interimResults = false
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setHeard(transcript)
      onSubmit(normalize(transcript).length > 0)
    }
    rec.onerror = () => setRecording(false)
    rec.onend = () => setRecording(false)
    setRecording(true)
    rec.start()
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--teal)' }}>
        Speak this phrase out loud
      </p>
      <h3 className="font-display text-2xl mb-1">{exercise.prompt}</h3>
      <div className="my-6 p-6 rounded-2xl text-center" style={{ background: 'rgba(122,73,136,0.08)' }}>
        <p className="font-display text-3xl mb-2">{exercise.targetText}</p>
        <p className="text-sm" style={{ color: '#8a8272' }}>{exercise.targetReading}</p>
        <button onClick={() => speak(exercise.targetText)} className="mt-3 flex items-center gap-1 mx-auto text-sm font-semibold" style={{ color: 'var(--plum)' }}>
          <Volume2 className="w-4 h-4" /> Hear it
        </button>
      </div>

      {supported ? (
        <button
          disabled={checked}
          onClick={startRecording}
          className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
          style={{ background: recording ? '#b33333' : 'var(--shu)' }}
        >
          <Mic className="w-5 h-5" /> {recording ? 'Listening…' : 'Tap to speak'}
        </button>
      ) : !checked ? (
        <button
          onClick={() => onSubmit(true)}
          className="w-full py-4 rounded-2xl font-bold text-white"
          style={{ background: 'var(--shu)' }}
        >
          I said it out loud
        </button>
      ) : null}

      {heard && <p className="mt-3 text-sm text-center" style={{ color: '#8a8272' }}>Heard: "{heard}"</p>}
      {checked && !isCorrect && <p className="mt-3 text-sm text-center">Give it another go next time — repetition builds the muscle memory.</p>}
    </div>
  )
}

function Writing({ exercise, checked, onSubmit }: any) {
  const [value, setValue] = useState('')
  return (
    <div>
      <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--teal)' }}>
        Write it out
      </p>
      <h3 className="font-display text-2xl mb-2">{exercise.prompt}</h3>
      <p className="text-sm mb-4" style={{ color: '#8a8272' }}>Hint: {exercise.hint}</p>
      <input
        disabled={checked}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type your answer"
        className="w-full px-4 py-3 rounded-xl border-2 outline-none font-display text-lg"
        style={{ borderColor: 'var(--line)' }}
      />
      {!checked && (
        <button
          disabled={!value.trim()}
          onClick={() => onSubmit(exercise.accepted.some((a: string) => normalize(a) === normalize(value)))}
          className="mt-6 px-6 py-2.5 rounded-xl font-bold text-white disabled:opacity-40"
          style={{ background: 'var(--ink)' }}
        >
          Check
        </button>
      )}
    </div>
  )
}

function Matching({ exercise, checked, onSubmit }: any) {
  const leftItems = useMemo(() => shuffle(exercise.pairs.map((p: any) => ({ id: p.id, text: p.left }))), [exercise.id])
  const rightItems = useMemo(() => shuffle(exercise.pairs.map((p: any) => ({ id: p.id, text: p.right }))), [exercise.id])
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [matched, setMatched] = useState<string[]>([])
  const [wrongFlash, setWrongFlash] = useState<string | null>(null)

  useEffect(() => {
    if (matched.length === exercise.pairs.length && matched.length > 0 && !checked) {
      onSubmit(true)
    }
  }, [matched])

  const pick = (side: 'left' | 'right', id: string, text: string) => {
    if (checked || matched.includes(id)) return
    if (side === 'left') {
      setSelectedLeft(id)
      return
    }
    if (!selectedLeft) return
    if (selectedLeft === id) {
      setMatched((m) => [...m, id])
      setSelectedLeft(null)
    } else {
      setWrongFlash(id)
      setTimeout(() => setWrongFlash(null), 400)
      setSelectedLeft(null)
    }
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-widest font-bold mb-6" style={{ color: 'var(--teal)' }}>
        Match the pairs
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          {leftItems.map((item: any) => (
            <button
              key={item.id}
              disabled={matched.includes(item.id)}
              onClick={() => pick('left', item.id, item.text)}
              className="px-4 py-3 rounded-xl border-2 font-display disabled:opacity-30"
              style={{ borderColor: selectedLeft === item.id ? 'var(--ink)' : 'var(--line)' }}
            >
              {item.text}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {rightItems.map((item: any) => (
            <button
              key={item.id}
              disabled={matched.includes(item.id)}
              onClick={() => pick('right', item.id, item.text)}
              className={`px-4 py-3 rounded-xl border-2 disabled:opacity-30 ${wrongFlash === item.id ? 'animate-shake' : ''}`}
              style={{ borderColor: wrongFlash === item.id ? '#b33333' : 'var(--line)' }}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
