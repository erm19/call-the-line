# Call The Line — Claude Project Instructions

## What This Is

React Native (TypeScript) mobile app that uses the phone camera and AI to make tennis line calls in near real-time. Two processing paths:

- **NRT** — < 500ms end-to-end, on-device/edge inference
- **Offline** — full clip uploaded to cloud for higher-accuracy analysis after the point

See `FOUNDATIONS.md` and `ARCHITECTURE.md` for full design intent.

**Stack:** RN 0.73 bare · TS 5.3 strict · React Navigation 6 · react-native-vision-camera 3 · AsyncStorage 1.21 · Zustand 4.4 · tsyringe 4.8 · Zod 3.22 · date-fns 3 · Jest 29.

## Current State

Scaffold is complete. **No features are implemented yet.** Skeletons exist for `src/domain/`, `src/data/`, `src/platform/`, `src/core/`, `src/presentation/`, plus 2 example unit tests.

Missing: ViewModels, Zustand store, working UI, real camera integration, NRT pipeline, AI API integration, court calibration UI, Hebrew i18n.

See `plan.md` for the task breakdown and `progress.md` for session continuity.

## Always-On Rules

**Layer boundaries** — Presentation → Domain (via ViewModels + use cases). Data and Platform implement Domain interfaces. Core is imported by all. Domain stays framework-free (no React in `src/domain/`).

**Result type everywhere** — Use cases and repositories return `Promise<Result<T, AppError>>`. ViewModels branch on `result.isSuccess`.

**NRT budgets (non-negotiable)** — Capture 50ms · Preprocessing 100ms · Inference 250ms · Render overlay 100ms · **End-to-end < 500ms**. Drop resolution before FPS. Must work without network. Silent fallback to offline review on failure. Feature-flag NRT until metrics validate on real devices.

## Detailed Guidance (load when relevant)

- `docs/architecture.md` — use case / screen / Result / Zustand patterns
- `docs/conventions.md` — project code rules, file naming, `types.ts` / `consts.ts` organization
- `docs/testing.md` — mock boundaries and verification commands
