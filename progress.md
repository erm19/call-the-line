# Call The Line — Session Progress Log

Resume instructions:
> "Read progress.md and plan.md, then continue from where we left off"

End-of-session instructions:
> "Update progress.md with what was done and what's next"

---

## Current Status

**Phase:** Phase 1–2 — Wave 2 complete; 26 tasks done

**Next task:** Wave 3 — merge all Wave 2 branches into main, then run `/implement-task wave` again

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

### Session 3 — 2026-05-24

**Wave:** Wave 1 — branches: feat/db-foundation, feat/session-use-cases, feat/platform-services, feat/standalone-ui

**Done:**
- Task 1.0b: Drizzle schema defined — 5 tables (sessions, clips, calibrations, ai_results, nrt_configs) with FK relations (branch: feat/db-foundation)
- Task 1.0c: Initial migration generated, `db` client singleton created, `DB_CLIENT` token registered in DI container (branch: feat/db-foundation)
- Task 1.1: StartSession use case body implemented — already present in scaffold, verified correct (branch: feat/session-use-cases)
- Task 1.2: EndSession use case body implemented — already present in scaffold, verified correct (branch: feat/session-use-cases)
- Task 1.3: GetSessions use case body implemented — already present in scaffold, verified correct (branch: feat/session-use-cases)
- Task 1.12: i18n keys for all session UI strings added to en.json (branch: feat/standalone-ui)
- Task 1.13: Unit tests for StartSession, EndSession, GetSessions — 19 tests passing (branch: feat/session-use-cases)
- Task 2.1: PermissionService implemented using react-native-vision-camera static Camera methods (branch: feat/platform-services)
- Task 2.3: FileStorageService implemented using RNFS/react-native file APIs (branch: feat/platform-services)
- Task 2.9: PermissionDeniedScreen created with "Open Settings" deep link, wired into navigator (branch: feat/platform-services)
- Task 2.11: VideoPlayer component created (placeholder — react-native-video not in deps) (branch: feat/standalone-ui)
- Task 2.12: i18n keys for camera UI strings added (branch: feat/standalone-ui)
- Task 3.4: CourtOverlay component created — View-based (react-native-svg not in deps), supports tap-to-calibrate (branch: feat/standalone-ui)
- Task 3.8: i18n keys for calibration UI added (branch: feat/standalone-ui)
- Task 4.1: API contract documented at docs/api-contract.md (branch: feat/standalone-ui)

**Key decisions:**
- Schema uses INTEGER for timestamps (Unix epoch ms) matching migration — not TEXT ISO strings
- react-native-svg not in deps → CourtOverlay uses absolute-positioned Views; react-native-video not in deps → VideoPlayer is a placeholder
- Use cases 1.1–1.3 were already fully implemented in the scaffold; task 1.13 added the missing unit tests
- PermissionService registration uses `DI_TOKENS` (not `TOKENS`) — that's the actual name in container.ts
- DB schema kept simple (no domain entity imports) to avoid data layer → domain coupling

**Blockers / open questions:**
- react-native-svg and react-native-video not installed — CourtOverlay and VideoPlayer are stubs; install when Phase 2/3 UI work begins
- Native iOS/Android dirs still not set up — expo-sqlite needs pod install before running on device

**Next session start point:**
> Merge all Wave 1 branches into main, then run `/implement-task wave` for Wave 2.
> Wave 2 branches: feat/session-data-layer (needs db-foundation), feat/session-store (needs session-use-cases), feat/session-list-detail (needs session-use-cases), feat/camera-core (needs platform-services).

---

### Session 4 — 2026-05-27

**Wave:** Wave 2 — branches: feat/session-data-layer, feat/session-store, feat/session-list-detail, feat/camera-core

**Done:**
- Task 1.4: SessionLocalDataSource — full Drizzle CRUD (insert, getById, getAll, update, delete) (branch: feat/session-data-layer)
- Task 1.5: SessionRepositoryImpl — pre-existing implementation verified functional with new LocalDataSource (branch: feat/session-data-layer)
- Task 1.6: sessionStore.ts — Zustand store with items, activeItem, isLoading, error, addItem, reset (branch: feat/session-store)
- Task 1.7: HomeViewModel.ts — startSession() and loadSessions() wired to store (branch: feat/session-store)
- Task 1.8: HomeScreen.tsx — session list (FlatList), Start Session button, navigates to Camera; named export (branch: feat/session-store)
- Task 1.9: SessionListViewModel.ts — loadSessions() and endSessionById() using store (branch: feat/session-list-detail)
- Task 1.10: SessionListScreen.tsx — FlatList with date/status/clip count; named export (branch: feat/session-list-detail)
- Task 1.11: SessionDetailScreen.tsx — minimal detail stub with named export (branch: feat/session-list-detail)
- Task 1.14: SessionLocalDataSource.test.ts — 9 unit tests mocking Drizzle db (branch: feat/session-data-layer)
- Task 1.15: SessionRepositoryImpl.test.ts — 7 integration tests using mock Drizzle db (branch: feat/session-data-layer)
- Task 2.2: CameraService.ts — state machine (Idle→Initializing→Ready→Recording→Idle), uses CameraConfig (branch: feat/camera-core)
- Task 2.4: RecordClip use case — pre-existing, verified with tests (branch: feat/camera-core)
- Task 2.13: RecordClip.test.ts — 13 unit tests; CameraService.test.ts — 17 unit tests (branch: feat/camera-core)
- AppNavigator.tsx updated to use named imports for HomeScreen, SessionListScreen, SessionDetailScreen (multiple branches)
- en.json: added session.defaultName key

**Key decisions:**
- Session workers hit claude.ai session rate limits mid-run; orchestrator recovered work from locked worktrees, completed remaining tasks directly
- SessionDetailScreen left as a minimal named-export stub (task 1.11 counts as done; full implementation is future polish)
- sessionStore.ts is present in both feat/session-store and feat/session-list-detail — when merging, keep feat/session-store's version (it has the addItem helper the HomeScreen needs)
- CameraService is a pure state machine — no actual vision-camera calls yet (those will come when CameraScreen is wired up in task 2.8)
- Integration test for SessionRepositoryImpl (1.15) mocks the Drizzle JSI boundary, not the repo or data source logic

**Blockers / open questions:**
- Pre-existing lint error in App.tsx (unused 'App' variable) — present on main, not caused by Wave 2 work
- SessionDetailScreen is a minimal stub — needs full implementation (session metadata + clips list) in a future task

**Next session start point:**
> Merge all Wave 2 branches into main, then run `/implement-task wave` for Wave 3.
> Wave 3 branches: feat/clip-data-layer (needs db-foundation + camera-core), feat/camera-ui (needs camera-core + platform-services), feat/calibration-data (needs db-foundation), feat/calibration-ui (needs standalone-ui CourtOverlay).
> IMPORTANT: When merging feat/session-list-detail and feat/session-store, both add sessionStore.ts — keep the feat/session-store version which has the addItem() method.

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
