# Societal Innovation Collaboration Portal — OpenCode Build Prompt

You are the lead full-stack engineer building a production-quality prototype of a **Societal Innovation Collaboration Portal for Jharkhand**.

Your job is to build a real, maintainable full-stack application — not a static mockup or collection of disconnected demo pages.

---

## 1. PRODUCT VISION

Build a platform that connects:

**Citizens / Communities**
→ submit real-world societal challenges

**Government / Local Bodies**
→ validate, prioritize, monitor, and coordinate challenges

**Higher Education Institutions (HEIs)**
→ evaluate challenges, form multidisciplinary teams, and develop solutions

**Industry / Startups / MSMEs / CSR / Research Labs**
→ provide mentorship, funding, prototyping, technology, testing, and deployment support

The platform should transform community problems into structured innovation projects with measurable social impact.

The architecture must be suitable for eventual statewide deployment across Jharkhand.

---

# 2. CORE USER ROLES

Support role-based access control for:

- CITIZEN
- GOVERNMENT
- ADMIN
- UNIVERSITY_ADMIN
- FACULTY
- STUDENT
- INDUSTRY
- MENTOR

### Citizen
- Register/login
- Submit societal challenges
- Upload photos/videos/documents
- Provide geographic location
- Track submitted challenges
- View challenge status
- Receive notifications
- Participate in relevant communication

### Government / Administrator
- View challenges
- Validate/reject challenges
- Categorize and prioritize challenges
- Assign challenges to institutions
- Monitor projects
- View district/domain analytics
- Monitor institutional and industry participation

### University / HEI
- Manage institution profile
- Manage departments
- Manage faculty/research expertise
- Review assigned challenges
- Accept/reject challenges
- Form multidisciplinary teams
- Assign faculty mentors
- Create solution proposals/projects
- Track milestones
- Submit documentation and outcomes

### Faculty / Mentor
- View assigned projects
- Mentor student teams
- Review deliverables
- Provide feedback
- Track project progress

### Student
- Join project teams
- View assigned tasks
- Upload deliverables
- Participate in project development
- Track milestones

### Industry / Startup / MSME / CSR
- Create organization profile
- Define expertise/capabilities
- Discover suitable challenges/projects
- Express interest
- Offer mentorship
- Offer funding
- Offer technology/prototyping
- Participate in pilots and deployment

---

# 3. CORE CHALLENGE LIFECYCLE

The intended workflow is:

Citizen submits challenge
        ↓
System structures submission
        ↓
AI classification / prioritization / duplicate detection
        ↓
Government/Admin validation
        ↓
University matching
        ↓
HEI accepts challenge
        ↓
Multidisciplinary team created
        ↓
Faculty mentor assigned
        ↓
Solution proposal
        ↓
Industry partner discovery
        ↓
Mentorship / funding / prototyping
        ↓
Pilot implementation
        ↓
Validation
        ↓
Deployment
        ↓
Impact measurement
        ↓
Resolved / archived

Do not make AI a hard dependency for basic platform operation.

The platform must remain functional if no AI API key is configured.

---

# 4. TECHNOLOGY STACK

Use TypeScript throughout.

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Responsive design

### Backend
Use a clean TypeScript backend architecture.

Prefer Next.js server-side APIs/server actions where appropriate unless a separate backend provides a clear architectural advantage.

### Database
- PostgreSQL
- Prisma ORM

### Authentication
Implement proper authentication and server-side role-based authorization.

Do not rely on frontend route hiding for security.

### Storage
Create a storage abstraction supporting future:
- local development storage
- S3-compatible storage
- cloud storage

Do not tightly couple the application to one provider.

### AI
Create an AI provider abstraction supporting future:
- classification
- prioritization
- duplicate detection
- university matching
- summarization
- recommendations

For Phase 1, use a deterministic/mock implementation behind the abstraction. Do not hardcode an AI vendor throughout the application.

---

# 5. CHALLENGE DOMAINS

Support at least:

- Education
- Healthcare
- Agriculture
- Water Resources
- Sanitation
- Environment
- Energy
- Urban Development
- Accessibility
- Public Administration
- Rural Livelihoods
- Transportation
- Digital Services
- Disaster Management
- Other

Challenges must support:
- primary domain
- secondary domains
- tags

A challenge may be multidisciplinary.

---

# 6. CHALLENGE DATA MODEL

