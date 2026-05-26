# Architecture Patterns

## Layer boundaries (never cross)

```
Presentation → Domain (via ViewModels + use cases)
Data → Domain (implements repository interfaces)
Platform → Domain (implements service interfaces)
Core → nobody (imported by all)
```

Domain layer must stay framework-free. No React imports in `src/domain/`.

## Adding a new use case

Follow the `StartSession` pattern:

1. Create `src/domain/useCases/MyUseCase.ts` — class with `execute()` returning `Promise<Result<T, AppError>>`
2. Inject dependencies via constructor (tsyringe `@injectable`, `@inject`)
3. Register in `src/core/di/container.ts`
4. Write a unit test in `src/tests/unit/MyUseCase.test.ts`

## Adding a new screen

1. Create `src/presentation/screens/Feature/FeatureScreen.tsx` — UI only, no logic
2. Create `src/presentation/screens/Feature/FeatureViewModel.ts` — state + use case calls
3. Add route to `src/presentation/navigation/types.ts` and `AppNavigator.tsx`

## Result type

Always use it across use cases, repositories, and ViewModels.

```typescript
// In use cases and repositories:
return Result.success(value);
return Result.failure(new AppError('message', 'ERROR_CODE'));

// In ViewModels:
const result = await this.useCase.execute(params);
if (result.isSuccess) { /* result.value */ }
else { /* result.error */ }
```

## Zustand store

One store per feature domain. Place in `src/presentation/state/`. Stores hold UI state only — no business logic.
