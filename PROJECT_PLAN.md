# PROJECT_PLAN.md

## Societal Innovation Collaboration Portal for Jharkhand

This document is the engineering plan for building the platform described in `AGENTS.md`, `RULES.md`, and `opencode_societal_innovation_portal_prompt.md`. It describes the design that will be implemented. It is a plan and design specification, not yet-implemented functionality.

---

## 1. Product Summary

A web platform that connects citizens, communities, government, Higher Education Institutions (HEIs), industry, startups, MSMEs, CSR organizations, research labs, and innovation ecosystems. Its purpose is to convert real societal challenges into validated, institutionally matched, collaboratively developed, tested, and deployable solutions.

Core workflow:

```text
Problem → Validation → Matching → Collaboration → Solution → Impact
```

The system is built as a **modular monolith**: a single deployable Next.js application with clearly separated internal service layers. No microservices in Phase 1.

---

## 2. Phase 1 Scope (see ARCHITECTURE.md)

Phase 1 delivers one complete, working value loop:

Citizen submits a challenge → it persists in PostgreSQL → appears in the citizen dashboard → admin reviews it → admin performs a permitted status transition → citizen sees the updated state.

Supporting foundations delivered in Phase 1:

- Authentication + server-side RBAC
- Challenge submission (guided multi-step citizen flow)
- Challenge listing / detail / status timeline
- Admin challenge queue and review
- Real database-derived dashboard metrics
- Storage abstraction
- AI abstraction (optional, deterministic default)
- Notification abstraction (internal in-app)
- Development seed data
- Critical backend tests
- Documentation

Deliberately **not** in Phase 1: advanced project management, industry collaboration workflow, sophisticated/AI-driven matching, email/SMS/push delivery. Their foundations (interfaces, schema shapes) are put in place so later phases do not require restructuring.

---

## 3. Phase 1 Increments (implementation order)

Each increment is a logical git checkpoint. Run lint/typecheck/test/build and verify the app starts after each increment.

1. **initial-project-setup** — Next.js (App Router) + TypeScript strict + Tailwind, ESLint, Prettier, path aliases, env template, base `package.json` scripts.
2. **database-foundation** — Prisma setup, PostgreSQL connection, full Phase-1 schema, first migration, seed script.
3. **auth-rbac** — Auth.js session foundation, password hashing, login/register, server-side session helpers, RBAC guard helpers, permission map, audit log hook.
4. **app-layout** — Application shell, navigation, role-aware layout, reusable UI primitives (Button, Input, Card, Badge, etc.).
5. **landing-page** — Public landing with "Report a Community Problem" CTA.
6. **citizen-challenge-flow** — Multi-step guided submission form, ownership rules, challenge persistence, evidence metadata storage, citizen dashboard + "My Challenges" list.
7. **challenge-listing-detail** — Public/authorized challenge list, detail page, status timeline component.
8. **admin-review-flow** — Admin challenge queue with filters/search, detail review, validation, priority, review notes, controlled status transitions.
9. **ai-abstraction** — AI service interfaces + deterministic implementation (classification, prioritization, duplicate detection, recommendations, summarization), fully optional.
10. **notifications** — In-app Notification model + service, triggers on status changes/assignments.
11. **dashboard-metrics** — Government/Admin overview metrics computed from real database queries.
12. **seeding** — Development seed data (clearly identified as seed), used only in dev/demo.
13. **tests** — Critical backend logic tests (auth, RBAC, ownership, challenge creation/validation, status transitions, constraints).
14. **documentation** — README, and keep these documents accurate.

---

## 4. Technology Stack

- **Language:** TypeScript (strict)
- **Framework:** Next.js (App Router) — single deployable app
- **Frontend:** React, Tailwind CSS
- **Database:** PostgreSQL (through Prisma ORM)
- **Auth:** Auth.js with Credentials provider + bcrypt password hashing (session cookies)
- **Validation:** Zod schemas at the server boundary
- **Testing:** Vitest for service/unit tests; Playwright or integration tests for critical API flow (decided during setup based on team familiarity)
- **Linting/format:** ESLint + Prettier

---

## 5. Dependencies Intended for Installation

Core (Phase 1 foundation):

- `next`, `react`, `react-dom`
- `@prisma/client`, `prisma` (dev)
- `typescript` (dev), `@types/*` (dev)
- `tailwindcss`, `postcss`, `autoprefixer` (as required by Tailwind v4/v3 setup)
- `zod`
- `next-auth` (Auth.js) v5 (App Router) + `bcryptjs` (or `bcrypt`) + `@auth/prisma-adapter` if adapter-based sessions are used
- `eslint`, `eslint-config-next` (dev)
- `prettier` (dev)
- `vitest` (dev) for tests
- `seed` — a small keyed-in JS/TS seed file, no extra library required unless chosen

Any additional dependency (e.g., `playwright`) will be added only when a concrete testing need justifies it, following RULES.md §16.

---

## 6. Environment Variables (see ARCHITECTURE.md & README)

Stored only in `.env*` files, never committed. `.env.example` documents names. Server-only secrets never referenced from client components.

---

## 7. Quality Gates / Definition of Done

Before each increment and before declaring Phase 1 complete:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

End-to-end Phase 1 success criteria (from the prompt):

- App starts, DB connects, migrations apply
- Auth works, RBAC works
- Citizen submits a real challenge, data persists, evidence metadata stored
- Citizen sees it in dashboard; admin reviews it; permitted status transition; citizen sees the update
- Dashboards use real database data
- AI / storage / notification abstractions exist and are optional/replaceable
- Critical tests, typecheck, lint, build all pass
- Documentation exists and is accurate

---

## 8. Git Strategy

Logical commits matching the increments above (e.g., `auth-rbac`, `citizen-challenge-flow`). Preserve existing history. No force-push, no resets.

---

## 9. Known Risks / Open Decisions

See the final report section of ARCHITECTURE.md. Key items:

- Auth.js v5 beta stability vs. implementing a thin custom session/credential layer. Will resolve at `auth-rbac` increment based on the exact Next.js version in use.
- bcrypt native compile issues on some platforms → prefer `bcryptjs` (pure JS) for portability.
- Tailwind CSS v4 vs v3 setup differences; resolved at setup time.
- Whether to add an integration testing framework beyond Vitest unit tests is a Phase-1-close decision.

These are explicit, tracked decisions, not gaps in the design.
