# RULES.md

# NON-NEGOTIABLE ENGINEERING RULES

These rules apply to every change made to this repository.

If another instruction conflicts with a rule below, stop and resolve the conflict before proceeding.

---

## 1. DO NOT DESTROY WORK

Never:

- delete working features without justification
- overwrite unrelated files
- reset the repository
- force-push
- remove Git history
- replace the project with a fresh scaffold

unless explicitly instructed to do so.

Before significant work:

```bash
git status
```

---

## 2. DO NOT FAKE FUNCTIONALITY

Do not create functionality that only looks real.

Forbidden examples:

- hardcoded challenge counts
- fake API responses presented as real
- fake successful database writes
- fake authentication
- fake authorization
- fake AI results presented as actual AI
- fake project progress
- fake analytics

Development mocks are allowed only when explicitly isolated and clearly identifiable.

---

## 3. SERVER-SIDE SECURITY IS MANDATORY

Never rely on:

- hidden buttons
- disabled UI controls
- frontend route guards
- client-side role checks

for security.

Every protected operation must verify authorization on the server.

The server must determine:

- who the user is
- what role they have
- what resource they own
- what action they are allowed to perform

---

## 4. NEVER TRUST CLIENT DATA

Treat all browser input as untrusted.

This includes:

- IDs
- roles
- ownership
- status
- permissions
- prices/budgets
- organization IDs
- university IDs
- uploaded filenames
- file MIME types

Validate and authorize server-side.

---

## 5. NO SECRETS IN SOURCE CODE

Never commit:

- API keys
- passwords
- tokens
- private credentials
- database passwords
- OAuth secrets

Use environment variables.

Never expose server-only secrets to client-side code.

---

## 6. NO `ANY` BY DEFAULT

TypeScript must remain strongly typed.

Do not use:

```typescript
any
```

to silence type errors.

If an `any` is genuinely unavoidable:

1. minimize its scope
2. document why
3. narrow it immediately

Prefer proper types, generics, unknown, type guards, or validation.

---

## 7. NO GIANT COMPONENTS

Do not build one giant:

```text
page.tsx
```

containing the entire application logic.

Separate:

- UI
- data fetching
- business logic
- validation
- services
- database access

Components should have clear responsibilities.

---

## 8. NO BUSINESS LOGIC IN PRESENTATIONAL UI

Do not bury important rules inside JSX.

Examples of business logic that belongs outside presentation:

- challenge status transitions
- permissions
- university matching
- ownership checks
- project eligibility
- workflow validation

UI should consume domain/application services.

---

## 9. NO DIRECT DATABASE ACCESS EVERYWHERE

Do not scatter Prisma queries throughout unrelated components and handlers.

Centralize meaningful data access and business logic.

A reasonable structure is:

```text
route/server action
↓
service
↓
repository/data access
↓
Prisma
```

Use the project's existing architecture when it already has a sound equivalent.

---

## 10. DATABASE INTEGRITY MATTERS

Do not rely entirely on application code for relational integrity.

Use:

- foreign keys
- unique constraints
- indexes
- enums/validated values where appropriate
- transactions when multiple related writes must succeed together

Never store repeated relational data in fields such as:

```text
student1
student2
student3
```

Use proper relationships.

---

## 11. STATUS TRANSITIONS MUST BE CONTROLLED

Do not allow:

```text
client says status = RESOLVED
```

to directly update the database.

Validate whether the current user is allowed to perform that transition and whether the transition itself is valid.

---

## 12. AI MUST BE OPTIONAL

The application must work without an AI API key.

Never make basic challenge submission depend on an external AI provider.

AI functionality must sit behind replaceable interfaces.

Example:

```text
AIClassificationService
```

The provider can later become:

```text
OpenAI
Gemini
Kimi
Local model
Other provider
```

without rewriting the domain layer.

---

## 13. DO NOT HARD-CODE UNIVERSITY MATCHING

Never implement:

```typescript
if (category === "AGRICULTURE") {
    return "some-university";
}
```

as the real matching architecture.

Use structured institutional capabilities and a matching service.

The algorithm can start simple.

The architecture must be extensible.

---

## 14. FILE UPLOADS REQUIRE SECURITY

Never assume uploaded files are safe.

Validate:

- size
- allowed file types
- extension
- ownership
- access permissions

Private files must not become publicly accessible accidentally.

Do not expose storage credentials to the browser.

---

## 15. ERROR HANDLING IS REQUIRED

Never silently swallow errors.

Bad:

```typescript
try {
  await doSomething();
} catch {}
```

Errors must either be:

- handled
- logged appropriately
- returned as a controlled response
- propagated to a higher-level handler

Do not expose sensitive internal errors to end users.

---

## 16. NO UNNECESSARY DEPENDENCIES

Before installing a package ask:

1. Do we already have something that solves this?
2. Is the dependency maintained?
3. Is the dependency actually necessary?
4. Does it materially simplify the implementation?

Do not install libraries just because they are popular.

---

## 17. NO PREMATURE MICROSERVICES

Keep the initial system coherent.

Do not split the project into:

```text
auth-service
challenge-service
ai-service
university-service
notification-service
```

just because the architecture diagram looks impressive.

Use modular boundaries inside the application first.

Separate services only when there is an actual operational reason.

---

## 18. NO PREMATURE OPTIMIZATION

Do not optimize code based on assumptions.

First make it:

1. correct
2. measurable
3. maintainable

Then optimize identified bottlenecks.

---

## 19. NO FAKE ANALYTICS

Dashboard metrics must come from real database data.

Do not write:

```text
2,431 challenges
87 universities
94% completion
```

unless those numbers are actually generated from the underlying data.

Seed data is acceptable for development/demo environments if clearly identified.

---

## 20. VALIDATE AT SYSTEM BOUNDARIES

External data entering the system must be validated.

This includes:

```text
HTTP requests
URL parameters
query strings
forms
uploads
webhooks
external AI responses
external APIs
```

Never assume external AI output is valid simply because it returned JSON.

---

## 21. AI OUTPUT IS UNTRUSTED DATA

Treat AI responses like any other external input.

Validate:

- category
- priority
- confidence
- IDs
- recommendations
- structured fields

AI must never directly bypass business rules.

AI can recommend.

The application decides.

---

## 22. USE TRANSACTIONS WHEN REQUIRED

If an operation requires several database changes that must succeed together, use a transaction.

Example:

```text
Create project
+
Create project team
+
Create initial milestone
```

Do not leave the database partially updated if the operation logically requires atomicity.

---

## 23. NO SILENT FALLBACKS

Do not silently change behavior when something fails.

Bad:

```text
AI fails
→ pretend classification succeeded
```

Better:

```text
AI unavailable
→ continue with explicit "classification pending"
```

The system should represent its actual state.

---

## 24. NO DEAD CODE

Do not leave:

- unused imports
- abandoned components
- duplicate services
- commented-out implementations
- unused environment variables
- obsolete routes

Clean up after refactors.

---

## 25. DOCUMENT ARCHITECTURAL DECISIONS

If you make a significant architectural decision, record it in the appropriate documentation.

Especially:

- database modeling decisions
- authentication approach
- storage strategy
- AI abstraction
- university matching
- notification architecture
- major dependency choices

---

## 26. TEST BUSINESS RULES

Tests should prove important behavior.

At minimum protect:

- authorization
- ownership
- challenge creation
- validation
- status transitions
- assignment
- critical database constraints

A test that only checks that a page renders is not sufficient for core business logic.

---

## 27. RUN QUALITY CHECKS

Before declaring meaningful work complete, run the project's available checks.

Typically:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

If one of these scripts does not exist, use the project's actual equivalent.

Do not claim success if checks fail.

---

## 28. KEEP CHANGES FOCUSED

Do not modify unrelated files while implementing a feature.

If unrelated cleanup is discovered:

- document it
- defer it
- or make it a separate change

Avoid massive noisy diffs.

---

## 29. DO NOT CHANGE ARCHITECTURE WITHOUT REASON

Before replacing an existing implementation, answer:

- What is wrong with the current implementation?
- What specific problem does the new architecture solve?
- What migration cost does it introduce?
- What existing functionality could break?

If there is no compelling reason, preserve the existing implementation.

---

## 30. DEFINITION OF DONE

A feature is not done merely because:

- the page exists
- TypeScript compiles
- the button exists
- the UI looks good

A feature is done when its intended behavior works end-to-end.

For example:

```text
Citizen submits challenge
↓
Server authenticates user
↓
Server validates input
↓
Server authorizes operation
↓
PostgreSQL persists challenge
↓
Challenge appears in dashboard
↓
Admin can review it
↓
Admin can perform permitted transition
↓
Citizen sees actual updated state
```

That is the standard.

---

# FINAL RULE

When uncertain, prefer:

**simple + explicit + testable + secure**

over:

**clever + complicated + impressive-looking + fragile**
