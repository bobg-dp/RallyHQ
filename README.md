# RallyHQ Monorepo

Monorepo setup using Turborepo. Apps and packages:

- apps/web — frontend (existing project moved from `app/web`)
- apps/api — placeholder backend app
- packages/ui — shared UI package
- supabase/ — Supabase project (DB and functions), already initialized

Quick start

1. pnpm install
2. pnpm -w run dev    # runs `vite` for `apps/web` and placeholder `apps/api` via Turborepo
3. Use Supabase locally: `supabase start` in a separate terminal or leave the existing service running

Optional

- We migrated this repo to pnpm workspaces. If you prefer npm instead, restore `package-lock.json` and remove `pnpm-lock.yaml`.

CI

- This repo includes a GitHub Actions workflow at `.github/workflows/ci.yml` that runs on push and pull requests to `main` and uses pnpm. It caches the pnpm store and the Turborepo cache to speed up CI.
