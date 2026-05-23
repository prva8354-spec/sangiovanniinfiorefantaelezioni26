# FantaElezioni San Giovanni in Fiore 2026

A fantasy politics web app for the 2026 municipal elections in San Giovanni in Fiore (CS), Italy.

## What it is

Players register, create a fantasy team by selecting one mayoral candidate and 5-10 councillors from any coalition, and make percentage predictions for each mayoral candidate. Points are awarded based on actual election results.

## Key Technologies

- **TanStack Start** (React SSR framework)
- **Tailwind CSS v4** for styling
- **Netlify Identity** (`@netlify/identity`) for authentication
- **Netlify Database** (Postgres via `@netlify/database` + Drizzle ORM) for data persistence

## Running locally

```bash
npm install
netlify dev
```

> **Note:** Netlify Identity requires a real Netlify deployment — it does not work on localhost. For local testing, deploy a branch preview.

## Environment

No environment variables needed — database and identity are provisioned automatically by Netlify.
