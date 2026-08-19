import { createMiddleware } from '@tanstack/react-start'
import { getUser } from '@netlify/identity'

export const requireAuthMiddleware = createMiddleware().server(async ({ next }) => {
  const user = await getUser()
  if (!user) throw new Error('Authentication required')
  return next({ context: { user } })
})
