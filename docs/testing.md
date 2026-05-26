# Testing

## Mock only at system boundaries

- HTTP calls → mock `ApiClient`
- AsyncStorage → mock `@react-native-async-storage/async-storage`
- File system → mock `FileStorageService`

Never mock use cases, domain logic, or mappers — test them directly.

## Post-implementation verification

Run in order after any implementation:

```bash
npm test
npm run typecheck
npm run lint
```

Fix all errors before marking complete.
