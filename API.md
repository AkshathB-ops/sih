# API.md

## Societal Innovation Collaboration Portal for Jharkhand — API Specification

This document specifies the server API surface. It is a design specification for the endpoints/contracts to be implemented. The described endpoints are the target; not all may exist in Phase 1 (Phase 1 scope is noted per section).

---

## 1. Conventions

- **Authentication**: every protected endpoint requires a valid server-side session (cookie). The server derives identity/roles from the session only.
- **Authorization**: RBAC permission checks and ownership checks run on the server before any business logic.
- **Validation**: all bodies/params validated with Zod at the boundary. Invalid input → `400` with a field-error payload.
- **Errors**: consistent JSON error envelope:
  ```json
  { "error": { "code": "NOT_FOUND", "message": "Challenge not found", "details": {} } }
  ```
  HTTP status mapping:
  - `400` `VALIDATION_ERROR` — malformed input
  - `401` `UNAUTHENTICATED` — no/invalid session
  - `403` `FORBIDDEN` — authenticated but not permitted (role/ownership)
  - `404` `NOT_FOUND`
  - `409` `CONFLICT` — invariant violation (e.g., invalid status transition)
  - `500` `INTERNAL_ERROR` — generic; real detail logged server-side, never leaked
- **IDs**: Prisma cuid strings.
- **Pagination**: `?page=1&pageSize=20` (defaults where not specified). Offset-based, validated.
- **Field naming**: camelCase in JSON.

---

## 2. Authentication & Registration

Phase 1: ✅ implemented.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | public | Create account. Body: `{ email, name, password, role }` (role defaults `CITIZEN`; elevated roles only via seed/admin). Validates email uniqueness, password strength. Returns user (no secrets). |
| POST | `/api/auth/login` | public | Login (Auth.js Credentials). Body: `{ email, password }`. Sets session cookie. |
| POST | `/api/auth/logout` | session | Invalidates session. |
| GET | `/api/auth/session` | public* | Returns current session/user + roles if any (*session cookie read server-side). |
| GET | `/api/auth/me` | session | Current user profile + role. |

---

## 3. Challenges

Phase 1: ✅ create, list, get, status transition, review, assign, list-mine.

| Method | Path | Auth/Permission | Description |
|---|---|---|---|
| POST | `/api/challenges` | `challenge:create` | Create/submit a challenge. Body per submission schema (title, description, location, domain(s), impact, evidence refs). Sets status to `SUBMITTED` (or `DRAFT` if saved). |
| GET | `/api/challenges` | `challenge:view_all` or `challenge:view_mine` | List challenges with filters: `status`, `district`, `domain`, `priority`, `search`, `assignedTo`, plus pagination. Role determines whether public all or own-only. |
| GET | `/api/challenges/mine` | `challenge:view_mine` | Citizen's own challenges. |
| GET | `/api/challenges/:id` | `challenge:view_all` or owner | Challenge detail incl. evidence metadata, reviews, assignments, status history. Ownership enforced (non-admin sees own only). |
| PATCH | `/api/challenges/:id` | owner or `challenge:update` | Edit own draft / permitted fields. Status is **not** settable here. |
| POST | `/api/challenges/:id/submit` | owner | Submit a draft → `SUBMITTED`. |
| POST | `/api/challenges/:id/review` | `challenge:review` | Admin review. Body: `{ decision, notes?, priority? }`. Triggers a validated status transition + creates `ChallengeReview`. |
| POST | `/api/challenges/:id/assign` | `challenge:assign` | Assign to institution. Body: `{ organizationId, notes? }`. Creates `ChallengeAssignment`, transitions status (e.g., → `ASSIGNED`), notifies. |
| POST | `/api/challenges/:id/transition` | `challenge:update_status` | Explicit controlled transition. Body: `{ toStatus, note? }`. Server validates transition legality + actor permission. |
| POST | `/api/challenges/:id/evidence` | owner or `challenge:update` | Body: multipart file upload. Validates size/type, stores bytes via StorageService, persists metadata as `ChallengeEvidence`. |
| DELETE | `/api/challenges/:id/evidence/:evidenceId` | owner or `challenge:update` | Remove evidence (storage + metadata). |

**Ownership rule**: a citizen may create/submit/view/edit only challenges where `challenge.userId = session.user.id`.

---

## 4. Universities / Institutions

Phase 1: ✅ list/get + matching endpoint.

| Method | Path | Auth/Permission | Description |
|---|---|---|---|
| GET | `/api/universities` | session (any) | List institutions (`Organization` with `orgType` university, HEI) with capability data, filters (district, discipline), pagination. |
| GET | `/api/universities/:id` | session (any) | Institution detail incl. departments, faculty, capabilities. |
| POST | `/api/universities/match` | `challenge:assign` | Body: `{ challengeId }`. Returns ranked institution matches from `MatchingService` (deterministic in Phase 1) with scores + reasons. Read-only driver for admins. |

---

## 5. Projects (foundation)

Phase 1: ✅ minimal create/get for the value loop is out of scope (full project workflow is Phase 2). Listed as target contract.