A Challenge should eventually support:

- ID
- title
- description
- structured problem statement
- submitter
- submitter type
- district
- block
- village/ward
- latitude
- longitude
- primary category
- secondary categories
- tags
- urgency
- affected population
- geographic scope
- evidence
- photos
- videos
- documents
- current status
- priority
- AI classification metadata
- duplicate/similarity metadata
- assigned institution
- created timestamp
- updated timestamp

Statuses:

- DRAFT
- SUBMITTED
- UNDER_REVIEW
- VALIDATION_REQUIRED
- VALIDATED
- REJECTED
- MATCHING
- ASSIGNED
- ACCEPTED
- IN_PROGRESS
- PILOT
- VALIDATION
- IMPLEMENTED
- RESOLVED
- ARCHIVED

Use database constraints and a controlled status-transition service where appropriate.

---

# 7. UNIVERSITY MATCHING

Design the data model so institutions can have:

- disciplines
- departments
- faculty expertise
- research areas
- laboratories
- innovation centres
- incubation centres
- technology capabilities
- geographic relevance
- previous projects
- mentor availability

Eventually match institutions using factors such as:

1. Academic expertise
2. Faculty expertise
3. Research similarity
4. Institutional capabilities
5. Innovation/incubation capabilities
6. Geographic relevance
7. Capacity/workload
8. Previous experience

Phase 1 may use deterministic scoring.

Do not implement:
`if agriculture then university X`

Instead, create a matching service with a clear interface so a future AI/semantic matching implementation can replace the initial algorithm without changing the rest of the system.

---

# 8. PROJECT MANAGEMENT

Projects derived from challenges should support:

- project title
- linked challenge
- institution
- project owner
- faculty mentor
- student team
- industry partners
- objectives
- methodology
- milestones
- deliverables
- deadlines
- progress
- risks
- budget
- funding
- documents
- testing results
- pilot information
- deployment status
- impact metrics
- IP information

Milestones need:

- name
- description
- start date
- due date
- status
- completion percentage
- deliverables
- reviewer
- approval state

---

# 9. INDUSTRY COLLABORATION

Organizations should support:

- organization name
- organization type
- sectors
- expertise
- technologies
- location
- funding capabilities
- mentorship capabilities
- prototyping capabilities
- deployment capabilities

Collaboration lifecycle:

- INTERESTED
- REQUESTED
- ACCEPTED
- REJECTED
- ACTIVE
- COMPLETED

---

# 10. NOTIFICATIONS

Create an internal notification system supporting:

- challenge status changes
- challenge assignment
- project invitations
- milestone reminders
- proposal approvals
- mentor feedback
- industry collaboration requests
- administrative actions

Keep email/SMS/push providers abstracted for future integration.

---

# 11. ANALYTICS

### Government dashboard
Show real database-derived metrics for:

- total challenges
- challenges by district
- challenges by domain
- validation rate
- university participation
- industry participation
- active projects
- completed projects
- implementation rate
- measurable impact

### University dashboard
- assigned challenges
- active projects
- completed projects
- student participation
- faculty participation
- industry collaborations
- project success rate

### Industry dashboard
- supported projects
- mentorship
- funding
- pilots
- technologies deployed

Never hardcode fake statistics in actual dashboard logic.

---

# 12. UI/UX

The product should feel like a serious government/innovation platform.

Principles:

- professional
- trustworthy
- accessible
- responsive
- clean
- data-driven
- minimal unnecessary decoration

### Citizen experience

The primary CTA is:

**Report a Community Problem**

The submission experience should be a guided multi-step form rather than one overwhelming form.

Steps:

1. Problem title + description
2. Location
3. Domain/category
4. Affected people/community
5. Photos/videos/documents
6. Review and submit

After submission display:

- challenge ID
- status
- submission date
- next steps

Create:

- landing page
- citizen dashboard
- challenge submission
- challenge list
- challenge detail
- status timeline

### Admin experience

Create:

- admin dashboard
- challenge queue
- filters
- challenge detail/review
- validation controls
- priority controls
- university assignment
- review notes

Build reusable components for:

- navigation
- cards
- tables
- badges
- status indicators
- forms
- dialogs
- charts
- filters
- uploads
- location fields
- timelines
- milestone tracking

Handle loading, empty, error, and success states properly.

---

# 13. DATABASE DESIGN

Use a normalized PostgreSQL schema.

