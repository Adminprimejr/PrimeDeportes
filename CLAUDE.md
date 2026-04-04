# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A B2B sports advertising landing page for **Prime Deportes**, targeting brands seeking to advertise during FIFA World Cup 2026. The UI is in Spanish, targeting the Hispanic diaspora in the US and Colombia.

## Commands

```bash
# Requires Node v22 via nvm
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh" && nvm use 22

npm install          # install deps (requires Node v22 for better-sqlite3 native build)
npm run dev          # dev server → http://localhost:3000
npm run build        # Next.js production build
npm run start        # serve production build
npm run lint         # ESLint + TypeScript check
```

**Environment setup:** copy `.env.example` → `.env.local` and fill in values.

## Architecture

**Stack:** Next.js 15 (App Router + SSR), React 19, TypeScript, Tailwind CSS v4, Motion v12 (animations), Lucide React, Resend (email), better-sqlite3.

**File structure:**
```
app/
  layout.tsx           ← root layout: Google Fonts (next/font), SEO metadata, schema.org JSON-LD
  page.tsx             ← server component, renders <HomeContent />
  globals.css          ← Tailwind v4 @theme tokens + custom CSS classes
  sitemap.ts / robots.ts
  api/contact/route.ts ← POST handler: stores lead in SQLite + sends Resend emails
components/
  HomeContent.tsx      ← "use client", full page body with all sections
  Navbar.tsx           ← "use client", scroll detection + mobile menu
  Countdown.tsx        ← "use client", live countdown to June 11 2026
  StatCard.tsx         ← "use client", animated counter with useInView
  ContactForm.tsx      ← "use client", form with fetch → /api/contact
  Ticker.tsx           ← CSS-only animated news ticker
lib/
  db.ts                ← better-sqlite3 singleton, auto-creates data/leads.db
```

**Key design decisions:**
- `app/page.tsx` is a server component (for SSR HTML + metadata). `HomeContent` is "use client" — this means animations work but the component is still SSR'd by Next.js for initial HTML.
- Tailwind v4 uses `@tailwindcss/postcss` (not `@tailwindcss/vite`). No `tailwind.config.js`. All design tokens live in `app/globals.css` under `@theme`.
- `better-sqlite3` is a native module — declared in `serverExternalPackages` in `next.config.ts` to prevent bundling. Requires Node v22 to compile on macOS.
- `NEXT_PUBLIC_CALENDLY_URL` drives all scheduling CTAs throughout the page.

**Custom CSS classes** (defined in `app/globals.css`):
- `.ticker-wrap` / `.ticker-content` — fixed-bottom animated news ticker
- `.skew-section` / `.skew-content` — CSS skewY layout trick
- `.bg-pitch` — SVG football pitch texture background
- `.editorial-title` — bold italic Montserrat display heading
- `.broadcast-glow` — gold glow shadow

**Color tokens:**
- `--color-navy`: #1A3A5C / `--color-navy-dark`: #050B14
- `--color-gold`: #F4C430 / `--color-gold-bright`: #FFD700
- `--color-accent-red`: #E63946

**Page sections (in order):** Navbar → Ticker → Hero (countdown + Calendly CTA) → Urgency Bar → Stats Bar → Media Network → Jorge Talent → Packs (3-tier with pricing) → Credibility/Market Data → Why Us → FAQ Accordion → Noticias → Contact (form + Calendly) → Footer → WhatsApp Float.

## Lead Storage

All form submissions stored in `data/leads.db` (SQLite, gitignored). Schema: `leads(id, name, company, email, message, pack, created_at)`. The `data/` directory is auto-created on first run.

## Email Delivery

Uses Resend. Requires `RESEND_API_KEY` in `.env.local`. Uses `onboarding@resend.dev` as sender until `primedeportes.com` domain is verified in the Resend dashboard. Two emails sent per submission: internal notification + prospect auto-reply.

## Pending (replace before launch)

- `components/HomeContent.tsx:163` — Jorge photo: currently a stock image. Replace with real photo.
- `app/layout.tsx` — `/og-image.jpg` — create and place a 1200×630 OG image in `public/`.
- Social media links in Footer: update with real handles.
- Verify `primedeportes.com` domain in Resend dashboard and update `RESEND_FROM_EMAIL`.
