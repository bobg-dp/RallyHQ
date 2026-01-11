# RallyHQ Monorepo

Monorepo setup using Turborepo. Apps and packages:

- apps/web — frontend (Vite + React + TypeScript)
- apps/api — backend proxy API (Node.js + Express)
- apps/functions — Supabase Edge Functions (Deno + TypeScript)
- packages/ui — shared UI package
- supabase/ — Supabase project configuration (DB migrations, config.toml)

Quick start

1. pnpm install
2. pnpm run supabase:start    # Start Supabase services (DB, Studio, Auth, etc.)
3. pnpm run dev:functions     # Start web app + Edge Functions together via Turborepo
   
   Or run everything: `pnpm run dev`

Optional

- We migrated this repo to pnpm workspaces. If you prefer npm instead, restore `package-lock.json` and remove `pnpm-lock.yaml`.

CI

- This repo includes a GitHub Actions workflow at `.github/workflows/ci.yml` that runs on push and pull requests to `main` and uses pnpm. It caches the pnpm store and the Turborepo cache to speed up CI.
