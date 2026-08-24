// Static course content for the Japanese track. Content lives in code (like a
// curriculum file) — only mutable per-user state (progress, streak, SRS) is in the database.

import { topVocabulary } from './topVocabulary'

export type ExerciseType =
  | 'multiple_choice'
  | 'word_bank'
  | 'listening'
  | 'speaking'
  | 'writing'
  | 'matching'
  | 'chained_sentence'
  | 'kanji_draw'

export interface VocabItem {
  id: string
  jp: string
  reading: string
  en: string
  /** Frequency rank out of the 1000 (lower = more common). Source: A Frequency Dictionary of Japanese (Routledge), derived from the BCCWJ corpus. */
  rank?: number
  /** Mnemonic hook — a vivid image/story to make the word stick. */
  mnemonic?: string
  /** Canonical sentence using this word (introduces it in context). */
  example?: { jp: string; reading: string; en: string }
}

export interface MultipleChoiceExercise {
  type: 'multiple_choice'
  id: string
  prompt: string
  audioText?: string
  options: { id: string; text: string }[]
  correctOptionId: string
  vocabIds: string[]
}

export interface WordBankExercise {
  type: 'word_bank'
  id: string
  prompt: string
  bank: string[]
  correctOrder: string[]
  vocabIds: string[]
}

export interface ListeningExercise {
  type: 'listening'
  id: string
  audioText: string
  accepted: string[]
  hint: string
  vocabIds: string[]
}

export interface SpeakingExercise {
  type: 'speaking'
  id: string
  prompt: string
  targetText: string
  targetReading: string
  vocabIds: string[]
}

export interface WritingExercise {
  type: 'writing'
  id: string
  prompt: string
  accepted: string[]
  hint: string
  vocabIds: string[]
}

export interface MatchingExercise {
  type: 'matching'
  id: string
  pairs: { id: string; left: string; right: string }[]
  vocabIds: string[]
}

/**
 * Cumulative sentence-builder. `knownBank` holds the words the learner has already
 * mastered; the target sentence stitches the NEW word(s) in with words they already
 * own. This is the "use learned words together, simple to complex" mechanic.
 */
export interface ChainedSentenceExercise {
  type: 'chained_sentence'
  id: string
  prompt: string
  /** Vocabulary already learned in earlier lessons that this sentence reuses. */
  knownBank: string[]
  /** The correct sentence, in order. Must draw from knownBank plus newOption. */
  correctOrder: string[]
  /** The single brand-new word being introduced/memorised here. */
  newWord: string
  /** English gloss of the full sentence, shown after answering. */
  gloss: string
  vocabIds: string[]
  /** Optional mnemonic hook shown on the answer screen to make the new word stick. */
  mnemonic?: string
}

/** Trace-the-character exercise backed by KanjiVG stroke-order data. */
export interface KanjiDrawExercise {
  type: 'kanji_draw'
  id: string
  /** The character to draw. */
  character: string
  /** Reading shown as a hint. */
  reading: string
  /** English meaning of the character. */
  meaning: string
  /** Number of strokes the character has (from KanjiVG). */
  strokeCount: number
  vocabIds: string[]
}

/** Learn the kana writing systems. Shows a glyph and asks the learner to pick
 * its reading (kana→romaji), or reverse — shows romaji and pick the glyph. */
export interface KanaExercise {
  type: 'kana'
  id: string
  /** Direction of the question. */
  mode: 'kana_to_romaji' | 'romaji_to_kana'
  /** Name of the script (shown as a badge). */
  script: 'hiragana' | 'katakana'
  /** The kana glyph to learn, or the answer glyph in reverse mode. */
  character: string
  /** Romaji reading. */
  reading: string
  /** A short hint, e.g. "the 'a' row". */
  hint: string
  options: { id: string; text: string }[]
  correctOptionId: string
  vocabIds: string[]
}

export type Exercise =
  | MultipleChoiceExercise
  | WordBankExercise
  | ListeningExercise
  | SpeakingExercise
  | WritingExercise
  | MatchingExercise
  | ChainedSentenceExercise
  | KanjiDrawExercise
  | KanaExercise

export interface Lesson {
  id: string
  title: string
  subtitle: string
  exercises: Exercise[]
  /** `exam` lessons are optional fluency checks between units — they never gate progress. */
  kind?: 'lesson' | 'exam'
}

export interface Unit {
  id: string
  title: string
  description: string
  color: string
  lessons: Lesson[]
  /** Optional fluency exam at the end of the unit. Never blocks the next unit. */
  exam?: Lesson
}

export interface Course {
  slug: string
  title: string
  flag: string
  nativeName: string
  tagline: string
  units: Unit[]
  vocab: Record<string, VocabItem>
}

