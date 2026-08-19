# Kaiwa (会話) — a Duolingo-style Japanese course

A gamified language-learning app built with TanStack Start, deployed on Netlify. Learners
sign in with Netlify Identity, work through a unit/lesson path of exercises, and review
vocabulary on a spaced-repetition schedule. Progress persists per-user in Netlify Database.

The first course is Japanese. The content model (`src/content/*.ts`) is deliberately
separate from the app shell so more subjects can be added later (Spanish, French, mental
math, music theory, etc.) without touching routes, exercise components, or the database
schema — see `comingSoonSubjects` in `src/content/japanese.ts` for the placeholder list
already shown on the landing page.

## Features

- **Learn path** — units of lessons laid out like a game map; lessons unlock in sequence.
- **Six exercise types** per lesson: multiple choice, word-bank sentence building,
  listening (text-to-speech), speaking (speech recognition with a self-report fallback),
  writing, and matching pairs — chosen to cover retention, sentence formation, and
  speaking/reading/writing comfort.
- **Hearts, XP, gems, streak** — a lightweight game loop tracked per user.
- **Spaced repetition review** — vocabulary encountered in lessons is scheduled with a
  simplified SM-2 algorithm and resurfaces on `/review` when due.
- **Profile page** — stats plus charts (course completion, accuracy by unit).
- **Accounts** — Netlify Identity login/signup; progress syncs across devices.

## Tech stack

- [TanStack Start](https://tanstack.com/start) (file-based routing, server functions)
- [Netlify Identity](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/)
  for auth
- [Netlify Database](https://docs.netlify.com/build/data-and-storage/netlify-db/) with
  [Drizzle ORM](https://orm.drizzle.team/) for persisted user state (stats, lesson
  progress, review scheduling)
- Tailwind CSS v4
- Chart.js / react-chartjs-2 for the profile charts
- Web Speech API (`SpeechSynthesisUtterance`, `SpeechRecognition`) for listening and
  speaking exercises

## Project structure

- `src/content/japanese.ts` — the Japanese course: units, lessons, exercises, and vocab.
  Add a new file here (and register it in `courses`) to add another subject.
- `src/components/ExerciseView.tsx` — renders each exercise type and reports right/wrong.
- `src/routes/_app.*` — the authenticated app shell, learn path, lesson runner, review
  session, and profile page.
- `db/schema.ts` — Drizzle schema for `userStats`, `lessonProgress`, `reviewItems`.
- `src/server/*.functions.ts` — server functions reading/writing that schema.

## Running locally

```bash
npm install
npm run dev
```

Netlify Identity does not work on `localhost` — sign-in only functions once deployed to
Netlify, since it depends on the site's Identity endpoint. Netlify Database is provisioned
automatically for the deployed site; migrations live in `netlify/database/migrations` and
are applied on deploy — never hand-edit or apply them locally.
