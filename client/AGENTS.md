# AGENTS.md

## Purpose

Frontend contributor guide . It reflects the current client structure and preferred conventions.

## Quick Start

- Install deps: `pnpm install`
- Dev server: `pnpm dev` (do not start it here; assume it is already running)
- Quality: `pnpm lint` and `pnpm typecheck`
- Format: `pnpm format`

## Core Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript (strict)
- Tailwind CSS 4
- shadcn/ui + Radix
- useSwr for server state
- Zustand for client state

## Repository Layout (Client)

- `src/app/` app routes, layouts, and metadata
- `src/components/` UI and feature components
- `src/constants/` client constants
- `src/env.ts` typed env access
- `src/hooks/` custom hooks
- `src/lib/` shared utilities and auth helpers
- `src/providers/` context providers
- `src/stores/` Zustand stores
- `src/types/` domain types
- `public/` static assets

## Commands

### Development

- Dev: `pnpm dev`
- Build: `pnpm build`
- Start: `pnpm start`

### Quality

- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Format: `pnpm format`

## Code Style

- Double quotes
- Semicolons required
- 2-space indentation
- Print width 100
- Trailing commas always
- Arrow parens always
- Prefix unused vars with `_`

### Import Order

1. React
2. Next.js
3. Third-party
4. `@/*` aliases
5. Relative imports

### Path Aliases

- `@/*` -> `src/*`

## App Router Conventions

- Use `page.tsx` for routes and `layout.tsx` for shared layouts
- Prefer server components by default
- Add `"use client"` only when needed
- API routes live in `src/app/api/`
- Use `loading.tsx` and `global-error.tsx` for UX consistency

## Component Guidelines

- Functional components with hooks
- Prefer composition
- Use `src/components/ui/` for shadcn/ui primitives
- Keep feature components in `src/components/<feature>/`
- Use PascalCase component names

## State and Data

- Server state: swr (`src/lib/api/` if present)
- Client state: Zustand (`src/stores/`)
- Form state: tanstack Form + Zod
- URL state: `nuqs`

## Styling

- Tailwind utilities first
- Global styles in `src/globals.css`
- Follow existing design tokens and shadcn/ui patterns

## Environment

- Check `sample.env`
- Use `src/env.ts` for typed access
- Never commit `.env`

## Testing

- Run `pnpm lint` and `pnpm typecheck` before committing
- Keep tests feature-aligned (if present)

## Git Workflow

- Run `pnpm lint` and `pnpm typecheck` before committing
- Respect pre-commit hooks
- Keep commits focused and descriptive

## Common Changes

### Add a Component

1. Create a file in `src/components/<feature>/`
2. Export the component
3. Import via `@/components/...`

### Add a Route

1. Create `src/app/<route>/page.tsx`
2. Add `layout.tsx` if needed
3. Prefer server components by default
