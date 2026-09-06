# ARCHITECTURE.md

## Societal Innovation Collaboration Portal for Jharkhand — Architecture

This document defines the target architecture. It is a design specification for the implementation that will follow. This document does not guarantee the described code exists yet.

---

## 1. Guiding Principles

- **Modular monolith.** One deployable Next.js app with strict internal service boundaries. No microservices in Phase 1.
- **Layered separation.** UI → API/server boundary → service layer → domain logic → data access → PostgreSQL.
- **Business logic lives in services, not components.** React components render; services enforce rules.
- **Server-side security.** Authorization and validation always happen on the server. Never trust the browser.
- **Replaceable external providers.** Storage, AI, notifications, geolocation sit behind interfaces.
- **Simple + explicit + testable + secure** beats clever/complicated (RULES.md Final Rule).

---

## 2. High-Level Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│  Next.js App (App Router)                                    │
│                                                              │
│  ┌──────────────────────────────┐   ┌──────────────────────┐ │
│  │  UI (React components)        │   │  Server Components / │ │
│  │  - App shell, landing         │   │  Route Handlers (/api)│ │
│  │  - Citizen/admin screens      │   │  Server Actions       │ │
│  │  - Reusable UI primitives     │   └───────────┬──────────┘ │
│  └──────────────┬───────────────┘               │            │
│                 │  (controlled client calls)    │            │
│  ┌──────────────▼───────────────┐   ┌───────────▼──────────┐ │
│  │  Auth helpers (session/RBAC) │   │  Server boundary:      │ │
│  │  Application / Service Layer │◄──┤  auth → authorize →    │ │
│  │  - ChallengeService           │   │  validate → execute    │ │
│  │  - ReviewService              │   │  → respond             │ │
│  │  - MatchingService            │   └───────────┬──────────┘ │
│  │  - NotificationService        │               │            │
│  │  - AnalyticsService           │   Validation schemas (Zod) │
│  │  - StorageService             │               │            │
│  │  - AIService (optional)       │               │            │
│  └──────────────┬───────────────┘   ┌───────────▼──────────┐ │
│                 │                   │  Domain / Data Access │ │
│                 │                   │  - Repositories       │ │
│                 └───────────────────►  - Prisma client      │ │
│                                     └───────────┬──────────┘ │
│                                                 │            │
└─────────────────────────────────────────────────┼────────────┘
                                                  ▼
                                        ┌──────────────────┐
                                        │    PostgreSQL     │
                                        │   (Prisma schema) │
                                        └──────────────────┘
