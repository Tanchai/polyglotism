# AGENTS.md

Guidance for agents working in this repo.

## What this is

Kaiwa is a Duolingo-style course app. The first (and currently only) course is Japanese.
It's built to grow into a multi-subject platform, so keep new subjects as data, not new
app logic.

## Architecture rules

- **Course content is static TypeScript, not database rows.** Units, lessons, exercises,
  and vocab for a subject live in `src/content/<subject>.ts` and are registered in the
  `courses` record. Only *per-user mutable state* — stats, lesson progress, spaced-repetition
  review items — belongs in Netlify Database (`db/schema.ts`). Do not add a CMS or move
  course content into the database; do not add new database tables for things that can be
  derived from content files plus existing tables.
- **Database migrations are generated, never hand-written.** Change `db/schema.ts`, then
  run `npx drizzle-kit generate --name <description>` to emit a migration into
  `netlify/database/migrations/`. Never edit files in that directory by hand and never run
  migrations yourself — Netlify applies them on deploy.
- **Auth is Netlify Identity**, wired through `src/lib/identity-context.tsx` (client) and
  `src/lib/auth.ts` / `src/middleware/identity.ts` (server). It does not work on
  `localhost` — don't treat a local sign-in failure as a bug.
- **Exercises** are typed as a discriminated union (`Exercise` in
  `src/content/japanese.ts`) and rendered by `ExerciseView.tsx`'s switch statement. Adding
  a new exercise type means: add the interface, add it to the `Exercise` union, add a
  branch in `ExerciseView.tsx`.
- **Spaced repetition** uses a simplified SM-2 (quality 0/1/2, not the full 0–5 scale) in
  `src/server/review.functions.ts`. Keep it that simple unless there's a concrete reason to
  add more nuance — it's tuned to be easy to reason about.

## Conventions

- Path alias `@/*` → `./src/*`.
- TypeScript strict mode with `noUnusedLocals`/`noUnusedParameters` — don't leave unused
  imports or params.
- The color palette and fonts (Kosugi Maru, Zen Kaku Gothic New; vermillion/teal/gold/ink
  on a warm paper background, defined as CSS variables in `src/styles.css`) are
  intentional — don't replace them with default Tailwind grays/blues or generic sans fonts.

## Do not

- Do not hand-write or apply SQL migrations.
- Do not move course content into the database.
- Do not expect Netlify Identity to work in a local dev server.
