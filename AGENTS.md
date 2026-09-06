# AGENTS.md

## Project

You are working on the **Societal Innovation Collaboration Portal for Jharkhand**.

The platform connects citizens, communities, government bodies, Higher Education Institutions (HEIs), students, faculty, industry, startups, MSMEs, CSR organizations, research laboratories, and innovation ecosystems.

The goal is to convert real societal challenges into validated, institutionally matched, collaboratively developed, tested, and deployable solutions.

This is a real full-stack application. Do not treat it as a static UI exercise.

---

## Primary Engineering Objective

Build a maintainable TypeScript application that can evolve from a Phase 1 prototype into a production-scale platform.

Prioritize:

1. Correctness
2. Security
3. Maintainability
4. Clear architecture
5. Real database-backed functionality
6. Testability
7. Good UX
8. Extensibility

Do not optimize for number of files or visual complexity.

---

# 1. Before You Code

Always inspect the repository first.

Check:

```bash
git status
```

Then inspect:

- package.json
- existing source structure
- configuration
- database configuration
- Prisma schema/migrations
- authentication
- API/service architecture
- reusable UI components
- tests
- environment configuration
- existing documentation

Do not assume the repository is empty.

Do not replace working infrastructure without a technical reason.

If functionality already exists, understand it before changing it.

---

# 2. Technology Rules

Use TypeScript.

Expected stack:

- Next.js
- React
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma

Use the existing project's established framework/version when one already exists unless there is a compelling reason to change it.

Avoid unnecessary dependencies.

Before adding a dependency, determine whether the requirement can be handled cleanly using the existing stack.

---

# 3. Architecture

Prefer clear separation between:

```text
UI
↓
Server/API boundary
↓
Application/service layer
↓
Domain/business logic
↓
Data access
↓
PostgreSQL
```

Do not put significant business logic inside React components.

Do not make database calls from random UI components.

Keep external services behind abstractions.

Examples:

```text
AIClassificationService
StorageService
NotificationService
UniversityMatchingService
```

The implementation can change without forcing changes throughout the application.

---

# 4. Domain Model

The core platform revolves around:

```text
User
Organization
University
Faculty
Student
IndustryPartner
Challenge
ChallengeAssignment
ChallengeReview
Project
ProjectTeam
ProjectMember
Mentor
Milestone
Deliverable
Proposal
IndustryCollaboration
Notification
Document
AuditLog
ImpactMetric
```

Do not blindly create every entity as a separate database table.

Model actual relationships carefully.

Challenges are the central domain object.

A challenge may eventually become a project.

---

# 5. Challenge Lifecycle

Use controlled state transitions.

Conceptual lifecycle:

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

Do not allow arbitrary status changes from the client.

Status transitions must be validated on the server.

---

# 6. Roles

The application supports:

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

Authorization must happen server-side.

Never trust a role supplied by the browser.

Never assume hiding a button provides security.

---

# 7. Citizen UX

The citizen journey should be simple.

Primary action:

**Report a Community Problem**

Challenge submission should use a guided multi-step flow:

1. Problem
2. Location
3. Domain
4. Impact
5. Evidence
6. Review
7. Submission

Do not make citizens understand internal project-management terminology.

Use plain language for citizen-facing interfaces.

---

# 8. Admin UX

Administrators need operational visibility.

Provide:

- challenge queue
- filtering
- search
- domain filtering
- district filtering
- status filtering
- challenge review
- evidence inspection
- validation
- priority
- assignment
- review notes
- status history

Do not create dashboard metrics that are disconnected from database data.

---

# 9. University Matching

Never hardcode:

```text
Agriculture → University X
Healthcare → University Y
```

Instead create a matching service based on structured capabilities.

Possible matching factors:

- disciplines
- departments
- faculty expertise
- research areas
- labs
- innovation centres
- incubation capabilities
- technology capabilities
- location
- capacity
- previous experience

Phase 1 may use deterministic scoring.

Future AI/semantic matching must be able to replace it.

---

# 10. AI

AI is an enhancement, not a dependency.

The platform must function without an AI API key.

Create interfaces for:

- classification
- duplicate detection
- prioritization
- university recommendations
- summarization

Never pretend a mock implementation is real AI.

Clearly isolate development/mock implementations.

Do not spread provider-specific SDK calls throughout the application.

---

# 11. File Storage

Evidence can include:

- photographs
- videos
- documents

Store metadata in PostgreSQL.

Keep actual file storage behind a service abstraction.

Never expose private files without authorization.

Validate:

- MIME type
- extension
- size
- ownership
- access permissions

Do not trust client-provided MIME types alone for security-sensitive handling.

---