```

---

## 3. Proposed Folder Structure

```
.
├── .env / .env.example
├── AGENTS.md
├── RULES.md
├── PROJECT_PLAN.md
├── ARCHITECTURE.md
├── DATABASE.md
├── API.md
├── README.md
├── package.json
├── tsconfig.json
├── eslint.config.*
├── prettier.config.*
├── next.config.*
├── tailwind / postcss config
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   ├── seed.ts
│   └── seed/
│       └── (seed data modules, clearly marked as development-only)
└── src/
    ├── app/                        # Next.js App Router
    │   ├── layout.tsx
    │   ├── page.tsx                # landing
    │   ├── globals.css
    │   ├── login/page.tsx
    │   ├── register/page.tsx
    │   ├── (public)/challenges/
    │   │   ├── page.tsx            # challenge list
    │   │   └── [id]/page.tsx       # challenge detail
    │   ├── (app)/
    │   │   ├── layout.tsx          # authenticated shell (role-aware)
    │   │   ├── citizen/
    │   │   │   ├── dashboard/page.tsx
    │   │   │   └── submit/page.tsx # guided multi-step flow
    │   │   └── admin/
    │   │       ├── dashboard/page.tsx
    │   │       └── challenges/[id]/page.tsx  # review
    │   └── api/
    │       ├── auth/[...nextauth]/route.ts
    │       ├── auth/register/route.ts
    │       └── ... Route Handlers (see API.md)
    │
    ├── components/                 # UI layer
    │   ├── ui/                     # reusable primitives
    │   │   ├── button.tsx
    │   │   ├── input.tsx
    │   │   ├── select.tsx
    │   │   ├── card.tsx
    │   │   ├── badge.tsx
    │   │   ├── status-badge.tsx
    │   │   ├── table.tsx
    │   │   ├── dialog.tsx
    │   │   ├── timeline.tsx
    │   │   ├── empty-state.tsx
    │   │   ├── error-state.tsx
    │   │   ├── loading-state.tsx
    │   │   ├── file-upload.tsx
    │   │   ├── filter-bar.tsx
    │   │   └── field.tsx           # labeled form field wrapper
    │   ├── forms/                  # multi-step + work-flow forms
    │   │   └── challenge-submit/   # step components
    │   └── layouts/                # nav, headers, shell fragments
    │
    ├── lib/
    │   ├── auth/                   # auth + RBAC (server-only)
    │   │   ├── auth.ts             # Auth.js config / session
    │   │   ├── password.ts         # hash/verify
    │   │   ├── session.ts          # getCurrentUser server helper
    │   │   ├── permissions.ts      # role → permission map
    │   │   ├── guard.ts            # requireRole / requirePermission
    │   │   └── rbac.ts             # central role/ownership policy
    │   ├── db/
    │   │   └── prisma.ts           # singleton Prisma client
    │   ├── validation/
    │   │   ├── challenge.ts        # Zod schemas
    │   │   ├── auth.ts
    │   │   ├── common.ts           # ids, enums, pagination
    │   │   └── index.ts
    │   ├── errors/
    │   │   ├── app-error.ts        # typed domain errors
    │   │   └── handler.ts          # uniform API error mapping
    │   ├── config/
    │   │   └── env.ts              # typed environment access
    │   └── utils/
    │
    ├── server/                     # application + domain layer (server-only)
    │   ├── auth/
    │   │   ├── auth-service.ts     # register/login, session logic
    │   │   └── rbac-service.ts     # resolve user roles/permissions
    │   ├── challenges/
    │   │   ├── challenge-service.ts
    │   │   ├── challenge-status.ts # controlled state machine
    │   │   ├── review-service.ts
    │   │   └── challenge-repo.ts   # data access
    │   ├── universities/
    │   │   ├── matching-service.ts # interface + deterministic impl
    │   │   ├── university-repo.ts
    │   │   └── types.ts
    │   ├── storage/
    │   │   ├── storage-service.ts  # interface
    │   │   ├── local-storage.ts    # Phase 1 dev implementation
    │   │   ├── s3-storage.ts       # future
    │   │   ├── file-validation.ts  # mime/size/extension policy
    │   │   └── index.ts
    │   ├── ai/
    │   │   ├── ai-service.ts       # interface
    │   │   ├── deterministic-ai.ts # Phase 1 default impl (no external API)
    │   │   ├── provider-http.ts    # future OpenAI/Gemini/Kimi
    │   │   └── index.ts
    │   ├── notifications/
    │   │   ├── notification-service.ts
    │   │   ├── notification-repo.ts
    │   │   ├── channels/           # future email/sms/push abstractions
    │   │   └── index.ts
    │   ├── analytics/
    │   │   └── analytics-service.ts # real DB-derived metrics
    │   └── types/
    │       └── (shared domain types)
    │
    └── middleware.ts               # optional session routing hints
