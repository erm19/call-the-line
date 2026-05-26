# Call The Line — Session Progress Log

Resume instructions:
> "Read progress.md and plan.md, then continue from where we left off"

End-of-session instructions:
> "Update progress.md with what was done and what's next"

---

## Current Status

**Phase:** Phase 1–2 — Wave 1 complete; 13 tasks done

**Next task:** Wave 2 — merge all Wave 1 branches into main, then run `/implement-task wave` again

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