/**
 * Auto-builds an optional fluency exam for a unit: it curates a well-rounded mix
 * of exercise types drawn from across the unit's lessons (one of each type present,
 * then a fill to ~8). Deterministic and reuses existing, already-renderable exercise
 * objects. Exams are optional — they never gate or block the next unit.
 */
function buildUnitExam(unit: Unit): Lesson {
  const all = unit.lessons.flatMap((l) => l.exercises)
  const picked: Exercise[] = []
  const seenTypes = new Set<string>()
  for (const e of all) {
    if (!seenTypes.has(e.type)) {
      seenTypes.add(e.type)
      picked.push(e)
    }
  }
  for (const e of all) {
    if (picked.length >= 8) break
    if (!picked.includes(e)) picked.push(e)
  }
  return {
    id: `${unit.id}-exam`,
    title: `${unit.title} Check`,
    subtitle: 'Fluency exam · optional',
    kind: 'exam',
    exercises: picked,
  }
}

function buildUnits(units: Unit[]): Unit[] {
  return units.map((u) => ({ ...u, exam: buildUnitExam(u) }))
}

const vocab: Record<string, VocabItem> = {
  konnichiwa: { id: 'konnichiwa', jp: 'こんにちは', reading: 'konnichiwa', en: 'hello / good afternoon' },
  ohayou: { id: 'ohayou', jp: 'おはよう', reading: 'ohayou', en: 'good morning' },
  arigatou: { id: 'arigatou', jp: 'ありがとう', reading: 'arigatou', en: 'thank you' },
  sayounara: { id: 'sayounara', jp: 'さようなら', reading: 'sayounara', en: 'goodbye' },
  hai: { id: 'hai', jp: 'はい', reading: 'hai', en: 'yes' },
  iie: { id: 'iie', jp: 'いいえ', reading: 'iie', en: 'no' },
  watashi: { id: 'watashi', jp: 'わたし', reading: 'watashi', en: 'I / me' },
  anata: { id: 'anata', jp: 'あなた', reading: 'anata', en: 'you' },
  namae: { id: 'namae', jp: 'なまえ', reading: 'namae', en: 'name' },
  gakusei: { id: 'gakusei', jp: 'がくせい', reading: 'gakusei', en: 'student' },
  neko: { id: 'neko', jp: 'ねこ', reading: 'neko', en: 'cat' },
  inu: { id: 'inu', jp: 'いぬ', reading: 'inu', en: 'dog' },
  mizu: { id: 'mizu', jp: 'みず', reading: 'mizu', en: 'water' },
  gohan: { id: 'gohan', jp: 'ごはん', reading: 'gohan', en: 'rice / meal' },
  oishii: { id: 'oishii', jp: 'おいしい', reading: 'oishii', en: 'delicious' },
  ichi: { id: 'ichi', jp: 'いち', reading: 'ichi', en: 'one' },
  ni: { id: 'ni', jp: 'に', reading: 'ni', en: 'two' },
  san: { id: 'san', jp: 'さん', reading: 'san', en: 'three' },
  desu: { id: 'desu', jp: 'です', reading: 'desu', en: '(polite "to be")' },
  suki: { id: 'suki', jp: 'すき', reading: 'suki', en: 'to like' },
}

