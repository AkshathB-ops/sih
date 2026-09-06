# DATABASE.md

## Societal Innovation Collaboration Portal for Jharkhand — Database Design

This document specifies the PostgreSQL schema (via Prisma) that will back the application. It is a design specification for the intended schema. It is not yet a guarantee that the migration exists.

---

## 1. Stack & Conventions

- **PostgreSQL** accessed only through **Prisma** (`@prisma/client`).
- Strict typing with Prisma's generated types; no `any`.
- Use:
  - `String` @id with Prisma `cuid()` for primary keys (portable, non-sequential, safe to expose).
  - `DateTime` timestamps `createdAt` / `updatedAt` on all persisted entities.
  - Foreign keys + `onDelete` behavior chosen explicitly.
  - Indexes on all foreign keys and on frequently filtered/queried columns.
  - Prisma **enums** for controlled vocabularies (roles, statuses, etc.).
  - `DbNull`/`Json` for flexible-but-validated metadata (tags, AI metadata) where normalization is not warranted.
- All naming in camelCase with Prisma mapping to snake_case columns via `@map`/`@@map` as needed (default mapping is fine; keep consistent).

---

## 2. Enums

```prisma
enum UserRole {
  CITIZEN
  GOVERNMENT
  ADMIN
  UNIVERSITY_ADMIN
  FACULTY
  STUDENT
  INDUSTRY
  MENTOR
}

enum ChallengeStatus {
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
}

enum ChallengePriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum EvidenceKind {
  PHOTO
  VIDEO
  DOCUMENT
}

enum Visibility {
  PUBLIC
  PRIVATE
}

enum AssignmentStatus {
  PENDING
  ACCEPTED
  REJECTED
}

enum ReviewDecision {
  APPROVED
  REJECTED
  REQUIRES_MORE_INFO
}

enum NotificationType {
  CHALLENGE_STATUS
  CHALLENGE_ASSIGNMENT
  PROJECT_INVITE
  MILESTONE_REMINDER
  PROPOSAL_APPROVAL
  MENTOR_FEEDBACK
  INDUSTRY_COLLABORATION
  ADMIN_ACTION
}

enum ProjectStatus {
  PROPOSAL
  IN_PROGRESS
  PILOT
  VALIDATION
  COMPLETED
  ON_HOLD
}

enum MilestoneStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  BLOCKED
}

enum MilestoneApproval {
  PENDING
  APPROVED
  REJECTED
}

enum IndustryCollaborationStatus {
  INTERESTED
  REQUESTED
  ACCEPTED
  REJECTED
  ACTIVE
  COMPLETED
}

enum OrganizationType {
  UNIVERSITY
  GOVERNMENT_DEPARTMENT
  INDUSTRY
  STARTUP
  MSME
  CSR
  RESEARCH_LAB
  NGO
  OTHER
}
```

---

## 3. Entities & Relationships (Phase 1 schema)

The relationship design below is the target. Phase 1 implements the full **challenge workflow** set plus the supporting **auth**, **reference**, and **abstraction-foundation** tables. Project/industry/impact tables are modeled so later phases plug in without schema restructuring, but their full management flows are Phase 2+.

### 3.1 Authentication & Users

**User**
```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String
  role         UserRole @default(CITIZEN)
  phone        String?
  district     String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  challenges        Challenge[]
  reviews           ChallengeReview[]
  assignmentActions ChallengeAssignment[]
  documents         Document[]
  auditLogs         AuditLog[]
  notifications     Notification[]
}
```

- Single `role` per user in Phase 1 (kept simple; extension to many-roles is a later, non-breaking change if ever needed).
- Password is always stored hashed (bcryptjs); never plaintext.

### 3.2 Organizations & Institutions (reference data + matching capabilities)

**Organization** — polymorphic container for universities, government departments, industry, etc. This avoids many near-identical tables and provides one place for shared capability data.

