# Conventions

General TS/JS standards (no `export default`, no barrel `index.ts`, no `any` without type guards, no `console.log`, 150-line file cap, 30-line function cap) are inherited from the global `~/.claude/CLAUDE.md`. Project-specific rules below.

## Project-specific code rules

- No hardcoded user-facing strings — all text goes through `src/presentation/i18n/`
- No `console.log` — use `AnalyticsService` or remove before commit
- Permissions requested just-in-time, never at app launch

## File organization

- **Types and interfaces** live in a `types.ts` in the directory that owns them
- **Constants** live in a `consts.ts` in the same directory
- Don't co-locate types inside the file that uses them unless the type is truly private to one function
- Cross-feature shared types still follow this rule — they live in a `types.ts` at the shared directory's root, not scattered

## File naming

```
Entities:          PascalCase.ts           (Session.ts)
Use cases:         PascalCase.ts           (StartSession.ts)
Repository impls:  PascalCase.ts           (SessionRepository.ts under /data)
ViewModels:        PascalCaseViewModel.ts  (HomeViewModel.ts)
Screens:           PascalCaseScreen.tsx    (HomeScreen.tsx)
Components:        PascalCase.tsx          (Button.tsx)
Component styles:  PascalCase.styles.ts    (Button.styles.ts)
Hooks:             useCamelCase.ts         (useSession.ts)
Stores:            camelCaseStore.ts       (sessionStore.ts)
Tests:             *.test.ts
```

## Component styles

- Every component that has styles **must** keep them in a co-located `PascalCase.styles.ts` file
- The styles file exports a named `styles` constant (`StyleSheet.create(...)`) and any style-related constants (e.g. `POINT_SIZE`) the component needs
- The component file must **not** contain a `StyleSheet.create(...)` call — import `styles` from the `.styles.ts` file instead
- Style-only constants that are used only in layout arithmetic (sizes, thicknesses) belong in the styles file, not in `consts.ts`
