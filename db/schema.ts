import { pgTable, serial, text, integer, timestamp, json, boolean, real } from 'drizzle-orm/pg-core'

export const teams = pgTable('teams', {
  id: serial().primaryKey(),
  userId: text('user_id').notNull().unique(),
  userName: text('user_name').notNull(),
  teamName: text('team_name').notNull(),
  mayorId: text('mayor_id').notNull(),
  councilors: json('councilors').$type<string[]>().notNull().default([]),
  mayorPercentages: json('mayor_percentages').$type<Record<string, number>>().notNull().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const electionResults = pgTable('election_results', {
  id: serial().primaryKey(),
  candidateId: text('candidate_id').notNull().unique(),
  candidateType: text('candidate_type').notNull(), // 'mayor' | 'councilor'
  elected: boolean('elected').default(false),
  electedBallot: boolean('elected_ballot').default(false),
  percentage: real('percentage'),
  listAboveThreshold: boolean('list_above_threshold').default(false),
  listId: text('list_id'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const liveUpdates = pgTable('live_updates', {
  id: serial().primaryKey(),
  mayorId: text('mayor_id').notNull().unique(),
  percentage: real('percentage'),
  sezioniContate: integer('sezioni_contate').default(0),
  sezioniTotali: integer('sezioni_totali').default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