# 12. Database

Use PostgreSQL through Prisma.

Prefer:

- foreign keys
- indexes
- unique constraints
- timestamps
- normalized relationships
- explicit enums where appropriate

Think about query patterns before adding indexes.

Do not store relational collections as comma-separated strings.

Do not put repeated fields such as:

```text
student1
student2
student3
```

into the Project table.

Use relationships.

---

# 13. Validation

Validate all external input.

Validate:

- request bodies
- URL parameters
- query parameters
- file uploads
- dates
- enum values
- IDs
- ownership
- permissions

Use a consistent validation strategy.

Reject malformed input before business logic executes.

---

# 14. API

Keep API boundaries predictable.

A request should generally follow:

```text
request
↓
authentication
↓
authorization
↓
validation
↓
business logic
↓
database/service
↓
response
```

Do not skip authorization because the frontend already checked it.

Do not expose internal database errors directly to users.

Return useful error responses.

---

# 15. UI Components

Build reusable components instead of duplicating markup.

Examples:

- Button
- Input
- Select
- Dialog
- Modal
- Card
- Table
- Badge
- StatusBadge
- EmptyState
- ErrorState
- LoadingState
- FileUploader
- Timeline
- FilterBar

Do not create a new component abstraction for every tiny element.

Abstraction should follow actual reuse.

---

# 16. Responsive Design

The platform must work on:

- desktop
- tablet
- mobile

Citizen submission is particularly important on mobile.

Do not design desktop-only workflows and assume responsiveness will automatically work.

---

# 17. Accessibility

Use semantic HTML.

Support:

- keyboard navigation
- visible focus
- appropriate labels
- accessible forms
- sufficient interaction targets
- meaningful error messages
- screen-reader-friendly structure where appropriate

Do not rely only on color to communicate state.

---

# 18. Error Handling

Every major asynchronous UI state needs:

- loading
- success
- empty
- error

Backend errors must be handled deliberately.

Do not silently swallow exceptions.

Do not leave console errors unresolved.

---

# 19. Testing

Test business-critical behavior rather than chasing arbitrary coverage numbers.

Prioritize:

- authentication
- authorization
- ownership
- challenge creation
- validation
- status transitions
- assignment
- project creation
- important database constraints
- critical service logic

Run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Use the project's actual scripts if they differ.

Fix failures before continuing.

---

# 20. Documentation

Keep these documents accurate:

```text
README.md
PROJECT_PLAN.md
ARCHITECTURE.md
DATABASE.md
API.md
```

Update documentation when architecture changes.

Do not write documentation describing functionality that does not exist.

---

# 21. Git

Before major work:

```bash
git status
```

Use logical commits.

Prefer checkpoints such as:

```text
initial-project-setup
database-foundation
auth-rbac
citizen-challenge-flow
admin-review-flow
ai-abstraction
phase-1-complete
```

Do not reset, force-push, or delete existing history unless explicitly instructed.

---

# 22. Working Style

Work in small coherent increments.

For each feature:

1. Understand the requirement.
2. Inspect affected code.
3. Plan the smallest sound change.
4. Implement.
5. Typecheck.
6. Test.
7. Review.
8. Commit/checkpoint if appropriate.

Do not create huge speculative architectures for features that do not exist yet.

Do not prematurely optimize.

Do not prematurely introduce microservices.

This should remain a coherent application unless scale or deployment requirements later justify separation.

---

# 23. When Something Is Ambiguous

Use the existing architecture and product requirements to make reasonable decisions.

Ask the user only when:

- the decision is destructive
- requirements genuinely conflict
- security/privacy implications are significant
- multiple incompatible architectural directions exist
- the required information cannot be inferred safely

Do not stop for trivial implementation decisions.

---

# 24. Definition of Quality

Before considering work complete, ask:

- Does it actually work?
- Is the data persisted correctly?
- Can unauthorized users bypass it?
- What happens on invalid input?
- What happens when data is empty?
- What happens when a service fails?
- Does mobile work?
- Does TypeScript pass?
- Does the build pass?
- Are tests meaningful?
- Is the implementation consistent with the existing architecture?
- Did I introduce unnecessary complexity?

If the answer to any critical question is no, the feature is not finished.

---

# 25. Project Priority

When forced to choose between:

```text
visual polish
vs
correct architecture
```

choose correct architecture.

When forced to choose between:

```text
more features
vs
working features
```

choose working features.

When forced to choose between:

```text
AI demo
vs
reliable core workflow
```

choose the reliable core workflow.

The platform's core value is:

```text
Problem
→ Validation
→ Matching
→ Collaboration
→ Solution
→ Impact
```

Everything else supports that flow.