Core entities should include, where appropriate:

- User
- Role
- Organization
- GovernmentDepartment
- University
- UniversityDepartment
- Faculty
- Student
- IndustryPartner
- Challenge
- ChallengeEvidence
- ChallengeCategory
- ChallengeTag
- ChallengeAssignment
- ChallengeReview
- Project
- ProjectTeam
- ProjectMember
- Mentor
- Milestone
- Deliverable
- Proposal
- IndustryCollaboration
- Notification
- Comment
- Document
- AuditLog
- ImpactMetric

Do not blindly create every entity as a separate table if the actual relational model can be cleaner.

Use:
- primary keys
- foreign keys
- indexes
- unique constraints
- timestamps
- appropriate cascading behavior

Use Prisma migrations.

---

# 14. API / SERVICE DESIGN

Create clean service boundaries.

Expected capabilities include:

- create/list/get/update challenges
- submit/review/validate challenges
- assign challenges
- list/get universities
- calculate university matches
- create/get/update projects
- manage project members
- manage milestones
- submit proposals
- manage industry interest
- notifications
- dashboard metrics

REST-style routes are acceptable, for example:

POST /api/challenges
GET /api/challenges
GET /api/challenges/:id
PATCH /api/challenges/:id

POST /api/challenges/:id/review
POST /api/challenges/:id/assign

GET /api/universities
GET /api/universities/:id

POST /api/projects
GET /api/projects/:id
PATCH /api/projects/:id

POST /api/projects/:id/milestones

POST /api/industry/interests

GET /api/dashboard/overview

Do not force these exact routes if the chosen Next.js architecture has a cleaner equivalent.

---

# 15. SECURITY

Security is a first-class requirement.

Implement:

- server-side authentication
- server-side authorization
- RBAC
- input validation
- secure file upload handling
- file type restrictions
- file size restrictions
- access control for private documents
- secure environment variables
- database constraints
- audit logging

Never expose secrets in client-side code.

Never trust:
- client-supplied roles
- client-supplied ownership
- client-supplied permissions
- client-supplied status transitions

Validate all important business rules on the server.

---

# 16. AI ARCHITECTURE

Create an interface/service abstraction similar to:

AIClassificationService

Capabilities:

- classifyChallenge()
- detectDuplicates()
- prioritizeChallenge()
- recommendUniversities()
- summarizeChallenge()

Phase 1 implementation:

- deterministic mock/provider
- realistic service interfaces
- no mandatory external API
- no fake claims that an LLM performed classification

Future AI providers must be replaceable through configuration/environment variables.

The eventual system should be capable of accepting an API key later without restructuring the application.

---

# 17. GEOLOCATION

Support:

- district
- block
- village/ward
- optional latitude
- optional longitude

Do not require a paid maps API for Phase 1.

Create a provider abstraction for future map integration.

---

# 18. PHASE 1 — BUILD ONLY THIS FIRST

Do not attempt to build the entire product immediately.

Phase 1 consists of:

1. Project setup
2. TypeScript configuration
3. Next.js setup
4. Tailwind setup
5. PostgreSQL connection
6. Prisma setup
7. Initial database schema
8. Authentication foundation
9. RBAC foundation
10. Application layout
11. Landing page
12. Citizen dashboard
13. Citizen challenge submission flow
14. Challenge listing
15. Challenge detail
16. Admin dashboard
17. Admin challenge review
18. Challenge status workflow
19. File upload abstraction
20. AI service abstraction
21. Notification abstraction
22. Basic real dashboard metrics
23. Development seed data
24. Critical backend tests
25. Documentation

Do not implement advanced project management, industry collaboration, or sophisticated AI in Phase 1 beyond the foundations required to support later phases.

---

# 19. TESTING

Create automated tests for critical business logic, including:

- authentication
- authorization
- challenge creation
- challenge ownership
- challenge validation
- status transitions
- university assignment
- project creation where implemented
- database constraints

At minimum:

- typecheck
- lint
- build
- relevant automated tests

must pass before declaring Phase 1 complete.

---

# 20. DOCUMENTATION

Maintain:

`README.md`
`PROJECT_PLAN.md`
`ARCHITECTURE.md`
`DATABASE.md`
`API.md`

Document:

- setup
- prerequisites
- environment variables
- PostgreSQL configuration
- migrations
- seeding
- development commands
- architecture
- important decisions
- AI integration points
- storage integration points
- future deployment considerations

