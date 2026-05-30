# Call The Line — Implementation Plan

Atomic tasks organized by phase. Each task is one logical unit of work.
Check off with `[x]` as tasks complete. See `progress.md` for session log.

---

## Parallel Execution Strategy (git worktrees, max 4)

Use `git worktree add ../call-the-line-<name> -b feat/<name>` for each slot.
Merge waves in order — later waves depend on earlier ones.

### Dependency Map
```
1.0b → 1.0c ──────────────→ 1.4 → 1.5 → 1.14, 1.15, 1.11
1.1 ┐
1.2 ┼─→ 1.13 → 1.6 → 1.7 → 1.8
1.3 ┘         ↘ 1.9 → 1.10

Standalones (no deps): 1.12, 2.1, 2.3, 2.9, 2.11, 2.12, 3.4, 3.8, 4.1, 5.1
```

### Wave 1 — unblock everything
| Worktree | Branch | Tasks |
|---|---|---|
| WT-1 | `feat/db-foundation` | 1.0b → 1.0c |
| WT-2 | `feat/session-use-cases` | 1.1 + 1.2 + 1.3 + 1.13 |
| WT-3 | `feat/platform-services` | 2.1 + 2.3 + 2.9 |
| WT-4 | `feat/standalone-ui` | 1.12 + 2.11 + 2.12 + 3.4 + 3.8 + 4.1 |

### Wave 2 — after Wave 1 merges
| Worktree | Branch | Tasks | Needs |
|---|---|---|---|
| WT-1 | `feat/session-data-layer` | 1.4 + 1.5 + 1.14 + 1.15 | db-foundation |
| WT-2 | `feat/session-store` | 1.6 + 1.7 + 1.8 | session-use-cases |
| WT-3 | `feat/session-list-detail` | 1.9 + 1.10 + 1.11 | session-use-cases |
| WT-4 | `feat/camera-core` | 2.2 + 2.4 + 2.13 | platform-services |

### Wave 3 — Phase 2 + 3 in parallel
| Worktree | Branch | Tasks | Needs |
|---|---|---|---|
| WT-1 | `feat/clip-data-layer` | 2.5 + 2.6 + 2.15 | db-foundation, camera-core |
| WT-2 | `feat/camera-ui` | 2.7 + 2.8 + 2.10 + 2.14 | camera-core, platform-services |
| WT-3 | `feat/calibration-data` | 3.1 + 3.2 + 3.3 + 3.9 | db-foundation |
| WT-4 | `feat/calibration-ui` | 3.5 + 3.6 + 3.7 + 3.10 | standalone-ui (CourtOverlay) |

---

## Phase 0: Scaffold ✅

- [x] React Native bare project initialized
- [x] TypeScript strict mode configured
- [x] ESLint + Prettier configured
- [x] Jest configured
- [x] Architecture documentation (ARCHITECTURE.md, FOUNDATIONS.md)
- [x] Domain entities: Session, Clip, CourtCalibration, PointDecision, AIResult, NRTConfig, LatencyMetrics
- [x] Domain repository interfaces: SessionRepository, ClipRepository, CalibrationRepository, AIReviewRepository, NRTConfigRepository
- [x] Domain use cases: StartSession, EndSession, RecordClip, SaveCalibration, GetSessions, SubmitClipForAI, GetAIResult, StartLiveTracking, StopLiveTracking, RunNRTDecisionPipeline
- [x] Data DTOs: SessionDTO, ClipDTO, CalibrationDTO, AIResultDTO, NRTConfigDTO
- [x] Data mappers: sessionMapper, clipMapper, calibrationMapper, aiResultMapper, nrtConfigMapper
- [x] Data local sources: SessionLocalDataSource, ClipLocalDataSource, CalibrationLocalDataSource, NRTConfigLocalDataSource
- [x] Data remote sources: ApiClient, AIReviewRemoteDataSource
- [x] Data repository impls: SessionRepository, ClipRepository, NRTConfigRepository
- [x] Platform services: CameraService, NRTCameraService, PermissionService, FileStorageService, MotionSensorService
- [x] Core: DI container (tsyringe), Result<T,E> type, AppError hierarchy, AnalyticsService, env config, constants
- [x] Presentation: navigation setup, type-safe routes, theme (colors, spacing, typography)
- [x] Presentation: screen shells (Home, Camera, SessionList, SessionDetail, Review)
- [x] Presentation: component shells (Button, Loader)
- [x] i18n: English strings skeleton
- [x] Example unit tests: StartSession.test.ts, sessionMapper.test.ts
- [x] CLAUDE.md, plan.md, progress.md

---

## Phase 1: Core Session Flow

Goal: create/list/view sessions end-to-end with persistent storage.

