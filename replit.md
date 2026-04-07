# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### NFT Gift Casino (`artifacts/nft-gift-casino`)
- React + Vite web app
- Telegram Mini App inspired casino with slot machine mechanics
- NFT gift collection, leaderboard, player stats
- Preview path: `/`

### API Server (`artifacts/api-server`)
- Express 5 backend
- Casino game routes: `/api/game/*`, `/api/leaderboard`
- Preview path: `/api`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema

- `players` — user accounts with balance, spin stats
- `gifts` — NFT gifts won by players (rarity, emoji, value)
- `spins` — spin history with bet amounts and outcomes

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