---

# 21. GIT WORKFLOW

Before changing anything:

```bash
git status
```

Inspect the existing repository.

Do not destroy existing work.

Use logical commits/checkpoints such as:

- `initial-project-setup`
- `database-foundation`
- `auth-rbac`
- `citizen-challenge-flow`
- `admin-review-flow`
- `ai-abstraction`
- `notifications`
- `phase-1-complete`

If an existing codebase is present, preserve its history and reuse working infrastructure.

---

# 22. DEVELOPMENT RULES

Strictly follow these:

### DO

- Inspect before modifying.
- Reuse existing working code.
- Keep TypeScript strict.
- Prefer small, composable modules.
- Validate data at system boundaries.
- Keep business logic out of UI components.
- Use server-side authorization.
- Keep external providers behind interfaces.
- Use real database queries for actual features.
- Write tests for critical logic.
- Run checks frequently.
- Fix errors before continuing.
- Keep commits logical.

### DO NOT

- Build fake static functionality.
- Hardcode production dashboard numbers.
- Hardcode university matching rules.
- Put secrets in source code.
- Trust frontend authorization.
- Put everything in one giant component.
- Create unnecessary dependencies.
- Rewrite working infrastructure without justification.
- Add AI just for the sake of saying "AI".
- Claim a feature works when it has not been tested.

---

# 23. EXECUTION PROCESS

## STEP 1 — INSPECT

Before coding, inspect the repository thoroughly.

Report:

1. Existing project structure
2. Existing framework
3. Existing dependencies
4. Existing database setup
5. Existing authentication
6. Existing API architecture
7. Existing UI/component system
8. Existing reusable functionality
9. Existing tests
10. What can be reused
11. What must be changed
12. Architectural risks

Do not start by deleting or rewriting the existing application.

---

## STEP 2 — PLAN

Create/update:

- PROJECT_PLAN.md
- ARCHITECTURE.md
- DATABASE.md
- API.md

The plan must describe the actual repository, not a generic template.

---

## STEP 3 — IMPLEMENT FOUNDATION

Implement Phase 1 incrementally.

After each major subsystem:

1. Run type checking.
2. Run linting.
3. Run relevant tests.
4. Verify migrations.
5. Verify the application starts.
6. Fix failures.
7. Continue.

---

## STEP 4 — VERIFY END-TO-END

Before declaring Phase 1 complete, verify this complete flow:

Citizen
→ registers/logs in
→ submits challenge
→ challenge is stored in PostgreSQL
→ challenge appears in citizen dashboard
→ admin can see it
→ admin can review it
→ admin can change its status
→ citizen can see the updated status

Verify authorization as well:

- Citizen A cannot access Citizen B's private challenge data.
- Citizen cannot perform admin actions.
- Unauthorized users cannot access private documents.
- Server rejects invalid ownership/role claims.

---

# 24. DEFINITION OF DONE

Phase 1 is complete only when:

- application starts successfully
- database connects successfully
- migrations work
- authentication works
- RBAC works
- citizen can submit a real challenge
- data persists in PostgreSQL
- evidence metadata is stored
- admin can review challenges
- status transitions work
- dashboards use real database data
- AI abstraction exists
- storage abstraction exists
- notification abstraction exists
- critical tests pass
- typecheck passes
- lint passes
- production build passes
- documentation exists

Do not mark incomplete features as complete.

---

# 25. FINAL REPORT

When Phase 1 is finished, provide:

### Files created
List them.

### Files modified
List them.

### Database changes
Explain schema/migration changes.

### APIs/services
List them.

### Features completed
List them.

### Tests
List exactly what was tested and the result.

### Commands
Give exact commands to:
- install
- configure
- migrate
- seed
- run development server
- run tests
- typecheck
- lint
- build

### Known issues
Be honest.

### Recommended Phase 2
Give a concise technical plan for the next phase.

---

# FINAL INSTRUCTION

START WITH REPOSITORY INSPECTION.

Do not immediately generate hundreds of files.

Do not ask unnecessary questions whose answers can be determined by inspecting the repository.

Make reasonable engineering decisions and document them.

If an important decision genuinely cannot be determined from the repository, stop and ask one focused question.

Otherwise proceed autonomously.

Build Phase 1 completely, test it, and leave the repository in a clean, working state.
