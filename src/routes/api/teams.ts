import { createFileRoute } from '@tanstack/react-router'
import { getUser } from '@netlify/identity'
import { db } from '../../../db/index.js'
import { teams } from '../../../db/schema.js'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/teams')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getUser()
        if (!user) return Response.json({ error: 'Non autorizzato' }, { status: 401 })

        const userTeam = await db.select().from(teams).where(eq(teams.userId, user.id))
        return Response.json(userTeam[0] ?? null)
      },

      POST: async ({ request }) => {
        const user = await getUser()
        if (!user) return Response.json({ error: 'Non autorizzato' }, { status: 401 })

        const body = await request.json() as {
          teamName: string
          mayorId: string
          councilors: string[]
          mayorPercentages: Record<string, number>
        }

        const { teamName, mayorId, councilors, mayorPercentages } = body

        if (!teamName?.trim()) return Response.json({ error: 'Nome squadra mancante' }, { status: 400 })
        if (!mayorId) return Response.json({ error: 'Sindaco mancante' }, { status: 400 })
        if (!councilors || councilors.length < 5 || councilors.length > 10) {
          return Response.json({ error: 'Seleziona da 5 a 10 consiglieri' }, { status: 400 })
        }

        const existing = await db.select().from(teams).where(eq(teams.userId, user.id))
        if (existing.length > 0) {
          const [updated] = await db
            .update(teams)
            .set({ teamName, mayorId, councilors, mayorPercentages, createdAt: existing[0].createdAt })
            .where(eq(teams.userId, user.id))
            .returning()
          return Response.json(updated)
        }

        const userName = user.name || user.email
        const [created] = await db
          .insert(teams)
          .values({ userId: user.id, userName, teamName, mayorId, councilors, mayorPercentages })
          .returning()
        return Response.json(created, { status: 201 })
      },
    },
  },
})
