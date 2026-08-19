import { createServerFn } from '@tanstack/react-start'
import { eq, and, lte } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { reviewItems } from '../../db/schema.js'
import { requireAuthMiddleware } from '../middleware/identity.js'

// Simplified SM-2 spaced-repetition scheduling.
function schedule(prev: { easeFactor: number; intervalDays: number; repetitions: number }, quality: 0 | 1 | 2) {
  // quality: 0 = forgot, 1 = hard but correct, 2 = easy
  let { easeFactor, intervalDays, repetitions } = prev
  if (quality === 0) {
    repetitions = 0
    intervalDays = 1
    easeFactor = Math.max(1.3, easeFactor - 0.2)
  } else {
    repetitions += 1
    easeFactor = Math.max(1.3, easeFactor + (quality === 2 ? 0.1 : -0.05))
    if (repetitions === 1) intervalDays = 1
    else if (repetitions === 2) intervalDays = 3
    else intervalDays = Math.round(intervalDays * easeFactor)
  }
  return { easeFactor, intervalDays, repetitions }
}

export const touchReviewItems = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator((data: { courseSlug: string; itemIds: string[]; quality: 0 | 1 | 2 }) => data)
  .handler(async ({ context, data }) => {
    for (const itemId of data.itemIds) {
      const existing = await db
        .select()
        .from(reviewItems)
        .where(
          and(
            eq(reviewItems.userId, context.user.id),
            eq(reviewItems.courseSlug, data.courseSlug),
            eq(reviewItems.itemId, itemId),
          ),
        )

      const base = existing[0] ?? { easeFactor: 2.3, intervalDays: 1, repetitions: 0 }
      const next = schedule(base, data.quality)
      const nextReviewAt = new Date(Date.now() + next.intervalDays * 24 * 60 * 60 * 1000)

      if (existing[0]) {
        await db
          .update(reviewItems)
          .set({ ...next, nextReviewAt, lastResult: String(data.quality), updatedAt: new Date() })
          .where(eq(reviewItems.id, existing[0].id))
      } else {
        await db.insert(reviewItems).values({
          userId: context.user.id,
          courseSlug: data.courseSlug,
          itemId,
          ...next,
          nextReviewAt,
          lastResult: String(data.quality),
        })
      }
    }
    return { ok: true }
  })

export const getDueReviewItems = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator((data: { courseSlug: string }) => data)
  .handler(async ({ context, data }) => {
    return db
      .select()
      .from(reviewItems)
      .where(
        and(
          eq(reviewItems.userId, context.user.id),
          eq(reviewItems.courseSlug, data.courseSlug),
          lte(reviewItems.nextReviewAt, new Date()),
        ),
      )
  })