```

> Note: `server/` is intended to be a single unit in the same Next.js process (monolith). Everything under `server/` imports only server-safe code (no client bundles). UI components never import directly from `server/`; they consume exposed API/server actions.

---

## 4. Frontend Architecture

- **App Router** with Server Components by default.
- **Server Components** fetch data (via services/repositories) and render.
- **Client Components** ("use client") only where interactivity is required (forms, tabs, dialogs, file upload, timeline interactions).
- **Server Actions** for mutations where a clean fit exists (e.g., guided submit steps); **Route Handlers** for REST-style APIs that other clients may consume. Both route through the same service layer (no duplicated logic).
- **Reusable UI primitives** under `components/ui` — built only where actual reuse exists (RULES.md / AGENTS.md §15).
- **Responsive** and **accessible**; semantic HTML, keyboard-nav, visible focus.
- Every async UI state handles loading / success / empty / error.

---

## 5. Backend / API Architecture

Request flow (enforced for every protected operation):

```text
request → authentication → authorization → validation → business logic → database/service → response
```

- **Route Handlers** live under `src/app/api/**`. Each performs the guard chain, then delegates to a service. No business logic inside handlers beyond orchestration.
- **Server Actions** follow the same chain (auth → authorize → validate → service).
- **Errors**: typed `AppError` subclasses (e.g., `UnauthorizedError`, `ForbiddenError`, `ValidationError`, `NotFoundError`, `ConflictError`). A uniform handler maps them to HTTP responses; internal/database errors are logged and returned as generic 500s — never leaked to clients.
- **Input validation**: Zod schemas defined in `lib/validation`, applied at the boundary before any business logic.
- **Pagination** and **filtering** parameters validated at the boundary.

---

## 6. Authentication Architecture

- **Auth.js (NextAuth) v5** with the **Credentials provider**, or a thin custom session layer — decided at implement time based on the exact Next.js version in use. Both approaches land on the same `AuthService` + session helper interface so the choice is encapsulated.
- **Passwords**: hashed with `bcryptjs` (pure-JS to avoid native build issues). Never stored in plaintext.
- **Sessions**: JWT or database sessions in a signed/encrypted cookie (server-only). Session is read server-side to identify the user on every protected request.
- The server determines identity from the session, **never** from client-supplied user/role fields.
- `lib/auth/session.ts` returns the current user + roles for any server context (route handlers, server actions, server components).

---

## 7. RBAC Architecture

Roles (from AGENTS.md §6, a single enum in DB and code):

```text
CITIZEN
GOVERNMENT
ADMIN
UNIVERSITY_ADMIN
FACULTY
STUDENT
INDUSTRY
MENTOR
```

Design:

- A `User` has a single `role` in Phase 1 (kept simple). Role is stored server-side and enforced server-side.
- `lib/auth/permissions.ts` defines a **permission map**: role → set of permissions (e.g., `challenge:create`, `challenge:validate`, `challenge:assign`, `challenge:review`, `challenge:view_all`).
- `lib/auth/guard.ts` exposes `requirePermission(...)`, `requireOwnership(...)` used at the top of every protected handler/action.
- **Ownership** checks (e.g., citizen may view/edit only their own challenge) are queried against the DB, never inferred from client claims.
- The UI hides/shows actions based on role **only for UX**; all security is enforced on the server.

Role → permission mapping (Phase 1 essentials):

| Permission | CITIZEN | GOV | ADMIN | UNIV_ADMIN | FACULTY | STUDENT | INDUSTRY | MENTOR |
|---|---|---|---|---|---|---|---|---|
| challenge:create | ✓ | ✓ | ✓ | | | | | |
| challenge:view_mine | ✓ | ✓ | ✓ | | | | | |
| challenge:view_all | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| challenge:validate | | ✓ | ✓ | | | | | |
| challenge:review | | ✓ | ✓ | | | | | |
| challenge:assign | | ✓ | ✓ | | | | | |
| challenge:update_status | | ✓ | ✓ | (partial) | | | | |
| dashboard:view | | ✓ | ✓ | (univ) | | | (univ) | |

(Exact matrix finalized in code; table documents intent.)

---

## 8. Challenge Domain Model & Lifecycle

Challenge is the central aggregate. It holds submission, location, categorization, evidence refs, status, priority, and AI metadata. A challenge may transition into a `Project` later.

### States (Prisma enum `ChallengeStatus`)

```text
DRAFT
SUBMITTED
UNDER_REVIEW
VALIDATION_REQUIRED
VALIDATED
REJECTED
MATCHING
ASSIGNED
ACCEPTED
IN_PROGRESS
PILOT
VALIDATION
IMPLEMENTED
RESOLVED
ARCHIVED
```

### Controlled Transitions

Transitions are defined in a single server-side state machine in `server/challenges/challenge-status.ts`:

```text
DRAFT ──────────────► SUBMITTED
SUBMITTED ─────────► UNDER_REVIEW | REJECTED
UNDER_REVIEW ──────► VALIDATION_REQUIRED | VALIDATED | REJECTED
VALIDATION_REQUIRED ► VALIDATED | REJECTED
VALIDATED ─────────► MATCHING | ARCHIVED
MATCHING ──────────► ASSIGNED | ARCHIVED
ASSIGNED ──────────► ACCEPTED | REJECTED
ACCEPTED ──────────► IN_PROGRESS
IN_PROGRESS ───────► PILOT | RESOLVED | ARCHIVED
PILOT ─────────────► VALIDATION | IN_PROGRESS | RESOLVED
VALIDATION ────────► IMPLEMENTED | IN_PROGRESS
IMPLEMENTED ───────► RESOLVED | ARCHIVED
RESOLVED ──────────► ARCHIVED
```

Rules:

- A client may **never** set a status directly. Only `transitionChallenge(id, toState, actor)` in the service can change status.
- The state machine validates (a) the transition is allowed from the current state, and (b) the actor has permission for that transition.
- Every transition is persisted in `ChallengeStatusHistory` and written to the `AuditLog`.

---

## 9. Storage Abstraction

- `StorageService` interface defines the minimal operations needed (e.g., `putFile`, `getFileUrl`, `deleteFile`, plus object-key generation).
- `LocalStorageService` is the Phase 1 implementation (files under a private server directory). `S3StorageService` is a stub for later; provider selection via config/env with no app-layer changes.
- **Metadata** (original name, mime, size, owner, challengeId, key, visibility) is stored in PostgreSQL (`ChallengeEvidence`/`Document`). The bytes live behind the storage abstraction.
- **Ownership/access control**: private files are served only after an authorization check; URLs are not exposed publicly without a server check.
- **Validation**: server-side validation of size, extension, and MIME (sniffing where feasible — never trusting client MIME alone), plus ownership and permissions.

---

## 10. AI Abstraction

- `AIService` interface with methods (per prompt/AGENTS):
  - `classifyChallenge(input)` → `{ domain, tags, confidence }`
  - `detectDuplicates(input)` → `{ candidates, similarity }`
  - `prioritizeChallenge(input)` → `{ priority, reasons }`
  - `recommendUniversities(input)` → `{ recommendations }`
  - `summarizeChallenge(input)` → `{ summary }`
- Phase 1 default: `DeterministicAIService` — pure rule-based, no network, no API key. It is **explicitly** not claimed to be an LLM.
- Configuration (`AI_PROVIDER` env) selects the provider; when unset/`none`, the platform runs on the deterministic path with **no AI dependency**.
- **AI output is untrusted external data** (RULES.md §20, §21): classified fields, recommendations, and confidence are validated before being persisted; the application always makes the final decision. AI never bypasses business rules.

---

## 11. University Matching Architecture

- Match based on **structured institutional capabilities**, never hardcoded domain→university rules.
- `UniversityMatchingService` interface: `matchUniversities(challenge, options)` → ranked list.
- Phase 1 implementation: **deterministic scoring** over capabilities (`University`, `UniversityDepartment`, `Faculty`, discipline/tags, location relevance, capacity/workload, previous projects). The concrete algorithm is isolated to one file so a future AI/semantic implementation can replace it without touching the rest of the system.
- Capability data is normalized in the schema (tags, departments, research areas) to make matching queryable.

---

## 12. Notification Architecture

- Internal in-app notifications stored in PostgreSQL (`Notification`), surfaced in the UI bell/list.
- `NotificationService` creates notifications on domain events (status change, assignment, review). It declares a channel abstraction (`NotificationChannel` with `send()`) for future email/SMS/push; Phase 1 channels deliver only in-app rows.
- Emitting notifications is driven by the domain service (e.g., ChallengeService calls NotificationService), keeping providers replaceable.

---

## 13. Geolocation

- Structured fields: district, block, village/ward, optional latitude/longitude.
- No paid maps API required in Phase 1. Location input is plain structured fields (plus optional coordinates). A lightweight provider abstraction allows a future map service without restructuring.

---

## 14. Validation Strategy

- All external input validated with **Zod** schemas at the boundary (`lib/validation`): request bodies, query strings, URL params, uploads, dates, enum values, IDs, ownership, permissions.
- Malformed input is rejected **before** business logic runs.
- Enums validated against the Prisma enum values.
- AI outputs re-validated before persistence.

---

## 15. Testing Strategy

Vitest, focused on business-critical behavior (not coverage chasing):

- **Auth**: register, login, wrong password, session helpers.
- **RBAC/authorization**: permission checks reject wrong roles; ownership enforced.
- **Challenge**: creation persistence, ownership, validation schema rejection of bad input.
- **Status transitions**: allowed transition succeeds; disallowed transition and unprivileged actor both fail (state machine tests).
- **Assignment**: assign only permitted to authorized roles.
- **Database constraints**: unique/index/FK behavior enforced by schema.
- **Critical service logic**: matching score determinism, notification triggers, analytics correctness against known seeded data.

Plus `npm run lint`, `typecheck`, `build` as mandatory quality gates.

---

## 16. Environment Variables

`.env.example` documents every variable. Server-only values must only be imported in server components/services; the `lib/config/env.ts` module centralizes typed access and asserts required vars at boot in production.

Proposed variables (names finalized at setup):

```text
DATABASE_URL               # PostgreSQL connection string
AUTH_SECRET / NEXTAUTH_SECRET
NEXTAUTH_URL
APP_ENV                    # development | production
STORAGE_DRIVER             # local | s3 (future)
STORAGE_LOCAL_DIR
AI_PROVIDER                # none | deterministic | openai (future)
AI_*                       # future provider keys, optional
```

---

## 17. Major Architectural Decisions (summary)

1. **Modular monolith** in a single Next.js app; service-layer boundaries in-process.
2. **No client-trusted anything**: auth, roles, ownership, status always server-verified.
3. **Service/repository layering** centralizes business logic and data access (RULES.md §9, AGENTS.md §3).
4. **Controlled state machine** for challenge lifecycle; status never set directly by clients.
5. **Provider interfaces** for storage, AI, notifications, geolocation, matching — replaceable via config.
6. **Zod at the boundary** for consistent validation.
7. **Password auth via Auth.js/Credentials + bcryptjs**; sessions server-side.
8. **Real DB metrics** for dashboards; seed data clearly marked dev-only.
9. **Phase 1 is one complete value loop**, with foundations for later phases.

---

## 18. Final Report: Architectural Risks & Open Decisions

**Risks:**
- **Auth.js v5 beta variance** — mitigated by encapsulating all auth behind `AuthService`/session helpers so the provider can change without touching the app.
- **Database migration drift** — mitigated by strict Prisma migration workflow and CI-style checks.
- **File upload surface** — highest security risk; mitigated with server-side validation, storage abstraction, and authorization checks for serving private files.
- **AI provider swap** — mitigated by interface + strict output validation; no hardcoded vendor calls in domain layer.

**Open decisions (to resolve during setup, documented here so they are explicit):**
- Auth.js v5 vs custom credential/session layer → resolve at `auth-rbac`.
- Tailwind v4 vs v3 tooling → resolve at scaffold.
- Whether to add an integration test harness (e.g., Playwright) in Phase 1 → decide near completion.
- Exact deterministic matching weights → set during `universities` work, kept out of the domain logic contract.
