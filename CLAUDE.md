# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Korean securities intelligence monitoring platform for KOSCOM's finance sales department. Tracks news, personnel changes, and contract data from securities companies (PowerBase customers).

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Prisma ORM, PostgreSQL (Neon), TailwindCSS 4, TanStack Query, Zustand, NextAuth.js

## Common Commands

```bash
# Development
pnpm dev                    # Start dev server (localhost:3000)
pnpm build                  # Build (includes prisma generate & db push)
pnpm lint                   # ESLint

# Database
pnpm db:push                # Push schema changes to DB
pnpm db:migrate             # Run migrations
pnpm db:seed                # Seed initial data
pnpm db:studio              # Open Prisma Studio

# Crawling
pnpm crawl                  # Run news crawler with AI summarization
pnpm crawl:simple           # Run lightweight crawler
```

## Architecture

### Application Structure
- `src/app/` - Next.js App Router pages and API routes
  - `dashboard/` - Main dashboard (news feed, companies, reports, contracts, personnel)
  - `admin/` - Admin panel (user management, contract upload)
  - `api/` - REST API endpoints
- `src/components/` - React components
  - `ui/` - shadcn/ui primitives (Button, Card, Dialog, etc.)
  - `features/` - Domain-specific components (news, alerts, contracts, personnel)
  - `charts/` - Recharts visualizations
  - `layout/` - Header, Sidebar
  - `pdf/` - React-PDF weekly report generator
- `src/lib/` - Core utilities
  - `prisma.ts` - Prisma client singleton
  - `auth.ts` - NextAuth configuration (credentials provider, JWT strategy)
  - `serverless-crawler.ts` - Vercel-compatible crawler
  - `ai-summarizer.ts` - Claude AI news summarization
- `src/hooks/` - TanStack Query hooks (`use-news`, `use-companies`, `use-alerts`, etc.)
- `src/stores/` - Zustand stores (`filter-store.ts`)
- `src/services/api.ts` - Axios API client with typed endpoints

### Data Flow
1. **Crawling:** Vercel Cron triggers `/api/crawl` twice daily (8AM, 10PM KST) -> scrapes Naver News -> AI summarization (Claude Haiku) -> saves to DB
2. **Frontend:** Pages use TanStack Query hooks -> call `/api/*` routes -> Prisma queries PostgreSQL

### Database Schema (prisma/schema.prisma)
Key models:
- `SecuritiesCompany` - Securities companies with `isPowerbaseClient` flag
- `News` - Crawled news with AI summaries, categories (GENERAL, PERSONNEL, BUSINESS, PRODUCT, IR, EVENT)
- `PersonnelChange` - Executive appointments/promotions extracted from news
- `CustomerContract` / `ServiceContract` - PowerBase contract data
- `User` - Employees with role (USER, ADMIN, SUPER_ADMIN) and approval status
- `Notification`, `KeywordAlert`, `CompanyAlert` - Alert system

### Authentication
- NextAuth.js with credentials provider
- User approval workflow: PENDING -> APPROVED (by admin)
- Session includes `role`, `status`, `assignedCompanyIds`

### Key Patterns
- Path alias: `@/*` maps to `./src/*`
- API responses: `{ success: boolean, data?: T, error?: string, meta?: { total, page, limit } }`
- News categories stored as string enum in code, not DB enum
- Contract data uploaded via Excel (XLSX) through admin panel

## Environment Variables

```bash
DATABASE_URL        # Neon PostgreSQL connection (pooled)
DIRECT_URL          # Neon PostgreSQL direct connection
ANTHROPIC_API_KEY   # Claude AI for news summarization (optional)
NEXTAUTH_SECRET     # NextAuth session encryption
NEXT_PUBLIC_APP_URL # Public app URL
```

## Deployment

Deployed on Vercel. Cron jobs defined in `vercel.json`:
- `/api/crawl` at 8AM and 10PM KST daily
- Monday crawls also generate weekly reports
