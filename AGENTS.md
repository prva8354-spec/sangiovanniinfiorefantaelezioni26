# AGENTS.md — FantaElezioni SGF 2026

## Project overview

Fantasy election game for the San Giovanni in Fiore 2026 municipal elections. Users register, create a team (1 mayor + 5-10 councillors + percentage predictions), and earn points based on real results.

## Key directories

```
src/
  data/candidates.ts    — All candidates: mayors[], lists[], allCouncilors[], helpers
  routes/               — TanStack Start file-based routing
    index.tsx           — Home page
    login.tsx           — Login/signup (Netlify Identity)
    squadra.tsx         — Team creation/view (requires auth)
    classifica.tsx      — Public leaderboard with live score calculation
    live.tsx            — Real-time election results (polls /api/results every 30s)
    regolamento.tsx     — Game rules page
    admin.tsx           — Admin panel (password: Fanta26.invenzione, NOT Identity)
    api/
      teams.ts          — GET/POST user team (requires Identity JWT)
      results.ts        — GET election results + live data (public)
      admin.ts          — Admin CRUD (password via x-admin-password header)
      classifica-data.ts — Public team list for leaderboard
  lib/
    auth.ts             — getServerUser() server function
    identity-context.tsx — React context for client-side auth state
  middleware/
    identity.ts         — TanStack Start middleware for auth
  components/
    NavBar.tsx          — Sticky nav with auth state
    CallbackHandler.tsx — Handles Identity OAuth/confirmation URL hashes
db/
  schema.ts             — Drizzle schema (teams, election_results, live_updates)
  index.ts              — Drizzle client (netlify-db adapter)
netlify/
  database/migrations/  — Auto-generated SQL migrations (via drizzle-kit generate)
```

## Scoring logic

Score calculation lives in two places (keep in sync):
- `src/routes/classifica.tsx` — client-side leaderboard
- `src/routes/admin.tsx` — admin overview

Rules: mayor elected 1st round +75, ballot +35, 2nd place +25, <10% -10; councillor elected +30, list above threshold +10; percentage bonus max +25 minus 1 per % point diff, min 0.

## Candidate data

All candidates are in `src/data/candidates.ts`. IDs are short slugs (e.g. `ambrogio`, `as-fragale-f`). The `lists` array groups councillors by list, each list has a `mayorId` linking it to a mayoral candidate.

## Admin authentication

The admin panel uses a simple password (`Fanta26.invenzione`) sent as `x-admin-password` HTTP header — it does NOT use Netlify Identity. This is intentional to keep admin access independent of the Identity system.

## Conventions

- All API routes are under `src/routes/api/` using TanStack Start's `server.handlers`
- DB imports use `.js` extensions for ESM compatibility
- Tailwind classes use `slate-*` for backgrounds, `amber-*` for accents
- Identity only works on deployed Netlify — not localhost