| Method | Path | Auth/Permission | Description |
|---|---|---|---|
| POST | `/api/projects` | university roles | Create project from a validated challenge. Transactionally creates Project + initial Milestone + ProjectMember(lead). |
| GET | `/api/projects/:id` | member or `project:view` | Project detail. |
| PATCH | `/api/projects/:id` | owner/lead | Update project fields. |
| POST | `/api/projects/:id/members` | lead | Add member. |
| POST | `/api/projects/:id/milestones` | lead | Create milestone. |
| PATCH | `/api/milestones/:id` | lead/mentor | Update milestone status/`completionPct`. |
| POST | `/api/milestones/:id/deliverables` | lead/mentor | Upload deliverable. |
| POST | `/api/projects/:id/proposals` | member | Submit proposal. |

---

## 6. Industry Collaboration

Phase 1: ❌ (Phase 2 workflow). Listed as target contract.

| Method | Path | Auth/Permission | Description |
|---|---|---|---|
| POST | `/api/industry/interests` | `INDUSTRY` | Express interest in a challenge/project → `IndustryCollaboration` (INTERESTED). |
| POST | `/api/industry/collaborations/:id/respond` | org owner / `UNIVERSITY_ADMIN` | Accept/reject → ACCEPTED/REJECTED → ACTIVE. |
| PATCH | `/api/industry/collaborations/:id` | participant | Update role/notes/status. |

---

## 7. Notifications

Phase 1: ✅ in-app read/list.

| Method | Path | Auth/Permission | Description |
|---|---|---|---|
| GET | `/api/notifications` | session (own) | Current user's notifications (unread first), paginated. |
| GET | `/api/notifications/unread-count` | session | Unread count badge. |
| POST | `/api/notifications/:id/read` | owner | Mark one read. |
| POST | `/api/notifications/read-all` | owner | Mark all read. |

---

## 8. Dashboard / Analytics

Phase 1: ✅ admin overview using real DB counts.

| Method | Path | Auth/Permission | Description |
|---|---|---|---|
| GET | `/api/dashboard/overview` | `dashboard:view` | Government/Admin: total challenges, by status, by district, by domain, validation rate, active projects, implementation rate. Computed live from PostgreSQL. |
| GET | `/api/dashboard/university` | `UNIVERSITY_ADMIN` | Institutional: assigned challenges, active/completed projects, participation. |
| GET | `/api/dashboard/industry` | `INDUSTRY` | Supported projects, mentorship/funding/pilots counts. |

All numbers are computed from real database queries; no hardcoded statistics.

---

## 9. Files / Documents

Phase 1: ✅ upload metadata + controlled access.

| Method | Path | Auth/Permission | Description |
|---|---|---|---|
| POST | `/api/files` | session | Multipart upload. Validates size/type, stores via StorageService, returns metadata incl. `id`/`storageKey` reference. |
| GET | `/api/files/:id` | owner or authorized | Serve file bytes **only** after server ownership/visibility check. Private files never publicly served. |

---

## 10. Request/Response Examples (Canonical Contracts)

**POST /api/challenges**
```json
// request
{
  "title": "Safe drinking water in village X",
  "description": "Villagers lack access to clean water during summer.",
  "district": "Ranchi",
  "block": "Kanke",
  "villageWard": "Kanke",
  "latitude": 23.36,
  "longitude": 85.33,
  "primaryDomain": "WATER_RESOURCES",
  "secondaryDomains": ["HEALTHCARE"],
  "tags": ["water", "health"],
  "urgency": "HIGH",
  "affectedPopulation": "Approx 2000 residents",
  "geographicScope": "One village"
}
```
```json
// 201 response
{
  "id": "clx...",
  "status": "SUBMITTED",
  "title": "Safe drinking water in village X",
  "district": "Ranchi",
  "primaryDomain": "WATER_RESOURCES",
  "createdAt": "2026-09-06T10:00:00.000Z"
}
```

**POST /api/challenges/:id/review**
```json
// request
{ "decision": "APPROVED", "notes": "Validate data supports the issue.", "priority": "HIGH" }
// response: updated challenge with current status (VALIDATED) + status history
```

**POST /api/challenges/:id/transition**
```json
// request
{ "toStatus": "REJECTED", "note": "Duplicate of CLX-100." }
// invalid/forbidden transition → 409 CONFLICT or 403 FORBIDDEN
```

---

## 11. Error Response Examples

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Invalid input", "details": { "primaryDomain": ["Invalid enum value"] } } }
{ "error": { "code": "FORBIDDEN", "message": "You do not have permission to validate challenges" } }
{ "error": { "code": "NOT_FOUND", "message": "Challenge not found" } }
{ "error": { "code": "CONFLICT", "message": "Cannot transition from SUBMITTED to IN_PROGRESS" } }
```

---

## 12. Implementation Mapping (routes → services)

Handlers are thin; the real logic is in `src/server/**`:

| Route | Service |
|---|---|
| auth routes | `AuthService` + `RbacService` |
| challenges | `ChallengeService` (submit/edit/review/transition), `ReviewService` |
| evidence/files | `StorageService` + `ChallengeService` authorization |
| universities/match | `UniversityMatchingService` |
| projects/milestones | `ProjectService` (Phase 2 workflow) |
| notifications | `NotificationService` |
| dashboard | `AnalyticsService` |

Handlers perform: authenticate → authorize (guard) → validate (Zod) → delegate to service → map result/errors to response.