export const japaneseCourse: Course = {
  slug: 'japanese',
  title: 'Japanese',
  flag: '🇯🇵',
  nativeName: '日本語',
  tagline: 'Greetings, sentence building, and everyday conversation',
  vocab: {
    ...vocab,
    // Merge in the frequency-ranked spoken-Japanese vocabulary so any word from
    // the top ~862 lemmas is available to lessons and spaced repetition.
    ...Object.fromEntries(topVocabulary.map((v) => [v.id, v])),
  },
  units: buildUnits([
    {
      id: 'u0',
      title: 'The Writing System',
      description: 'Read your first kana before you learn words',
      color: '#d9a441',
      lessons: [
        {
          id: 'u0l1',
          title: 'Hiragana Vowels',
          subtitle: 'あいうえお',
          exercises: [
            {
              type: 'kana',
              id: 'u0l1e1',
              mode: 'kana_to_romaji',
              script: 'hiragana',
              character: 'あ',
              reading: 'a',
              hint: "The first vowel — sounds like 'ah'",
              options: [
                { id: 'a', text: 'a' },
                { id: 'b', text: 'i' },
                { id: 'c', text: 'u' },
                { id: 'd', text: 'o' },
              ],
              correctOptionId: 'a',
              vocabIds: [],
            },
            {
              type: 'kana',
              id: 'u0l1e2',
              mode: 'kana_to_romaji',
              script: 'hiragana',
              character: 'い',
              reading: 'i',
              hint: "Sounds like 'ee'",
              options: [
                { id: 'a', text: 'e' },
                { id: 'b', text: 'i' },
                { id: 'c', text: 'a' },
                { id: 'd', text: 'u' },
              ],
              correctOptionId: 'b',
              vocabIds: [],
            },
            {
              type: 'kana',
              id: 'u0l1e3',
              mode: 'kana_to_romaji',
              script: 'hiragana',
              character: 'う',
              reading: 'u',
              hint: "Sounds like 'oo'",
              options: [
                { id: 'a', text: 'a' },
                { id: 'b', text: 'o' },
                { id: 'c', text: 'u' },
                { id: 'd', text: 'e' },
              ],
              correctOptionId: 'c',
              vocabIds: [],
            },
            {
              type: 'kana',
              id: 'u0l1e4',
              mode: 'kana_to_romaji',
              script: 'hiragana',
              character: 'え',
              reading: 'e',
              hint: "Sounds like 'eh'",
              options: [
                { id: 'a', text: 'e' },
                { id: 'b', text: 'i' },
                { id: 'c', text: 'u' },
                { id: 'd', text: 'o' },
              ],
              correctOptionId: 'a',
              vocabIds: [],
            },
            {
              type: 'kana',
              id: 'u0l1e5',
              mode: 'kana_to_romaji',
              script: 'hiragana',
              character: 'お',
              reading: 'o',
              hint: "Sounds like 'oh'",
              options: [
                { id: 'a', text: 'u' },
                { id: 'b', text: 'a' },
                { id: 'c', text: 'e' },
                { id: 'd', text: 'o' },
              ],
              correctOptionId: 'd',
              vocabIds: [],
            },
            {
              type: 'kana',
              id: 'u0l1e6',
              mode: 'romaji_to_kana',
              script: 'hiragana',
              character: 'あ',
              reading: 'a',
              hint: 'Pick the kana that sounds like "ah"',
              options: [
                { id: 'a', text: 'い' },
                { id: 'b', text: 'あ' },
                { id: 'c', text: 'え' },
                { id: 'd', text: 'お' },
              ],
              correctOptionId: 'b',
              vocabIds: [],
            },
          ],
        },
        {
          id: 'u0l2',
          title: 'Hiragana: K & S',
          subtitle: 'かきくけこ さしすせそ',
          exercises: [
            {
              type: 'kana',
              id: 'u0l2e1',
              mode: 'kana_to_romaji',
              script: 'hiragana',
              character: 'か',
              reading: 'ka',
              hint: "K-row, first sound — 'ka'",
              options: [
                { id: 'a', text: 'ka' },
                { id: 'b', text: 'sa' },
                { id: 'c', text: 'ki' },
                { id: 'd', text: 'ta' },
              ],
              correctOptionId: 'a',
              vocabIds: [],
            },
            {
              type: 'kana',
              id: 'u0l2e2',
              mode: 'kana_to_romaji',
              script: 'hiragana',
              character: 'き',
              reading: 'ki',
              hint: 'K-row — "ki"',
              options: [
                { id: 'a', text: 'ka' },
                { id: 'b', text: 'ki' },
                { id: 'c', text: 'ku' },
                { id: 'd', text: 'ke' },
              ],
              correctOptionId: 'b',
              vocabIds: [],
            },
            {
              type: 'kana',
              id: 'u0l2e3',
              mode: 'romaji_to_kana',
              script: 'hiragana',
              character: 'こ',
              reading: 'ko',
              hint: 'Pick the kana for "ko"',
              options: [
                { id: 'a', text: 'き' },
                { id: 'b', text: 'け' },
                { id: 'c', text: 'こ' },
                { id: 'd', text: 'く' },
              ],
              correctOptionId: 'c',
              vocabIds: [],
            },
            {
              type: 'kana',
              id: 'u0l2e4',
              mode: 'kana_to_romaji',
              script: 'hiragana',
              character: 'さ',
              reading: 'sa',
              hint: 'S-row — "sa"',
              options: [
                { id: 'a', text: 'sa' },
                { id: 'b', text: 'ka' },
                { id: 'c', text: 'shi' },
                { id: 'd', text: 'su' },
              ],
              correctOptionId: 'a',
              vocabIds: [],
            },
            {
              type: 'kana',
              id: 'u0l2e5',
              mode: 'kana_to_romaji',
              script: 'hiragana',
              character: 'し',
              reading: 'shi',
              hint: 'S-row — "shi" (like "she")',
              options: [
                { id: 'a', text: 'sa' },
                { id: 'b', text: 'shi' },
                { id: 'c', text: 'su' },
                { id: 'd', text: 'so' },
              ],
              correctOptionId: 'b',
              vocabIds: [],
            },
            {
              type: 'kana',
              id: 'u0l2e6',
              mode: 'romaji_to_kana',
              script: 'hiragana',
              character: 'せ',
              reading: 'se',
              hint: 'Pick the kana for "se"',
              options: [
                { id: 'a', text: 'す' },
                { id: 'b', text: 'せ' },
                { id: 'c', text: 'そ' },
                { id: 'd', text: 'し' },
              ],
              correctOptionId: 'b',
              vocabIds: [],
            },
          ],
        },
        {
          id: 'u0l3',
          title: 'Hiragana: T, N & More',
          subtitle: 'たちつてと なにぬねの',
          exercises: [
            {
              type: 'kana',
              id: 'u0l3e1',
              mode: 'kana_to_romaji',
              script: 'hiragana',
              character: 'た',
              reading: 'ta',
              hint: 'T-row — "ta"',
              options: [
                { id: 'a', text: 'ta' },
                { id: 'b', text: 'na' },
                { id: 'c', text: 'te' },
                { id: 'd', text: 'to' },
              ],
              correctOptionId: 'a',
              vocabIds: [],
            },
            {
              type: 'kana',
              id: 'u0l3e2',
              mode: 'kana_to_romaji',
              script: 'hiragana',
              character: 'ち',
              reading: 'chi',
              hint: 'T-row — "chi" (like "chee")',
              options: [
                { id: 'a', text: 'ta' },
                { id: 'b', text: 'tsu' },
                { id: 'c', text: 'chi' },
                { id: 'd', text: 'ni' },
              ],
              correctOptionId: 'c',
              vocabIds: [],
            },
            {
              type: 'kana',
              id: 'u0l3e3',
              mode: 'romaji_to_kana',
              script: 'hiragana',
              character: 'て',
              reading: 'te',
              hint: 'Pick the kana for "te"',
              options: [
                { id: 'a', text: 'た' },
                { id: 'b', text: 'て' },
                { id: 'c', text: 'と' },
                { id: 'd', text: 'ち' },
              ],
              correctOptionId: 'b',
              vocabIds: [],
            },
            {
              type: 'kana',
              id: 'u0l3e4',
              mode: 'kana_to_romaji',
              script: 'hiragana',
              character: 'な',
              reading: 'na',
              hint: 'N-row — "na"',
              options: [
                { id: 'a', text: 'na' },
                { id: 'b', text: 'ta' },
                { id: 'c', text: 'ni' },
                { id: 'd', text: 'ne' },
              ],
              correctOptionId: 'a',
              vocabIds: [],
            },
            {
              type: 'kana',
              id: 'u0l3e5',
              mode: 'kana_to_romaji',
              script: 'hiragana',
              character: 'ぬ',
              reading: 'nu',
              hint: 'N-row — "nu"',
              options: [
                { id: 'a', text: 'no' },
                { id: 'b', text: 'nu' },
                { id: 'c', text: 'ne' },
                { id: 'd', text: 'na' },
              ],
              correctOptionId: 'b',
              vocabIds: [],
            },
            {
              type: 'kana',
              id: 'u0l3e6',
              mode: 'romaji_to_kana',
              script: 'hiragana',
              character: 'は',
              reading: 'ha',
              hint: 'Pick the kana for "ha"',
              options: [
                { id: 'a', text: 'な' },
                { id: 'b', text: 'は' },
                { id: 'c', text: 'ひ' },
                { id: 'd', text: 'ほ' },
              ],
              correctOptionId: 'b',
              vocabIds: [],
            },
          ],
        },
        {
          id: 'u0l4',
          title: 'Katakana Intro',
          subtitle: 'アイウエオ カキクケコ',
          exercises: [
            {
              type: 'kana',
              id: 'u0l4e1',
              mode: 'kana_to_romaji',
              script: 'katakana',
              character: 'ア',
              reading: 'a',
              hint: 'Katakana "a" — sharper than hiragana',
              options: [
                { id: 'a', text: 'a' },
                { id: 'b', text: 'i' },
                { id: 'c', text: 'u' },
                { id: 'd', text: 'e' },
              ],
              correctOptionId: 'a',
              vocabIds: [],
            },
            {
              type: 'kana',
              id: 'u0l4e2',
              mode: 'kana_to_romaji',
              script: 'katakana',
              character: 'イ',
              reading: 'i',
              hint: 'Katakana "i"',
              options: [
                { id: 'a', text: 'e' },
                { id: 'b', text: 'i' },
                { id: 'c', text: 'a' },
                { id: 'd', text: 'o' },
              ],
              correctOptionId: 'b',
              vocabIds: [],
            },
            {
              type: 'kana',
              id: 'u0l4e3',
              mode: 'kana_to_romaji',
              script: 'katakana',
              character: 'ウ',
              reading: 'u',
              hint: 'Katakana "u"',
              options: [
                { id: 'a', text: 'o' },
                { id: 'b', text: 'u' },
                { id: 'c', text: 'a' },
                { id: 'd', text: 'i' },
              ],
              correctOptionId: 'b',
              vocabIds: [],
            },
            {
              type: 'kana',
              id: 'u0l4e4',
              mode: 'romaji_to_kana',
              script: 'katakana',
              character: 'カ',
              reading: 'ka',
              hint: 'Pick the katakana for "ka"',
              options: [
                { id: 'a', text: 'キ' },
                { id: 'b', text: 'カ' },
                { id: 'c', text: 'ク' },
                { id: 'd', text: 'ケ' },
              ],
              correctOptionId: 'b',
              vocabIds: [],
            },
            {
              type: 'kana',
              id: 'u0l4e5',
              mode: 'kana_to_romaji',
              script: 'katakana',
              character: 'コ',
              reading: 'ko',
              hint: 'Katakana "ko"',
              options: [
                { id: 'a', text: 'ki' },
                { id: 'b', text: 'ku' },
                { id: 'c', text: 'ke' },
                { id: 'd', text: 'ko' },
              ],
              correctOptionId: 'd',
              vocabIds: [],
            },
            {
              type: 'kana',
              id: 'u0l4e6',
              mode: 'romaji_to_kana',
              script: 'katakana',
              character: 'サ',
              reading: 'sa',
              hint: 'Pick the katakana for "sa"',
              options: [
                { id: 'a', text: 'サ' },
                { id: 'b', text: 'シ' },
                { id: 'c', text: 'ソ' },
                { id: 'd', text: 'ス' },
              ],
              correctOptionId: 'a',
              vocabIds: [],
            },
          ],
        },
      ],
    },
    {
      id: 'u1',
      title: 'First Words',
      description: 'Greetings and basic courtesy',
      color: '#c1440e',
      lessons: [
        {
          id: 'u1l1',
          title: 'Hello & Goodbye',
          subtitle: 'こんにちは・さようなら',
          exercises: [
            {
              type: 'multiple_choice',
              id: 'u1l1e1',
              prompt: 'Which word means "hello"?',
              options: [
                { id: 'a', text: 'こんにちは' },
                { id: 'b', text: 'さようなら' },
                { id: 'c', text: 'ありがとう' },
                { id: 'd', text: 'いいえ' },
              ],
              correctOptionId: 'a',
              vocabIds: ['konnichiwa'],
            },
            {
              type: 'listening',
              id: 'u1l1e2',
              audioText: 'おはよう',
              accepted: ['ohayou', 'おはよう'],
              hint: 'Said in the morning',
              vocabIds: ['ohayou'],
            },
            {
              type: 'word_bank',
              id: 'u1l1e3',
              prompt: 'Build: "Thank you"',
              bank: ['ありがとう', 'こんにちは', 'はい'],
              correctOrder: ['ありがとう'],
              vocabIds: ['arigatou'],
            },
            {
              type: 'speaking',
              id: 'u1l1e4',
              prompt: 'Say "goodbye" out loud',
              targetText: 'さようなら',
              targetReading: 'sayounara',
              vocabIds: ['sayounara'],
            },
            {
              type: 'matching',
              id: 'u1l1e5',
              pairs: [
                { id: 'p1', left: 'はい', right: 'yes' },
                { id: 'p2', left: 'いいえ', right: 'no' },
                { id: 'p3', left: 'ありがとう', right: 'thank you' },
              ],
              vocabIds: ['hai', 'iie', 'arigatou'],
            },
          ],
        },
        {
          id: 'u1l2',
          title: 'Yes & No',
          subtitle: 'はい・いいえ',
          exercises: [
            {
              type: 'multiple_choice',
              id: 'u1l2e1',
              prompt: 'Which word means "no"?',
              options: [
                { id: 'a', text: 'はい' },
                { id: 'b', text: 'いいえ' },
                { id: 'c', text: 'ねこ' },
                { id: 'd', text: 'みず' },
              ],
              correctOptionId: 'b',
              vocabIds: ['iie'],
            },
            {
              type: 'writing',
              id: 'u1l2e2',
              prompt: 'Write "yes" in hiragana',
              accepted: ['はい', 'hai'],
              hint: 'Two characters',
              vocabIds: ['hai'],
            },
            {
              type: 'listening',
              id: 'u1l2e3',
              audioText: 'いいえ',
              accepted: ['iie', 'いいえ'],
              hint: 'The opposite of はい',
              vocabIds: ['iie'],
            },
            {
              type: 'speaking',
              id: 'u1l2e4',
              prompt: 'Say "yes" out loud',
              targetText: 'はい',
              targetReading: 'hai',
              vocabIds: ['hai'],
            },
          ],
        },
        {
          id: 'u1l3',
          title: 'Introducing Yourself',
          subtitle: 'わたしの なまえ',
          exercises: [
            {
              type: 'word_bank',
              id: 'u1l3e1',
              prompt: 'Build: "I am a student"',
              bank: ['わたし', 'は', 'がくせい', 'です', 'ねこ'],
              correctOrder: ['わたし', 'は', 'がくせい', 'です'],
              vocabIds: ['watashi', 'gakusei', 'desu'],
            },
            {
              type: 'multiple_choice',
              id: 'u1l3e2',
              prompt: '"なまえ" means...',
              options: [
                { id: 'a', text: 'name' },
                { id: 'b', text: 'water' },
                { id: 'c', text: 'cat' },
                { id: 'd', text: 'student' },
              ],
              correctOptionId: 'a',
              vocabIds: ['namae'],
            },
            {
              type: 'listening',
              id: 'u1l3e3',
              audioText: 'わたし は がくせい です',
              accepted: ['watashi wa gakusei desu'],
              hint: 'A full self-introduction sentence',
              vocabIds: ['watashi', 'gakusei', 'desu'],
            },
            {
              type: 'speaking',
              id: 'u1l3e4',
              prompt: 'Introduce yourself as a student',
              targetText: 'わたしは がくせいです',
              targetReading: 'watashi wa gakusei desu',
              vocabIds: ['watashi', 'gakusei', 'desu'],
            },
          ],
        },
      ],
    },
    {
      id: 'u2',
      title: 'Everyday Things',
      description: 'Animals, food, and simple sentences',
      color: '#1d5c63',
      lessons: [
        {
          id: 'u2l1',
          title: 'Animals',
          subtitle: 'ねこ・いぬ',
          exercises: [
            {
              type: 'matching',
              id: 'u2l1e1',
              pairs: [
                { id: 'p1', left: 'ねこ', right: 'cat' },
                { id: 'p2', left: 'いぬ', right: 'dog' },
              ],
              vocabIds: ['neko', 'inu'],
            },
            {
              type: 'multiple_choice',
              id: 'u2l1e2',
              prompt: 'Which word means "dog"?',
              options: [
                { id: 'a', text: 'ねこ' },
                { id: 'b', text: 'いぬ' },
                { id: 'c', text: 'みず' },
                { id: 'd', text: 'ごはん' },
              ],
              correctOptionId: 'b',
              vocabIds: ['inu'],
            },
            {
              type: 'word_bank',
              id: 'u2l1e3',
              prompt: 'Build: "I like cats"',
              bank: ['ねこ', 'が', 'すき', 'です', 'いぬ'],
              correctOrder: ['ねこ', 'が', 'すき', 'です'],
              vocabIds: ['neko', 'suki', 'desu'],
            },
            {
              type: 'speaking',
              id: 'u2l1e4',
              prompt: 'Say "I like dogs"',
              targetText: 'いぬが すきです',
              targetReading: 'inu ga suki desu',
              vocabIds: ['inu', 'suki'],
            },
          ],
        },
        {
          id: 'u2l2',
          title: 'Food & Drink',
          subtitle: 'ごはん・みず',
          exercises: [
            {
              type: 'listening',
              id: 'u2l2e1',
              audioText: 'みず',
              accepted: ['mizu', 'みず'],
              hint: 'You drink this',
              vocabIds: ['mizu'],
            },
            {
              type: 'multiple_choice',
              id: 'u2l2e2',
              prompt: '"ごはん" means...',
              options: [
                { id: 'a', text: 'water' },
                { id: 'b', text: 'rice / meal' },
                { id: 'c', text: 'dog' },
                { id: 'd', text: 'delicious' },
              ],
              correctOptionId: 'b',
              vocabIds: ['gohan'],
            },
            {
              type: 'writing',
              id: 'u2l2e3',
              prompt: 'Write "delicious" in hiragana',
              accepted: ['おいしい', 'oishii'],
              hint: 'Five characters',
              vocabIds: ['oishii'],
            },
            {
              type: 'word_bank',
              id: 'u2l2e4',
              prompt: 'Build: "The rice is delicious"',
              bank: ['ごはん', 'が', 'おいしい', 'です', 'みず'],
              correctOrder: ['ごはん', 'が', 'おいしい', 'です'],
              vocabIds: ['gohan', 'oishii', 'desu'],
            },
            {
              type: 'speaking',
              id: 'u2l2e5',
              prompt: 'Say "the rice is delicious"',
              targetText: 'ごはんが おいしいです',
              targetReading: 'gohan ga oishii desu',
              vocabIds: ['gohan', 'oishii'],
            },
          ],
        },
        {
          id: 'u2l3',
          title: 'Counting',
          subtitle: 'いち・に・さん',
          exercises: [
            {
              type: 'matching',
              id: 'u2l3e1',
              pairs: [
                { id: 'p1', left: 'いち', right: 'one' },
                { id: 'p2', left: 'に', right: 'two' },
                { id: 'p3', left: 'さん', right: 'three' },
              ],
              vocabIds: ['ichi', 'ni', 'san'],
            },
            {
              type: 'listening',
              id: 'u2l3e2',
              audioText: 'いち、に、さん',
              accepted: ['ichi ni san'],
              hint: 'Counting to three',
              vocabIds: ['ichi', 'ni', 'san'],
            },
            {
              type: 'multiple_choice',
              id: 'u2l3e3',
              prompt: 'Which is "two"?',
              options: [
                { id: 'a', text: 'いち' },
                { id: 'b', text: 'に' },
                { id: 'c', text: 'さん' },
                { id: 'd', text: 'ねこ' },
              ],
              correctOptionId: 'b',
              vocabIds: ['ni'],
            },
            {
              type: 'speaking',
              id: 'u2l3e4',
              prompt: 'Count from one to three out loud',
              targetText: 'いち、に、さん',
              targetReading: 'ichi, ni, san',
              vocabIds: ['ichi', 'ni', 'san'],
            },
          ],
        },
      ],
    },
    {
      id: 'u3',
      title: 'Small Talk',
      description: 'Putting sentences together',
      color: '#7a4988',
      lessons: [
        {
          id: 'u3l1',
          title: 'About You',
          subtitle: 'あなたは？',
          exercises: [
            {
              type: 'word_bank',
              id: 'u3l1e1',
              prompt: 'Build: "You are a student"',
              bank: ['あなた', 'は', 'がくせい', 'です', 'わたし'],
              correctOrder: ['あなた', 'は', 'がくせい', 'です'],
              vocabIds: ['anata', 'gakusei', 'desu'],
            },
            {
              type: 'multiple_choice',
              id: 'u3l1e2',
              prompt: '"あなた" means...',
              options: [
                { id: 'a', text: 'I / me' },
                { id: 'b', text: 'you' },
                { id: 'c', text: 'name' },
                { id: 'd', text: 'cat' },
              ],
              correctOptionId: 'b',
              vocabIds: ['anata'],
            },
            {
              type: 'listening',
              id: 'u3l1e3',
              audioText: 'あなたの おなまえは？',
              accepted: ['anata no onamae wa'],
              hint: 'A polite question',
              vocabIds: ['anata', 'namae'],
            },
            {
              type: 'speaking',
              id: 'u3l1e4',
              prompt: 'Ask "what is your name?"',
              targetText: 'あなたの おなまえは？',
              targetReading: 'anata no onamae wa?',
              vocabIds: ['anata', 'namae'],
            },
          ],
        },
        {
          id: 'u3l2',
          title: 'Likes & Dislikes',
          subtitle: 'すき・きらい',
          exercises: [
            {
              type: 'word_bank',
              id: 'u3l2e1',
              prompt: 'Build: "I like water"',
              bank: ['みず', 'が', 'すき', 'です', 'ねこ'],
              correctOrder: ['みず', 'が', 'すき', 'です'],
              vocabIds: ['mizu', 'suki', 'desu'],
            },
            {
              type: 'matching',
              id: 'u3l2e2',
              pairs: [
                { id: 'p1', left: 'ねこがすきです', right: 'I like cats' },
                { id: 'p2', left: 'みずがすきです', right: 'I like water' },
                { id: 'p3', left: 'いぬがすきです', right: 'I like dogs' },
              ],
              vocabIds: ['neko', 'mizu', 'inu', 'suki'],
            },
            {
              type: 'writing',
              id: 'u3l2e3',
              prompt: 'Write "to like" in hiragana',
              accepted: ['すき', 'suki'],
              hint: 'Two characters',
              vocabIds: ['suki'],
            },
            {
              type: 'speaking',
              id: 'u3l2e4',
              prompt: 'Say "I like water"',
              targetText: 'みずが すきです',
              targetReading: 'mizu ga suki desu',
              vocabIds: ['mizu', 'suki'],
            },
          ],
        },
        {
          id: 'u3l3',
          title: 'Full Conversation',
          subtitle: 'かいわ',
          exercises: [
            {
              type: 'listening',
              id: 'u3l3e1',
              audioText: 'こんにちは、わたしは がくせいです',
              accepted: ['konnichiwa watashi wa gakusei desu'],
              hint: 'Greeting + introduction',
              vocabIds: ['konnichiwa', 'watashi', 'gakusei'],
            },
            {
              type: 'word_bank',
              id: 'u3l3e2',
              prompt: 'Build: "Thank you, goodbye"',
              bank: ['ありがとう', 'さようなら', 'はい'],
              correctOrder: ['ありがとう', 'さようなら'],
              vocabIds: ['arigatou', 'sayounara'],
            },
            {
              type: 'speaking',
              id: 'u3l3e3',
              prompt: 'Say the full greeting and introduction',
              targetText: 'こんにちは、わたしは がくせいです',
              targetReading: 'konnichiwa, watashi wa gakusei desu',
              vocabIds: ['konnichiwa', 'watashi', 'gakusei'],
            },
            {
              type: 'multiple_choice',
              id: 'u3l3e4',
              prompt: 'How do you politely say goodbye?',
              options: [
                { id: 'a', text: 'さようなら' },
                { id: 'b', text: 'おはよう' },
                { id: 'c', text: 'すき' },
                { id: 'd', text: 'みず' },
              ],
              correctOptionId: 'a',
              vocabIds: ['sayounara'],
            },
            {
              type: 'writing',
              id: 'u3l3e5',
              prompt: 'Write "thank you" in hiragana',
              accepted: ['ありがとう', 'arigatou'],
              hint: 'Five characters',
              vocabIds: ['arigatou'],
            },
          ],
        },
      ],
    },
    {
      id: 'u4',
      title: 'First Sentences',
      description: 'Chain words you know into real sentences',
      color: '#1d5c63',
      lessons: [
        {
          id: 'u4l1',
          title: 'I See a Cat',
          subtitle: 'みる + known words',
          exercises: [
            {
              // Cumulative sentence: "t see" is the new word; everything else is known
              // words from earlier lessons. The learner weaves the new verb in.
              type: 'chained_sentence',
              id: 'u4l1e1',
              prompt: 'Build: "I see a cat"',
              knownBank: ['わたし', 'は', 'ねこ', 'を'],
              newWord: 'みる',
              correctOrder: ['わたし', 'は', 'ねこ', 'を', 'みる'],
              gloss: 'Watashi wa neko o miru. — I see a cat.',
              mnemonic: 'You MEER (みる) the cat 🐱 — "I see" is みる.',
              vocabIds: ['v13', 'watashi', 'neko'],
            },
            {
              type: 'chained_sentence',
              id: 'u4l1e2',
              prompt: 'Build: "I am a person"',
              knownBank: ['わたし', 'は', 'です'],
              newWord: 'ひと',
              correctOrder: ['わたし', 'は', 'ひと', 'です'],
              gloss: 'Watashi wa hito desu. — I am a person.',
              mnemonic: 'A person walks past the sun をとこ... picture a HITp-ONE (ひと) ☝️',
              vocabIds: ['v18', 'watashi', 'desu'],
            },
            {
              // Drawing the kanji for "person".
              type: 'kanji_draw',
              id: 'u4l1e3',
              character: '人',
              reading: 'ひと',
              meaning: 'person',
              strokeCount: 2,
              vocabIds: ['v18'],
            },
            {
              type: 'multiple_choice',
              id: 'u4l1e4',
              prompt: 'Which word means "person"?',
              options: [
                { id: 'a', text: 'みる' },
                { id: 'b', text: '人' },
                { id: 'c', text: 'ねこ' },
                { id: 'd', text: 'わたし' },
              ],
              correctOptionId: 'b',
              vocabIds: ['v18'],
            },
          ],
        },
        {
          id: 'u4l2',
          title: 'Getting Around',
          subtitle: 'いく・どこ',
          exercises: [
            {
              type: 'chained_sentence',
              id: 'u4l2e1',
              prompt: 'Build: "Where is the station?"',
              knownBank: ['どこ', 'です', 'か'],
              newWord: 'えき',
              correctOrder: ['えき', 'は', 'どこ', 'です', 'か'],
              gloss: 'Eki wa doko desu ka. — Where is the station?',
              mnemonic: 'EKIda! Remember えき with the train station sign 🚉',
              vocabIds: ['v3', 'v5'],
            },
            {
              type: 'kanji_draw',
              id: 'u4l2e2',
              character: '口',
              reading: 'くち',
              meaning: 'mouth / opening',
              strokeCount: 3,
              vocabIds: ['v3'],
            },
          ],
        },
      ],
    },
  ]),
}

export const courses: Record<string, Course> = {
  japanese: japaneseCourse,
}

export const comingSoonSubjects = [
  { title: 'Spanish', flag: '🇪🇸', tagline: 'Coming soon' },
  { title: 'French', flag: '🇫🇷', tagline: 'Coming soon' },
  { title: 'Mental Math', flag: '➗', tagline: 'Coming soon' },
  { title: 'Music Theory', flag: '🎵', tagline: 'Coming soon' },
]
