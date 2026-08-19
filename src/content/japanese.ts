// Static course content for the Japanese track. Content lives in code (like a
// curriculum file) — only mutable per-user state (progress, streak, SRS) is in the database.

export type ExerciseType =
  | 'multiple_choice'
  | 'word_bank'
  | 'listening'
  | 'speaking'
  | 'writing'
  | 'matching'

export interface VocabItem {
  id: string
  jp: string
  reading: string
  en: string
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

export type Exercise =
  | MultipleChoiceExercise
  | WordBankExercise
  | ListeningExercise
  | SpeakingExercise
  | WritingExercise
  | MatchingExercise

export interface Lesson {
  id: string
  title: string
  subtitle: string
  exercises: Exercise[]
}

export interface Unit {
  id: string
  title: string
  description: string
  color: string
  lessons: Lesson[]
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
  vocab,
  units: [
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
  ],
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