```prisma
model Organization {
  id               String           @id @default(cuid())
  orgType          OrganizationType
  name             String
  slug             String           @unique
  description      String?
  location         String?
  district         String?
  website          String?

  // capability data used by UniversityMatchingService / discovery
  disciplines      String[]         // normalized tags, validated
  researchAreas    String[]
  labs             String[]
  techCapabilities String[]
  innovationCentres String[]
  incubation       Boolean          @default(false)

  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  departments    UniversityDepartment[]
  faculty        Faculty[]
  students       Student[]
  challenges    
  projects       
  collaborations IndustryCollaboration[]
}
```

**UniversityDepartment**
```prisma
model UniversityDepartment {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  name           String
  disciplines    String[]
}
```

**Faculty** (linked to a user + organization)
```prisma
model Faculty {
  id             String   @id @default(cuid())
  userId         String   @unique
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  title          String?
  expertise      String[]
}
```

**Student**
```prisma
model Student {
  id             String   @id @default(cuid())
  userId         String   @unique
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  program        String?
}
```

> Note: the prompt lists `GovernmentDepartment`, `University`, `IndustryPartner` as entities. We model these **as specializations of `Organization`** (with `orgType`) rather than separate tables — a cleaner relational model (prompt §13 allows this). Typed convenience queries can be exposed via the service layer.

### 3.3 Challenge (the central aggregate)

**Challenge**
```prisma
model Challenge {
  id          String          @id @default(cuid())
  userId      String
  user        User            @relation(fields: [userId], references: [id], onDelete: Restrict)

  title       String
  description String
  problemStatement Json?      // structured problem statement (validated)

  // location
  district    String
  block       String?
  villageWard String?
  latitude    Float?
  longitude   Float?

  // categorization
  primaryDomain String          // from a validated domain enum
  secondaryDomains String[]     // validated
  tags         String[]         // validated

  // impact
  urgency      ChallengePriority @default(MEDIUM)
  affectedPopulation String?
  geographicScope String?

  // workflow
  status       ChallengeStatus @default(DRAFT)
  priority     ChallengePriority @default(MEDIUM)
  assignedOrganizationId String?
  assignedOrganization Organization? @relation("AssignedOrg", fields: [assignedOrganizationId], references: [id], onDelete: SetNull)

  // AI metadata (validated before persistence; not trusted directly)
  aiClassification Json?    // domain/tags/confidence from AI (recorded, auditable)
  aiDuplicateMeta  Json?    // similarity candidates
  aiPriority       Json?
  aiSummary        String?

  submittedAt  DateTime?
  reviewedAt   DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  evidence     ChallengeEvidence[]
  reviews      ChallengeReview[]
  assignments  ChallengeAssignment[]
  statusHistory ChallengeStatusHistory[]
  documents    Document[]
  proposals    Proposal[]
  projects     Project[]
  auditLogs    AuditLog[]

  @@index([status])
  @@index([district])
  @@index([primaryDomain])
  @@index([userId])
  @@index([assignedOrganizationId])
  @@index([createdAt])
}
```

**ChallengeEvidence** — metadata only; bytes behind StorageService.
```prisma
model ChallengeEvidence {
  id          String       @id @default(cuid())
  challengeId String
  challenge   Challenge    @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  kind        EvidenceKind
  storageKey  String       @unique
  originalName String
  mimeType    String
  sizeBytes   Int
  visibility  Visibility   @default(PRIVATE)
  uploadedBy  String
  uploadedById String?
  createdAt   DateTime     @default(now())

  @@index([challengeId])
}
```

**ChallengeAssignment** — institution assignment record
```prisma
model ChallengeAssignment {
  id             String         @id @default(cuid())
  challengeId    String
  challenge      Challenge      @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  organizationId String
  organization   Organization   @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  status         AssignmentStatus @default(PENDING)
  assignedBy     String
  assignedById   String?
  notes          String?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  @@unique([challengeId, organizationId])
  @@index([organizationId])
}
```

