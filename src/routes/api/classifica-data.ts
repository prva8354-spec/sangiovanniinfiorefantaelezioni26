import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../db/index.js'
import { teams } from '../../../db/schema.js'

export const Route = createFileRoute('/api/classifica-data')({
  server: {
    handlers: {
      GET: async () => {
        const allTeams = await db
          .select({
            id: teams.id,
            teamName: teams.teamName,
            userName: teams.userName,
            mayorId: teams.mayorId,
            councilors: teams.councilors,
            mayorPercentages: teams.mayorPercentages,
            createdAt: teams.createdAt,
          })
          .from(teams)
          .orderBy(teams.createdAt)
        return Response.json(allTeams)
      },
    },
  },
})