- [x] **1.0a** Install `expo-sqlite` + `drizzle-orm` + `drizzle-kit`; add `drizzle.config.ts`; update `babel.config.js` for JSI; remove `@react-native-async-storage/async-storage`
- [x] **1.0b** Define Drizzle schema (`src/data/db/schema.ts`) — `sessions`, `clips`, `calibrations`, `aiResults`, `nrtConfigs` tables with all columns and relations
- [x] **1.0c** Generate initial migration (`src/data/db/migrations/`); create `db` client singleton (`src/data/db/client.ts`); register `DB_CLIENT` token in DI container
- [x] **1.1** Implement `StartSession` use case body — generate ID, set timestamps, persist via `SessionRepository`
- [x] **1.2** Implement `EndSession` use case body — update status and `endedAt`, persist
- [x] **1.3** Implement `GetSessions` use case body — fetch all sessions ordered by `createdAt` desc
- [x] **1.4** Implement `SessionLocalDataSource` — Drizzle CRUD on `sessions` table: `insert`, `findById`, `findAll` (ordered by `createdAt` desc), `update`, `delete`
- [x] **1.5** Implement `SessionRepositoryImpl` — wire local data source, map DTOs ↔ entities
- [x] **1.6** Create `sessionStore.ts` (Zustand) — sessions list, active session, loading/error state
- [x] **1.7** Create `HomeViewModel.ts` — expose `startSession()`, `sessions`, `isLoading`, `error`
- [x] **1.8** Implement `HomeScreen.tsx` — show session list, "Start Session" button, navigate to Camera
- [x] **1.9** Create `SessionListScreen` ViewModel — load sessions on mount, expose list + delete action
- [x] **1.10** Implement `SessionListScreen.tsx` — flat list of sessions with date/status
- [x] **1.11** Implement `SessionDetailScreen.tsx` — show session metadata and clips list
- [x] **1.12** Add i18n keys for all session UI strings
- [x] **1.13** Unit tests: StartSession, EndSession, GetSessions use cases
- [x] **1.14** Unit tests: `SessionLocalDataSource` — mock the Drizzle `db` client; verify query calls for each CRUD operation
- [x] **1.15** Integration test: `SessionRepositoryImpl` — in-memory SQLite via `expo-sqlite` test helper; no mocks for repo logic

---

## Phase 2: Camera & Basic Recording

Goal: user can record a clip and it's saved to the session.

- [x] **2.1** Implement `PermissionService` — camera + microphone permission request and status check
- [x] **2.2** Implement `CameraService` — start/stop standard recording using vision-camera, return file path
- [x] **2.3** Implement `FileStorageService` — save/delete/list clip files in app-private storage
- [x] **2.4** Implement `RecordClip` use case body — orchestrate CameraService + ClipRepository
- [x] **2.5** Implement `ClipLocalDataSource` — Drizzle CRUD on `clips` table; include `findBySessionId` query
- [x] **2.6** Implement `ClipRepositoryImpl` — wire local data source + file storage, map Drizzle rows ↔ entities
- [x] **2.7** Create `CameraViewModel.ts` — recording state machine: idle → recording → saving → done
- [x] **2.8** Implement `CameraScreen.tsx` — vision-camera preview, record button, permission denied state
- [x] **2.9** Add permission-denied educative screen with "Open Settings" deep link
- [x] **2.10** Lock orientation to landscape in camera screen
- [x] **2.11** Add `VideoPlayer` component for clip playback
- [x] **2.12** Add i18n keys for camera UI strings
- [x] **2.13** Unit tests: RecordClip use case
- [x] **2.14** Unit tests: CameraViewModel state transitions
- [x] **2.15** Integration test: `ClipRepositoryImpl` — in-memory SQLite

---

## Phase 3: Court Calibration

Goal: user can calibrate court geometry once per session; it persists.

- [x] **3.1** Implement `CalibrationLocalDataSource` — Drizzle CRUD on `calibrations` table; `findBySessionId` query
- [x] **3.2** Implement `CalibrationRepositoryImpl` — wire local data source, map Drizzle rows ↔ entities
- [x] **3.3** Implement `SaveCalibration` use case body — validate + persist calibration
- [x] **3.4** Create `CourtOverlay` component — SVG overlay showing court lines and calibration points
- [x] **3.5** Create calibration screen — tap-to-place 4 court corner points on live camera preview
- [x] **3.6** Create `CalibrationViewModel.ts` — track point placement state, validate 4-point input
- [x] **3.7** Wire calibration into Camera flow — prompt on first session start if not calibrated
- [x] **3.8** Add i18n keys for calibration UI
- [x] **3.9** Unit tests: SaveCalibration use case
- [x] **3.10** Unit tests: CalibrationViewModel

---

## Phase 4: Offline AI Review

Goal: user can submit a recorded clip and see the AI line call result.