**ChallengeReview** — admin validation/review record
```prisma
model ChallengeReview {
  id          String         @id @default(cuid())
  challengeId String
  challenge   Challenge      @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  reviewerId  String
  reviewer    User           @relation(fields: [reviewerId], references: [id], onDelete: Restrict)
  decision    ReviewDecision
  notes       String?
  priority    ChallengePriority?
  createdAt   DateTime       @default(now())

  @@index([challengeId])
}
```

**ChallengeStatusHistory** — append-only transition log
```prisma
model ChallengeStatusHistory {
  id          String          @id @default(cuid())
  challengeId String
  challenge   Challenge       @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  fromStatus  ChallengeStatus?
  toStatus    ChallengeStatus
  changedById String?
  changedBy   User?           @relation(fields: [changedById], references: [id], onDelete: SetNull)
  note        String?
  createdAt   DateTime        @default(now())

  @@index([challengeId])
}
```

### 3.4 Project / Team / Milestones (foundation, Phase 2 workflow)
```prisma
model Project {
  id             String       @id @default(cuid())
  challengeId    String       @unique
  challenge      Challenge    @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  title          String
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  ownerId        String
  owner          User         @relation(fields: [ownerId], references: [id], onDelete: Restrict)
  status         ProjectStatus @default(PROPOSAL)
  objectives     String?
  methodology    String?
  budget         Decimal?     @db.Decimal(12, 2)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  team        ProjectMember[]
  milestones  Milestone[]
  deliverables Deliverable[]
  proposals   Proposal[]
  collaborations IndustryCollaboration[]
  impactMetrics ImpactMetric[]
  documents   Document[]

  @@index([organizationId])
  @@index([status])
}
```

**ProjectMember** — team (students/faculty/mentors) via role-decorated membership
```prisma
model ProjectMember {
  id         String   @id @default(cuid())
  projectId  String
  project    Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Restrict)
  role       String   // STUDENT | FACULTY | MENTOR
  isLead     Boolean  @default(false)
  joinedAt   DateTime @default(now())

  @@unique([projectId, userId])
  @@index([userId])
}
```

**Milestone**
```prisma
model Milestone {
  id            String            @id @default(cuid())
  projectId     String
  project       Project           @relation(fields: [projectId], references: [id], onDelete: Cascade)
  name          String
  description   String?
  startDate     DateTime?
  dueDate       DateTime?
  status        MilestoneStatus   @default(NOT_STARTED)
  completionPct Int               @default(0)
  approval      MilestoneApproval @default(PENDING)
  reviewerId    String?
  reviewer      User?             @relation(fields: [reviewerId], references: [id], onDelete: SetNull)
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  deliverables Deliverable[]

  @@index([projectId])
}
```

**Deliverable**
```prisma
model Deliverable {
  id          String   @id @default(cuid())
  milestoneId String
  milestone   Milestone @relation(fields: [milestoneId], references: [id], onDelete: Cascade)
  name        String
  storageKey  String?
  status      MilestoneStatus @default(NOT_STARTED)
  createdAt   DateTime @default(now())
}
```

**Proposal**
```prisma
model Proposal {
  id          String   @id @default(cuid())
  challengeId String
  challenge   Challenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  projectId   String?
  project     Project? @relation(fields: [projectId], references: [id], onDelete: SetNull)
  submittedById String
  submittedBy User     @relation(fields: [submittedById], references: [id], onDelete: Restrict)
  title       String
  summary     String
  status      String   // DRAFT | SUBMITTED | APPROVED | REJECTED
  createdAt   DateTime @default(now())
}
```

**IndustryCollaboration**
```prisma
model IndustryCollaboration {
  id             String        @id @default(cuid())
  organizationId String
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  projectId      String
  project        Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  status         IndustryCollaborationStatus @default(INTERESTED)
  role           String[]      // MENTORSHIP | FUNDING | PROTOTYPING | DEPLOYMENT | TECHNOLOGY
  notes          String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@unique([organizationId, projectId])
  @@index([status])
}
```

### 3.5 Notifications & Documents & Audit

