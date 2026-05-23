import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../db/index.js'
import { electionResults, liveUpdates } from '../../../db/schema.js'

export const Route = createFileRoute('/api/results')({
  server: {
    handlers: {
      GET: async () => {
        const results = await db.select().from(electionResults)
        const live = await db.select().from(liveUpdates)
        return Response.json({ results, live })
      },
    },
  },
})
