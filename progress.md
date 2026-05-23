# Call The Line — Session Progress Log

Resume instructions:
> "Read progress.md and plan.md, then continue from where we left off"

End-of-session instructions:
> "Update progress.md with what was done and what's next"

---

## Current Status

**Phase:** Phase 1 (Core Session Flow) — task 1.0a complete

**Next task:** `1.0b` — Define Drizzle schema (`src/data/db/schema.ts`)

---

## Session Log

### Session 1 — 2026-05-23

**Done:**
- Read and analyzed FOUNDATIONS.md and ARCHITECTURE.md
- Audited all scaffolded files under `src/`
- Created `CLAUDE.md` with full project context and coding rules
- Created `plan.md` with atomic task breakdown across 7 phases
- Created `progress.md` (this file)

**Key decisions:**
- Scaffold is complete; Phase 0 marked fully done in plan.md
- Implementation begins with Phase 1 (session CRUD) to establish the vertical slice pattern before touching camera or NRT
- No features are implemented yet — all use cases, repositories, and screens are empty shells

**Blockers / open questions:**
- AI backend API contract (`/v1/detect-out`) not yet defined — Phase 4 begins with defining this
- NRT inference approach (on-device TFLite vs edge API) undecided — Phase 5 starts with a flag and stub, decision deferred

**Next session start point:**
> Phase 1, task 1.1: Open `src/domain/useCases/StartSession.ts` and implement the use case body. Then 1.2, 1.3 in sequence. After use cases pass tests, move to 1.4 (AsyncStorage implementation).

---

### Session 2 — 2026-05-24

**Done:**
- Task 1.0a: Installed `expo-sqlite` (v56), `expo-modules-core` (v56), `drizzle-orm`, `drizzle-kit`; created `drizzle.config.ts`; removed `@react-native-async-storage/async-storage`
- Replaced all 4 local data source stubs (`SessionLocalDataSource`, `ClipLocalDataSource`, `CalibrationLocalDataSource`, `NRTConfigLocalDataSource`) with Drizzle-ready stubs (no AsyncStorage)
- Fixed pre-existing scaffold type errors: all 9 use cases were importing `SessionRepository`/`ClipRepository`/`NRTConfigRepository` instead of the correct `ISessionRepository`/`IClipRepository`/`INRTConfigRepository` interface names
- Fixed pre-existing ESLint errors: added `eslint-plugin-jest` as direct dep (was only nested in `@react-native/eslint-config`), added `jest` to plugins in `.eslintrc.js`, added CJS config file override for `no-var-requires`, ran `npm run format` to fix prettier issues across scaffold

**Key decisions:**
- `expo-modules-core/babel` plugin was removed in v56 — no babel change needed for JSI (it's native-level)
- `transformIgnorePatterns` in `jest.config.js` extended to include `expo-sqlite|expo-modules-core|expo`
- `drizzle.config.ts` uses `dialect: 'sqlite', driver: 'expo'` for expo-sqlite compatibility

**Blockers / open questions:**
- Native iOS/Android dirs don't exist yet — `pod install` for expo-sqlite native bindings will be needed when native setup begins
- `baseline-browser-mapping` package is outdated (cosmetic warning only, not blocking)

**Next session start point:**
> Phase 1, task 1.0b: Create `src/data/db/schema.ts` with Drizzle table definitions for `sessions`, `clips`, `calibrations`, `aiResults`, `nrtConfigs`.

---

<!-- Template for future sessions:

### Session N — YYYY-MM-DD

**Done:**
- 

**Key decisions:**
- 

**Blockers / open questions:**
- 

**Next session start point:**
> 

-->
