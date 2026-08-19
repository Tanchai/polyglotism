import { createServerFn } from '@tanstack/react-start'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { lessonProgress } from '../../db/schema.js'
import { requireAuthMiddleware } from '../middleware/identity.js'

export const getCourseProgress = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator((data: { courseSlug: string }) => data)
  .handler(async ({ context, data }) => {
    return db
      .select()
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, context.user.id), eq(lessonProgress.courseSlug, data.courseSlug)))
  })

export const completeLesson = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator((data: { courseSlug: string; lessonId: string; accuracy: number }) => data)
  .handler(async ({ context, data }) => {
    const existing = await db
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, context.user.id),
          eq(lessonProgress.courseSlug, data.courseSlug),
          eq(lessonProgress.lessonId, data.lessonId),
        ),
      )

    if (existing[0]) {
      const [updated] = await db
        .update(lessonProgress)
        .set({
          status: 'completed',
          bestAccuracy: Math.max(existing[0].bestAccuracy, data.accuracy),
          attempts: existing[0].attempts + 1,
          completedAt: new Date(),
        })
        .where(eq(lessonProgress.id, existing[0].id))
        .returning()
      return updated
    }

    const [created] = await db
      .insert(lessonProgress)
      .values({
        userId: context.user.id,
        courseSlug: data.courseSlug,
        lessonId: data.lessonId,
        status: 'completed',
        bestAccuracy: data.accuracy,
        attempts: 1,
        completedAt: new Date(),
      })
      .returning()
    return created
  })
