---
name: implement-task
description: implement the next task from plan.md — create branch, RGR cycle, quality gate, commit, update progress. Supports parallel worktree waves. Use when asked to "implement the next task", "work on task X.Y", "continue from where we left off", "start a new task", or "run the next wave".
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent, Bash(git commit*), Bash(git add*), Bash(git checkout*), Bash(git log*), Bash(git diff*), Bash(git status*), Bash(git branch*), Bash(git push*)
---

# implement-task

Two modes:

- **Wave mode** — triggered by `/implement-task wave`. Reads the next ready wave from `plan.md`'s Parallel Execution Strategy, spawns up to 4 sub-agents each in an isolated worktree, and — critically — **only the orchestrator writes `plan.md` and `progress.md`** to prevent conflicts.
- **Single mode** — triggered by `/implement-task` or `/implement-task X.Y`. One task, one branch, the original linear RGR flow.

---

## Phase 0 — Orient & Select Mode

```bash
cat plan.md        # task list + parallel strategy
cat progress.md    # last session endpoint + blockers
```

**Mode selection:**
- `/implement-task wave` → **Wave mode** (see Wave Mode section)
- `/implement-task X.Y` → **Single mode** for that task
- `/implement-task` (no args) → first unchecked `[ ]` task → **Single mode**

---

## Wave Mode

The orchestrator spawns workers, waits, then does all file writes. Workers never touch `plan.md` or `progress.md`.

### W1 — Identify the current wave

In `plan.md`'s **Parallel Execution Strategy** section, find the first Wave table where:
1. All "Needs" branches are already merged into `main` (`git branch --merged main`)
2. At least one task in the wave is still unchecked `[ ]`

Extract each row: branch name, task IDs. Skip rows where every task is already `[x]`.

### W2 — Spawn sub-agents

For each worktree row from W1, launch one sub-agent **simultaneously** using the Agent tool with `isolation: "worktree"`. Pass each agent this prompt (fill in the placeholders):

---

