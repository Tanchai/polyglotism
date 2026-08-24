import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { userStats } from '../../db/schema.js'
import { requireAuthMiddleware } from '../middleware/identity.js'

const DAY_MS = 24 * 60 * 60 * 1000
const todayStr = () => new Date().toISOString().slice(0, 10)

async function ensureStats(userId: string) {
  const existing = await db.select().from(userStats).where(eq(userStats.userId, userId))
  if (existing[0]) return existing[0]
  const [created] = await db.insert(userStats).values({ userId }).returning()
  return created
}

export const getMyStats = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    return ensureStats(context.user.id)
  })

function nextStreak(lastActiveDate: string | null): number {
  if (!lastActiveDate) return 1
  const last = new Date(lastActiveDate).getTime()
  const today = new Date(todayStr()).getTime()
  const diffDays = Math.round((today - last) / DAY_MS)
  if (diffDays === 0) return -1 // unchanged, handled by caller
  if (diffDays === 1) return -2 // increment, handled by caller
  return 1 // streak broken, restart
}

export const recordActivity = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator((data: { xpGained: number; heartsLost: number }) => data)
  .handler(async ({ context, data }) => {
    const stats = await ensureStats(context.user.id)
    const marker = nextStreak(stats.lastActiveDate)
    let streak = stats.streak
    if (marker === -1) streak = stats.streak
    else if (marker === -2) streak = stats.streak + 1
    else streak = 1

    const [updated] = await db
      .update(userStats)
      .set({
        xp: stats.xp + data.xpGained,
        hearts: Math.max(0, Math.min(5, stats.hearts - data.heartsLost)),
        streak,
        lastActiveDate: todayStr(),
        updatedAt: new Date(),
      })
      .where(eq(userStats.userId, context.user.id))
      .returning()
    return updated
  })

export const HEART_REFILL_GEM_COST = 10

export const refillHearts = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const stats = await ensureStats(context.user.id)
    if (stats.gems < HEART_REFILL_GEM_COST) {
      return { ok: false as const, reason: 'not_enough_gems', stats }
    }
    if (stats.hearts >= 5) {
      return { ok: false as const, reason: 'already_full', stats }
    }
    const [updated] = await db
      .update(userStats)
      .set({
        hearts: 5,
        gems: stats.gems - HEART_REFILL_GEM_COST,
        updatedAt: new Date(),
      })
      .where(eq(userStats.userId, context.user.id))
      .returning()
    return { ok: true as const, reason: 'refilled', stats: updated }
  })
