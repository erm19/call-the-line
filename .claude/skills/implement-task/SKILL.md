---
name: implement-task
description: implement the next task from plan.md — create branch, RGR cycle, quality gate, commit, update progress. Use when asked to "implement the next task", "work on task X.Y", "continue from where we left off", or "start a new task".
---

# implement-task

Implements one atomic task from `plan.md` in full: branch → RGR → quality gate → commit → update tracking files.

Each task in `plan.md` maps to exactly one branch and one or more commits. Nothing is merged automatically — only committed.

---

## Phase 0 — Orient

Read these files before touching any code:

```bash
cat plan.md          # find the target task
cat progress.md      # last session's endpoint and open blockers
```

**Selecting the task:**
- If the user named a task ID (e.g. `1.3`), use that.
- Otherwise use the first unchecked `[ ]` item in `plan.md`.

Extract the task ID and short slug. Examples:

| Task line | ID | Slug |
|---|---|---|
| `[ ] **1.1** Implement StartSession use case body` | `1.1` | `implement-start-session` |
| `[ ] **2.3** Implement FileStorageService` | `2.3` | `implement-file-storage-service` |

---

## Phase 1 — Branch

Check the current branch. If already on a task branch for *this* task, skip creation.

```bash
git branch --show-current
```

Never commit directly to `main`. Always branch first:

```bash
git checkout main
git pull --ff-only            # sync before branching (if remote exists)
git checkout -b task/<ID>-<slug>
# e.g. task/1.1-implement-start-session
```

Branch naming: `task/<numeric-id>-<kebab-slug>` (lowercase, dashes, no slashes in slug).

---

## Phase 2 — Understand Before Writing

Read all files the task will touch. Grep for related types and interfaces:

```bash
# For use case tasks
cat src/domain/useCases/<Name>.ts
cat src/domain/repositories/<Repo>Repository.ts
cat src/domain/entities/<Entity>.ts

# For data layer tasks
cat src/data/localDataSources/<Name>LocalDataSource.ts
cat src/data/repositories/<Name>Repository.ts
cat src/data/dto/<Name>DTO.ts
cat src/data/mappers/<name>Mapper.ts

# For presentation tasks
cat src/presentation/screens/<Feature>/<Name>Screen.tsx
cat src/presentation/state/<name>Store.ts

# Always check the DI container for registration patterns
cat src/core/di/container.ts | head -60
```

Read `ARCHITECTURE.md` if the task is in an unfamiliar layer.

---

## Phase 3 — RGR Implementation

Follow **Red → Green → Refactor** strictly. Never write implementation before the failing test exists.

### 3a. Red — write the failing test

**Test file location:** `src/tests/unit/<Name>.test.ts`

Mock ONLY at system boundaries:

| Boundary | Mock target |
|---|---|
| AsyncStorage | `@react-native-async-storage/async-storage` |
| HTTP | `ApiClient` |
| File system | `FileStorageService` |
| Device APIs | Camera, Motion sensor platform services |

**Never** mock use cases, domain logic, mappers, or repositories when testing their internals.

Run to confirm it is red:

```bash
npm test -- --testPathPattern="<Name>"
```

### 3b. Green — minimal implementation

Implement just enough to make the test pass. No speculative code.

Architecture rules that are non-negotiable:

- Use case `execute()` always returns `Promise<Result<T, AppError>>`
- Domain layer has zero React/RN imports
- Screens hold no logic — all logic in ViewModels
- `Result.success(value)` / `Result.failure(new AppError(msg, code))` — never throw from use cases
- DI: `@injectable()` + `@inject(TOKENS.X)` — register in `container.ts`
- No `export default`, no barrel `index.ts`, no `any`, no `console.log`
- Files max 150 lines — split if over

For **use case** implementations:

```typescript
async execute(input: XInput): Promise<Result<X, AppError>> {
  // 1. Validate input if needed
  // 2. Call repository / service
  // 3. Track analytics on success
  // 4. Return result directly — never catch the Result failure here
  const result = await this.repo.action(data);
  if (result.isSuccess) {
    this.analyticsService.trackEvent({ ... });
  }
  return result;
}
```

For **local data source** implementations (AsyncStorage pattern):

```typescript
async create(entity: Omit<X, 'id'>): Promise<Result<X, AppError>> {
  try {
    const id = generateId();
    const item: X = { ...entity, id, createdAt: now(), updatedAt: now() };
    const existing = await this.getAll(); // always merge, never overwrite
    if (!existing.isSuccess) return existing;
    const updated = [...existing.value, item];
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    return Result.success(item);
  } catch (e) {
    return Result.failure(new AppError('Failed to save', 'STORAGE_ERROR'));
  }
}
```

For **ViewModel** implementations:

```typescript
// In constructor, inject use cases; expose reactive state via methods
// State lives in Zustand store, not in the ViewModel
// ViewModel methods are async and update the store
async startSession(input: StartSessionInput): Promise<void> {
  this.store.setLoading(true);
  const result = await this.startSessionUseCase.execute(input);
  if (result.isSuccess) {
    this.store.addSession(result.value);
  } else {
    this.store.setError(result.error.message);
  }
  this.store.setLoading(false);
}
```

### 3c. Refactor

Once green, refactor for clarity. Function max 30 lines. If a function needs `// --- section ---` comments to be readable, extract helpers.

---

## Phase 4 — Quality Gate

Run all three. Fix every failure before proceeding:

```bash
npm test
npm run typecheck
npm run lint
```

If any fail, fix them. Do not proceed with failing checks.

---

## Phase 5 — Update Tracking Files

**Mark the task done in `plan.md`:**

Change `- [ ] **X.Y**` → `- [x] **X.Y**` for the task just completed.

**Append to the session log in `progress.md`:**

```markdown
### Session N — YYYY-MM-DD

**Done:**
- Task X.Y: <one-line description of what was implemented>
- <list any extra files touched>

**Key decisions:**
- <any non-obvious choices made>

**Blockers / open questions:**
- <anything unresolved>

**Next session start point:**
> Phase X, task X.Z: <brief instruction>
```

---

## Phase 6 — Commit

```bash
git add -p    # stage only task-related changes; never stage unrelated hunks
git commit -m "<type>: <description under 60 chars>"
```

Commit type for each task kind:

| Task kind | Type |
|---|---|
| Use case implementation | `feat` |
| Data source / repository | `feat` |
| ViewModel + Screen | `feat` |
| Tests only | `test` |
| i18n strings | `feat` |
| Zustand store | `feat` |
| Plan / progress file update | `docs` |
| Config / DI registration | `chore` |

Always commit plan.md + progress.md together as a separate `docs:` commit after the implementation commit:

```bash
git add plan.md progress.md
git commit -m "docs: mark task <X.Y> complete and update progress"
```

Do **not** push automatically. Offer:

```
Branch: task/<ID>-<slug>
Push when ready: git push -u origin task/<ID>-<slug>
```

---

## Phase 7 — Done Criteria

The task is complete when all of the following are true:

- [ ] Tests pass (including the new ones written in Phase 3a)
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0
- [ ] The task checkbox in `plan.md` is `[x]`
- [ ] `progress.md` has a new session entry
- [ ] All changes are committed on the task branch (not main)

---

## Task-Type Quick Reference

### Adding a use case
1. Test: `src/tests/unit/<Name>.test.ts` — mock repository + analytics
2. Implement: `src/domain/useCases/<Name>.ts` — already scaffolded, fill `execute()`
3. Register in `src/core/di/container.ts` if not already

### Adding a local data source
1. Test: `src/tests/unit/<Name>LocalDataSource.test.ts` — mock `@react-native-async-storage/async-storage`
2. Implement: `src/data/localDataSources/<Name>LocalDataSource.ts`
3. Interface in domain: `src/domain/repositories/<Name>Repository.ts`

### Adding a repository implementation
1. Test: `src/tests/integration/<Name>RepositoryImpl.test.ts` — mock AsyncStorage
2. Implement: `src/data/repositories/<Name>Repository.ts`

### Adding a ViewModel + Screen
1. Test: `src/tests/unit/<Name>ViewModel.test.ts` — mock use cases
2. Implement: `src/presentation/screens/<Feature>/<Name>ViewModel.ts`
3. Implement: `src/presentation/screens/<Feature>/<Name>Screen.tsx` — UI only
4. Wire route: `src/presentation/navigation/types.ts` + `AppNavigator.tsx`

### Adding a Zustand store
1. No test needed (stores are thin UI state — test via ViewModel)
2. Create: `src/presentation/state/<name>Store.ts`
3. Shape: `{ items, activeItem, isLoading, error, set*, reset }`

---

## Gotchas

- **DI registration order** — `container.ts` registers singletons; if a dependency is missing, tsyringe throws at runtime with a useless message. Check that every `@inject(TOKENS.X)` token has a matching `container.registerSingleton(TOKENS.X, Impl)` line.
- **AsyncStorage is async all the way** — `getItem` returns `null` (not `undefined`) for missing keys. Always handle `null` explicitly; `JSON.parse(null)` returns `null`, not `[]`.
- **Result propagation** — never unwrap a `Result` failure inside a use case and re-throw it. Return it directly so the ViewModel can handle it. Swallowed failures cause silent no-ops.
- **Module aliases** — paths like `@domain/`, `@core/`, `@data/` are configured in `tsconfig.json`. If a new file can't resolve an alias, check `compilerOptions.paths`.
- **Tests importing RN modules** — some RN native modules (vision-camera, AsyncStorage) need manual mocks in `__mocks__/`. If a test crashes with "NativeModule X is null", check `__mocks__/`.
