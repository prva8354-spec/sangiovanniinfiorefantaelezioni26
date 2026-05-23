import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../db/index.js'
import { teams, electionResults, liveUpdates } from '../../../db/schema.js'
import { eq } from 'drizzle-orm'

const ADMIN_PASSWORD = 'Fanta26.invenzione'

async function checkAdmin(request: Request): Promise<boolean> {
  const auth = request.headers.get('x-admin-password')
  return auth === ADMIN_PASSWORD
}

export const Route = createFileRoute('/api/admin')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!await checkAdmin(request)) {
          return Response.json({ error: 'Non autorizzato' }, { status: 401 })
        }

        const body = await request.json() as {
          action: string
          [key: string]: unknown
        }

        if (body.action === 'get_all') {
          const allTeams = await db.select().from(teams).orderBy(teams.createdAt)
          const results = await db.select().from(electionResults)
          const live = await db.select().from(liveUpdates)
          return Response.json({ teams: allTeams, results, live })
        }

        if (body.action === 'update_live') {
          const { mayorId, percentage, sezioniContate, sezioniTotali } = body as {
            action: string
            mayorId: string
            percentage: number
            sezioniContate: number
            sezioniTotali: number
          }
          const existing = await db.select().from(liveUpdates).where(eq(liveUpdates.mayorId, mayorId))
          if (existing.length > 0) {
            await db.update(liveUpdates)
              .set({ percentage, sezioniContate, sezioniTotali, updatedAt: new Date() })
              .where(eq(liveUpdates.mayorId, mayorId))
          } else {
            await db.insert(liveUpdates).values({ mayorId, percentage, sezioniContate, sezioniTotali })
          }
          return Response.json({ ok: true })
        }

        if (body.action === 'update_result') {
          const { candidateId, candidateType, elected, electedBallot, percentage, listAboveThreshold, listId } = body as {
            action: string
            candidateId: string
            candidateType: string
            elected: boolean
            electedBallot: boolean
            percentage: number
            listAboveThreshold: boolean
            listId: string
          }
          const existing = await db.select().from(electionResults).where(eq(electionResults.candidateId, candidateId))
          if (existing.length > 0) {
            await db.update(electionResults)
              .set({ elected, electedBallot, percentage, listAboveThreshold, listId, updatedAt: new Date() })
              .where(eq(electionResults.candidateId, candidateId))
          } else {
            await db.insert(electionResults)
              .values({ candidateId, candidateType, elected, electedBallot, percentage, listAboveThreshold, listId })
          }
          return Response.json({ ok: true })
        }

        if (body.action === 'delete_team') {
          const { teamId } = body as { action: string; teamId: number }
          await db.delete(teams).where(eq(teams.id, teamId))
          return Response.json({ ok: true })
        }

        return Response.json({ error: 'Azione sconosciuta' }, { status: 400 })
      },
    },
  },
})