**Notification**
```prisma
model Notification {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      NotificationType
  title     String
  body      String
  link      String?
  readAt    DateTime?
  createdAt DateTime         @default(now())

  @@index([userId, readAt])
  @@index([createdAt])
}
```

**Document** — general attachment (e.g., challenge/docs); bytes behind StorageService
```prisma
model Document {
  id          String      @id @default(cuid())
  storageKey  String      @unique
  originalName String
  mimeType    String
  sizeBytes   Int
  visibility  Visibility  @default(PRIVATE)
  ownerId     String?
  owner       User?       @relation(fields: [ownerId], references: [id], onDelete: SetNull)
  challengeId String?
  challenge   Challenge?  @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  projectId   String?
  project     Project?    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  uploadedById String?
  uploadedBy  User?       @relation("Uploader", fields: [uploadedById], references: [id], onDelete: SetNull)
  createdAt   DateTime    @default(now())

  @@index([challengeId])
  @@index([projectId])
}
```

**AuditLog** — append-only
```prisma
model AuditLog {
  id          String   @id @default(cuid())
  userId      String?
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  action      String
  entityType  String
  entityId    String
  metadata    Json?
  createdAt   DateTime @default(now())

  @@index([entityType, entityId])
  @@index([userId])
}
```

**ImpactMetric**
```prisma
model ImpactMetric {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  key       String   // e.g., "people_served"
  value     Float
  unit      String?
  createdAt DateTime @default(now())
}
```

---

## 4. Relationship Map (summary)

```text
User 1─* Challenge
Challenge *─1 assignedOrganization? Organization   (challenge→assigned org)
Challenge 1─* ChallengeEvidence
Challenge 1─* ChallengeReview   (*─1 User)
Challenge 1─* ChallengeAssignment (*─1 Organization)
Challenge 1─* ChallengeStatusHistory
Challenge 1─1 Project            (challenge becomes project)
Project *─* User via ProjectMember
Project 1─* Milestone
Milestone 1─* Deliverable
Project *─* Organization via IndustryCollaboration
Project 1─* ImpactMetric
Project 1─* Proposal
Challenge 1─* Proposal
Organization 1─* UniversityDepartment / Faculty / Student
User 1─* Notification
User 1─* AuditLog
User 1─* Document
Challenge 1─* Document
Project 1─* Document
```

**Integrity rules:**
- `ChallengeEvId`, `Review`, `Assignment`, `StatusHistory`, `Evidence`, `Document.link` all cascade with their parent.
- `User` deletion is `Restrict` where a user "owns" an organization-linked record (preserve audit trail); `Cascade` for pure user-owned data (notifications).
- Every FK that is commonly filtered by has an index.

---

## 5. Indexing Rationale (query patterns)

- `Challenge.[status, district, primaryDomain, userId, assignedOrganizationId, createdAt]` → covers admin queue filtering, citizen "my challenges", and analytics grouping.
- `Notification.[userId, readAt]` → user notification inbox.
- `ChallengeAssignment.[challengeId, organizationId]` unique → one assignment record per pair.
- `ProjectMember.[projectId, userId]` unique → no duplicate team members.
- `Organization.slug` unique → clean references.

---

## 6. Migrations & Seeding

- **Prisma Migrate** is the migration workflow. Each increment produces a migration and applies it.
- **Seed**: `prisma/seed.ts` seeds clearly-marked development data (a demo admin, gov user, a couple of universities with capabilities, sample district/domains) so dashboards show **real** numbers derived from seeded rows. Seed only runs in dev/demo and is not invoked in production builds.
- Seed data is explicitly identified as seed (RULES.md §19).

---

## 7. Planned schema evolution (Phase 2+, non-breaking)

- Full project/milestone/deliverable management workflow.
- Industry collaboration workflow (interests, requests, active).
- Impact metric aggregation and reporting.
- Notification delivery channels (email/SMS/push via `NotificationChannel`).
- Possibly many-roles-per-user (join table) if required.
- These evolve columns/tables but keep the Phase 1 core stable.