- [x] **4.1** Define stable API contract — document `/v1/detect-out` request/response shape
- [ ] **4.2** Implement `AIReviewRemoteDataSource` — POST clip, poll for result with exponential backoff
- [ ] **4.3** Implement `AIReviewRepositoryImpl` — wire remote data source, map DTOs ↔ entities
- [ ] **4.4** Implement `SubmitClipForAI` use case body — validate clip, upload, store pending result
- [ ] **4.5** Implement `GetAIResult` use case body — fetch result status, return final `AIResult` when ready
- [ ] **4.6** Create `ReviewViewModel.ts` — manage submission state: idle → uploading → processing → result
- [ ] **4.7** Implement `ReviewScreen.tsx` — video playback + "Submit" button + result overlay
- [ ] **4.8** Create result overlay UI — show IN/OUT decision with confidence and court position dot
- [ ] **4.9** Handle no-network state — queue upload for later, show user feedback
- [ ] **4.10** Compress video before upload (react-native-video-compression or FFmpeg kit)
- [ ] **4.11** Add i18n keys for review UI
- [ ] **4.12** Unit tests: SubmitClipForAI, GetAIResult use cases
- [ ] **4.13** Unit tests: ReviewViewModel state machine
- [ ] **4.14** Integration test: AIReviewRemoteDataSource (mock HTTP)

---

## Phase 5: NRT Pipeline

Goal: live ball tracking with sub-500ms in/out calls during play.

- [ ] **5.0a** Install `react-native-fast-tflite`; add placeholder `.tflite` ball-detection model to `assets/models/`; configure Metro to resolve `.tflite` files
- [ ] **5.0b** Create `TFLiteInferenceService` platform service — loads model from assets at startup, exposes `runInference(frame): InferenceResult` synchronously within 250ms; register in DI
- [ ] **5.1** Add NRT feature flag — `NRT_ENABLED` constant, check before entering NRT path
- [ ] **5.2** Implement `NRTCameraService` — 60fps frame stream via vision-camera frame processor; pipe raw frames directly into `TFLiteInferenceService` to avoid copy overhead
- [ ] **5.3** Implement rolling frame buffer — keep last 3 seconds, O(1) insert/evict
- [ ] **5.4** Implement `RunNRTDecisionPipeline` use case body — orchestrate frame selection, `TFLiteInferenceService` call, decision
- [ ] **5.5** Implement bounce detection heuristic — analyze trajectory from frame sequence
- [ ] **5.6** Implement model hot-swap — `TFLiteInferenceService` can reload a new `.tflite` file from local storage without restarting the pipeline; enables model updates without app release
- [ ] **5.7** Add latency instrumentation — timestamp each pipeline stage, populate `LatencyMetrics`
- [ ] **5.8** Implement `StartLiveTracking` use case body — configure NRTCameraService, start pipeline
- [ ] **5.9** Implement `StopLiveTracking` use case body — flush buffer, stop camera, persist metrics
- [ ] **5.10** Create `NRTStatusBanner` component — shows "LIVE", "NRT DEGRADED", or "OFFLINE" states
- [ ] **5.11** Create `LatencyIndicator` component — real-time FPS + end-to-end ms display (debug mode only)
- [ ] **5.12** Wire NRT decision overlay into `CourtOverlay` — flash IN/OUT on bounce detection
- [ ] **5.13** Implement device tier detection — categorize device capability, set quality defaults
- [ ] **5.14** Implement dynamic quality adjustment — drop resolution before FPS if budget exceeded
- [ ] **5.15** Unit tests: RunNRTDecisionPipeline with synthetic frame input
- [ ] **5.16** Unit tests: frame buffer (insert, evict, window extraction)
- [ ] **5.17** Unit tests: bounce detection heuristic
- [ ] **5.18** Performance test: validate < 500ms on target devices (manual, document results)

---

## Phase 6: Polish & Reliability

Goal: production-ready error handling, storage hygiene, and debug tooling.

- [ ] **6.1** Add global error boundary in `App.tsx` — catch and display unhandled errors
- [ ] **6.2** Implement storage cleanup — "Delete old clips" with configurable age threshold
- [ ] **6.3** Implement session delete — remove session + all its clips from storage
- [ ] **6.4** Add debug mode screen — toggle FPS overlay, latency stats, mock NRT decision
- [ ] **6.5** Implement graceful camera failure — `CameraError` shown with retry option
- [ ] **6.6** Implement graceful storage failure — warn user when disk space is low
- [ ] **6.7** Add background upload retry queue — persist failed uploads, retry on next launch
- [ ] **6.8** Wire `AnalyticsService` — track session start/end, clip recorded, AI submitted, NRT decision, errors
- [ ] **6.9** Add Hebrew i18n (`he.json`) — translate all keys from `en.json`
- [ ] **6.10** RTL layout support — verify all screens work in RTL with Hebrew locale

---

## Phase 7: Quality Gate

Goal: test coverage for all critical paths.

- [ ] **7.1** E2E test: Home → start session → camera → record clip → review
- [ ] **7.2** E2E test: calibration flow
- [ ] **7.3** E2E test: AI review submission and result display
- [ ] **7.4** Unit test coverage ≥ 80% for domain layer
- [ ] **7.5** Integration test: full repository layer with mock storage
- [ ] **7.6** Performance baseline documented: FPS, latency on iPhone 12 and equivalent Android

---

## Deferred / Future

- Cloud sync (session backup and cross-device)
- Multi-camera angle support
- Real-time collaboration (shared session view)
- Auth / user accounts