> You are a **worker agent** implementing tasks for the Call The Line app.
>
> **Your tasks:** `<task IDs>` — `<full task descriptions from plan.md>`
>
> **Your branch:** create and work on `<branch name from the wave table>`
>
> Follow these steps:
>
> 1. **Branch** — `git checkout main && git checkout -b <branch-name>`
> 2. **Read** — read every file the tasks will touch before writing any code (see the "Understand Before Writing" section of this skill)
> 3. **RGR** — for each task: write the failing test first, then implement minimally, then refactor. Follow the architecture rules and Gotchas at the bottom of this skill.
> 4. **Quality gate** — `npm test && npm run typecheck && npm run lint`. Fix all failures before continuing.
> 5. **Commit** — `git add -p` (code and tests only), then `git commit -m "<type>: <description>"`
> 6. **Review** — After committing, invoke the `review` skill via the Skill tool (`Skill("review")`). Fix all `[Blocker]` findings. Re-run the quality gate and commit any fixes as `fix: address review findings`.
>
> **CRITICAL:** Do **NOT** modify `plan.md` or `progress.md`. The orchestrator handles those.
>
> When all tasks are done (or you've hit an unresolvable blocker), reply with **only** this structured block:
>
> ```
> TASKS_COMPLETED: <comma-separated task IDs that passed quality gate>
> TASKS_BLOCKED: <comma-separated task IDs that could not complete, or "none">
> BRANCH: <branch name>
> COMMITS: <one-line summary per commit, newest first>
> DECISIONS: <key non-obvious choices, one per line, or "none">
> BLOCKERS: <description of any unresolved issues, or "none">
> ```

---

### W3 — Wait and collect

Wait for all sub-agents to finish. Collect their structured blocks.

If a sub-agent's final message contains no structured block, treat all its tasks as blocked with reason "agent did not complete".

### W3.5 — Review & Fix (orchestrator)

For each branch in `TASKS_COMPLETED`, checkout the branch and run a code review:

```bash
git checkout <branch>
```

Then invoke the `review` skill via the Skill tool (`Skill("review")`). This runs in LOCAL mode — it reviews the branch diff against main.

Fix **all findings** — `[Blocker]`, `[Nice to have]`, `[Suggestion]`, and `[Question]`:
1. Address each finding in the relevant file(s)
2. For `[Question]` findings: make the best judgment call and leave a brief note in the commit message explaining the decision
3. Re-run the quality gate: `npm test && npm run typecheck && npm run lint`
4. Commit all fixes: `git add -p && git commit -m "fix: address review findings"`

After reviewing all branches, return to main: `git checkout main`

---

### W4 — Update tracking files (orchestrator only)

**`plan.md`** — for every task ID in any `TASKS_COMPLETED` list:

Change `- [ ] **X.Y**` → `- [x] **X.Y**`

**`progress.md`** — append one session entry:

```markdown
### Session N — YYYY-MM-DD

**Wave:** <Wave N> — branches: <comma-separated branch names>

**Done:**
- Task X.Y: <description> (branch: feat/...)
- Task X.Y: <description> (branch: feat/...)

**Key decisions:**
- <aggregated DECISIONS from all worker reports, deduplicated>

**Blockers / open questions:**
- <aggregated BLOCKERS from all worker reports, or "none">

**Next session start point:**
> Next wave: <next wave from plan.md strategy>, pending merges of: <branch list>.
> Run `/implement-task wave` again after merging.
```

**Commit tracking updates on `main`:**

```bash
git checkout main
git add plan.md progress.md
git commit -m "docs: mark wave <N> tasks complete — <task ID list>"
```

### W5 — Report to user

```
Wave N complete.

Branches ready to merge:
  <branch>   →  tasks <IDs>  ✓
  <branch>   →  tasks <IDs>  ✓

Blocked (left unchecked):
  <task ID>  →  <reason>

Next: Wave <N+1> unblocked after merges. Run `/implement-task wave` again.
```

---

## Single Task Mode

### Phase 1 — Branch

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

### Phase 2 — Understand Before Writing

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

### Phase 3 — RGR Implementation

Follow **Red → Green → Refactor** strictly. Never write implementation before the failing test exists.

#### 3a. Red — write the failing test

**Test file location:** `src/tests/unit/<Name>.test.ts`

Mock ONLY at system boundaries:

| Boundary | Mock target |
|---|---|
| SQLite / Drizzle | `src/data/db/client.ts` — mock the `db` singleton |
| HTTP | `ApiClient` |
| File system | `FileStorageService` |
| Device APIs | Camera, Motion sensor platform services |

**Never** mock use cases, domain logic, mappers, or repositories when testing their internals.

Run to confirm it is red:

```bash
npm test -- --testPathPattern="<Name>"
```

#### 3b. Green — minimal implementation

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

For **local data source** implementations (Drizzle pattern):

```typescript
// src/data/db/schema.ts defines all tables
// src/data/db/client.ts exports the `db` singleton (injected via DI)

async create(entity: Omit<X, 'id'>): Promise<Result<X, AppError>> {
  try {
    const id = generateId();
    const row = { ...toDbRow(entity), id, createdAt: now(), updatedAt: now() };
    await this.db.insert(schema.sessions).values(row);
    return Result.success(toEntity(row));
  } catch (e) {
    return Result.failure(new AppError('Failed to save', 'STORAGE_ERROR'));
  }
}

async findAll(): Promise<Result<X[], AppError>> {
  try {
    const rows = await this.db
      .select()
      .from(schema.sessions)
      .orderBy(desc(schema.sessions.createdAt));
    return Result.success(rows.map(toEntity));
  } catch (e) {
    return Result.failure(new AppError('Failed to load', 'STORAGE_ERROR'));
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

#### 3c. Refactor

Once green, refactor for clarity. Function max 30 lines. If a function needs `// --- section ---` comments to be readable, extract helpers.

---

### Phase 4 — Quality Gate

Run all three. Fix every failure before proceeding:

```bash
npm test
npm run typecheck
npm run lint
```

If any fail, fix them. Do not proceed with failing checks.

---

### Phase 5 — Update Tracking Files

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

### Phase 6 — Commit

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

### Phase 6.5 — Review & Fix

Invoke the `review` skill via the Skill tool (`Skill("review")`). This reviews the current branch diff against main in LOCAL mode.

Fix **all findings** — `[Blocker]`, `[Nice to have]`, `[Suggestion]`, and `[Question]`:
1. Address each finding in the relevant file(s)
2. For `[Question]` findings: make the best judgment call and leave a brief note in the commit message explaining the decision
3. Re-run the quality gate: `npm test && npm run typecheck && npm run lint`
4. Commit all fixes: `git add -p && git commit -m "fix: address review findings"`

---

### Phase 7 — Done Criteria

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
1. Confirm the table is in `src/data/db/schema.ts`; add the column if missing, then re-run migration
2. Test: `src/tests/unit/<Name>LocalDataSource.test.ts` — mock `src/data/db/client` (`jest.mock('@data/db/client')`)
3. Implement: `src/data/localDataSources/<Name>LocalDataSource.ts` — inject `db` via DI, use Drizzle query builder

### Adding a repository implementation
1. Test: `src/tests/integration/<Name>RepositoryImpl.test.ts` — use `expo-sqlite` in-memory DB (`:memory:`) so no mocking needed
2. Implement: `src/data/repositories/<Name>Repository.ts` — wire `<Name>LocalDataSource`, call mapper to convert rows ↔ entities

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
- **Drizzle schema drift** — if you add a column to `schema.ts` without generating a migration, the app crashes at runtime with a column-not-found error. Always run `npx drizzle-kit generate` after schema changes and commit the migration file.
- **In-memory DB for integration tests** — use `openDatabaseSync(':memory:')` from `expo-sqlite` in `beforeEach` and create tables from the migration SQL. Drizzle's `migrate()` helper works here too.
- **Result propagation** — never unwrap a `Result` failure inside a use case and re-throw it. Return it directly so the ViewModel can handle it. Swallowed failures cause silent no-ops.
- **Module aliases** — paths like `@domain/`, `@core/`, `@data/` are configured in `tsconfig.json`. If a new file can't resolve an alias, check `compilerOptions.paths`.
- **Tests importing RN modules** — some RN native modules (vision-camera, AsyncStorage) need manual mocks in `__mocks__/`. If a test crashes with "NativeModule X is null", check `__mocks__/`.
- **Wave mode: never update plan.md/progress.md from a worker** — sub-agents commit code only. If a worker touches tracking files, those commits will conflict when branches merge back. The orchestrator is the single writer.
- **Wave mode: worktrees share node_modules** — each worktree path is a separate directory but they share the repo's `.git`. Each worker should have `node_modules` installed (`npm install`) before running tests. If a dependency is missing in the worktree, `npm ci` in that path.
- **Wave mode: worker branch naming** — workers must use the exact branch name from the wave table in `plan.md`. Diverging names breaks the W1 "deps merged" check for the next wave.
