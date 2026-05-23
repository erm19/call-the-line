# Call The Line — Claude Project Instructions

## What This Is

A React Native (TypeScript) mobile app that uses the phone camera and AI to make tennis line calls in near real-time. Players point the phone at the court; the app detects ball bounces and calls "in" or "out" within 500ms.

Two processing paths co-exist:
- **NRT path** — < 500ms end-to-end, 60fps capture, rolling 3s buffer, on-device/edge inference
- **Offline path** — full clip uploaded to cloud for higher-accuracy analysis after the point

See `FOUNDATIONS.md` and `ARCHITECTURE.md` for full design intent.

---

## Current State

The scaffold is complete. **No features are implemented yet.**

What exists (skeletons/shells only):
- All domain entities, use cases, and repository interfaces under `src/domain/`
- All DTOs, mappers, local data sources, and repository implementations under `src/data/`
- Platform service shells under `src/platform/`
- Core utilities (DI container, Result type, errors, analytics) under `src/core/`
- Screen shells and navigation under `src/presentation/`
- 2 unit tests as examples

What does NOT exist yet:
- ViewModels (zero implemented)
- Zustand store
- Any working UI (all screens are stubs)
- Real camera integration
- NRT pipeline logic
- AI API integration
- Court calibration UI
- Hebrew i18n

Refer to `plan.md` for the full task breakdown and `progress.md` for session continuity.

---

## Tech Stack

| Concern | Library | Version |
|---|---|---|
| Framework | React Native (bare) | 0.73 |
| Language | TypeScript strict | 5.3 |
| Navigation | React Navigation (stack) | 6 |
| Camera | react-native-vision-camera | 3 |
| Storage | AsyncStorage | 1.21 |
| State | Zustand | 4.4 |
| DI | tsyringe | 4.8 |
| Validation | Zod | 3.22 |
| Date utils | date-fns | 3 |
| Testing | Jest | 29 |

---

## Architecture Rules

### Layer boundaries (never cross)
```
Presentation → Domain (via ViewModels + use cases)
Data → Domain (implements repository interfaces)
Platform → Domain (implements service interfaces)
Core → nobody (imported by all)
```

Domain layer must stay framework-free. No React imports in `src/domain/`.

### Adding a new use case
Follow the `StartSession` pattern:
1. Create `src/domain/useCases/MyUseCase.ts` — class with `execute()` returning `Promise<Result<T, AppError>>`
2. Inject dependencies via constructor (tsyringe `@injectable`, `@inject`)
3. Register in `src/core/di/container.ts`
4. Write a unit test in `src/tests/unit/MyUseCase.test.ts`

### Adding a new screen
1. Create `src/presentation/screens/Feature/FeatureScreen.tsx` — UI only, no logic
2. Create `src/presentation/screens/Feature/FeatureViewModel.ts` — state + use case calls
3. Add route to `src/presentation/navigation/types.ts` and `AppNavigator.tsx`

### Result type — always use it
```typescript
// In use cases and repositories:
return Result.success(value);
return Result.failure(new AppError('message', 'ERROR_CODE'));

// In ViewModels:
const result = await this.useCase.execute(params);
if (result.isSuccess) { /* result.value */ }
else { /* result.error */ }
```

### Zustand store
One store per feature domain. Place in `src/presentation/state/`. Stores hold UI state only — no business logic.

---

## NRT Constraints (Non-Negotiable)

These latency budgets must be respected at all times:

| Stage | Budget |
|---|---|
| Capture | 50ms |
| Preprocessing | 100ms |
| Inference | 250ms |
| Render overlay | 100ms |
| **End-to-end** | **< 500ms** |

- Drop resolution before dropping FPS
- NRT path must function without network (on-device/edge inference)
- When NRT fails, fall back silently to offline review — never block play
- Feature flag NRT path until metrics validate it on real devices

---

## Code Standards

- **No `export default`** — always named exports
- **No barrel `index.ts` files** — import directly from source file
- **No `any`** — use type guards
- **No `console.log`** — use `AnalyticsService` or remove before commit
- **No hardcoded strings** — all user-facing text goes through `src/presentation/i18n/`
- **Files max 150 lines** — split into modules if longer
- **Functions max 30 lines** — extract helpers
- Permissions requested just-in-time, never at app launch

---

## Testing Rules

Mock ONLY at system boundaries:
- HTTP calls → mock `ApiClient`
- AsyncStorage → mock `@react-native-async-storage/async-storage`
- File system → mock `FileStorageService`

Never mock use cases, domain logic, or mappers — test them directly.

Run after every implementation:
```bash
npm test
npm run typecheck
npm run lint
```

---

## File Naming

```
Entities:          PascalCase.ts           (Session.ts)
Use cases:         PascalCase.ts           (StartSession.ts)
Repository impls:  PascalCase.ts           (SessionRepository.ts under /data)
ViewModels:        PascalCaseViewModel.ts  (HomeViewModel.ts)
Screens:           PascalCaseScreen.tsx    (HomeScreen.tsx)
Components:        PascalCase.tsx          (Button.tsx)
Hooks:             useCamelCase.ts         (useSession.ts)
Stores:            camelCaseStore.ts       (sessionStore.ts)
Tests:             *.test.ts
```
