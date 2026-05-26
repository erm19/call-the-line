---
name: project-call-the-line
description: React Native tennis line-call app — current phase, database setup, and implementation state
metadata:
  type: project
---

Phase 1 (Core Session Flow) is in progress. Tasks 1.0a, 1.0b, 1.0c are complete and committed on branch `feat/db-foundation`.

**Why:** These tasks establish the DB foundation that all subsequent data-layer tasks depend on (Wave 1 in the parallel worktree strategy).

**How to apply:** Next tasks are 1.1 + 1.2 + 1.3 + 1.13 (session use cases, on branch `feat/session-use-cases`). The db-foundation branch must be merged first before 1.4/1.5/1.14/1.15 can begin.

Key decisions made:
- Storage: expo-sqlite v56 + drizzle-orm (replaced AsyncStorage)
- DB client singleton registered as `DB_CLIENT` token in tsyringe DI container at `src/data/db/client.ts`
- Drizzle schema at `src/data/db/schema.ts`; initial migration at `src/data/db/migrations/`
- `expo-modules-core/babel` plugin removed in v56 — no babel change needed
- `transformIgnorePatterns` in jest.config.js extended to include `expo-sqlite|expo-modules-core|expo`
- All 9 use cases were importing concrete repository names (e.g. `SessionRepository`) instead of interfaces (`ISessionRepository`) — fixed in 1.0a
