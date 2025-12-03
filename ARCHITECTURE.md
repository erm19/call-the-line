# Call The Line - Architecture Documentation

## Overview

Call The Line is a tennis line call detection app built with React Native, using Clean Architecture principles combined with MVVM pattern. The app is designed for Near Real-Time (NRT) ball tracking and AI-powered line call assistance.

## Architecture Principles

### Clean Architecture + MVVM

The application follows Clean Architecture with clear separation of concerns across layers:

```
┌─────────────────────────────────────────────────────┐
│              Presentation Layer                      │
│  (UI, Navigation, ViewModels, State Management)     │
└────────────────┬────────────────────────────────────┘
                 │ depends on
┌────────────────▼────────────────────────────────────┐
│               Domain Layer                           │
│     (Entities, Use Cases, Repository Interfaces)    │
└────────────────┬────────────────────────────────────┘
                 │ implements
┌────────────────▼────────────────────────────────────┐
│          Data & Platform Layers                      │
│  (Repository Impls, Data Sources, Platform Services)│
└─────────────────────────────────────────────────────┘
```

### Dependency Rule

**Outer layers depend on inner layers, never the reverse.**

- Presentation → Domain
- Data → Domain (implements interfaces)
- Platform → Domain (implements interfaces)

## Layer Details

### 1. Presentation Layer (`/src/presentation`)

**Responsibility:** UI, user interaction, and presentation logic

**Components:**
- **Screens:** React components for each screen (Home, Camera, Session, Review)
- **Navigation:** React Navigation setup with type-safe routing
- **Components:** Reusable UI components (Button, Loader, etc.)
- **ViewModels:** State management and business logic coordination
- **Theme:** Colors, typography, spacing constants
- **i18n:** Internationalization support

**Key Patterns:**
- MVVM: ViewModels handle state and coordinate use cases
- Type-safe navigation with TypeScript
- Theming system for consistent UI

### 2. Domain Layer (`/src/domain`)

**Responsibility:** Pure business logic, independent of frameworks

**Components:**

#### Entities (`/src/domain/entities`)
Core domain models representing business concepts:
- `Session` - Recording session
- `Clip` - Video clip
- `CourtCalibration` - Court geometry calibration
- `PointDecision` - Line call decision
- `AIResult` - AI analysis result
- `NRTConfig` - NRT settings
- `LatencyMetrics` - Performance metrics

#### Use Cases (`/src/domain/useCases`)
Application business rules:
- `StartSession` / `EndSession` - Session lifecycle
- `RecordClip` - Clip recording
- `SaveCalibration` - Court calibration
- `SubmitClipForAI` / `GetAIResult` - AI processing
- `StartLiveTracking` / `StopLiveTracking` - NRT control
- `RunNRTDecisionPipeline` - Real-time decision making

#### Repository Interfaces (`/src/domain/repositories`)
Contracts for data access (ports):
- `SessionRepository`
- `ClipRepository`
- `CalibrationRepository`
- `AIReviewRepository`
- `NRTConfigRepository`

**Key Patterns:**
- Repository pattern for data abstraction
- Use case pattern for business logic encapsulation
- Result type for explicit error handling

### 3. Data Layer (`/src/data`)

**Responsibility:** Data persistence and remote communication

**Components:**

#### Data Sources
- **Local:** AsyncStorage-based persistence
  - `SessionLocalDataSource`
  - `ClipLocalDataSource`
  - `CalibrationLocalDataSource`
  - `NRTConfigLocalDataSource`

- **Remote:** API client and remote data sources
  - `ApiClient` - HTTP client with timeout and error handling
  - `AIReviewRemoteDataSource` - AI processing API

#### Models (DTOs)
Data Transfer Objects for serialization:
- `SessionDTO`, `ClipDTO`, `CalibrationDTO`, etc.
- Snake_case for API compatibility

#### Mappers
Bidirectional conversion between DTOs and Domain Entities:
- `sessionMapper`, `clipMapper`, etc.

#### Repository Implementations
Concrete implementations of domain repository interfaces:
- `SessionRepositoryImpl`
- `ClipRepositoryImpl`
- `NRTConfigRepositoryImpl`

**Key Patterns:**
- DTO pattern for data transfer
- Mapper pattern for DTO ↔ Entity conversion
- Repository implementation pattern

### 4. Platform Layer (`/src/platform`)

**Responsibility:** Native platform capabilities and hardware access

**Services:**

#### Camera (`/src/platform/camera`)
- `CameraService` - Standard video recording
- `NRTCameraService` - High-FPS frame streaming for NRT
- `CameraConfig` - Camera configuration types
- **Ultra-wide camera preferred** for full court capture

#### Permissions (`/src/platform/permissions`)
- `PermissionService` - Permission request and status checking

#### Storage (`/src/platform/storage`)
- `FileStorageService` - File system operations

#### Sensors (`/src/platform/sensors`)
- `MotionSensorService` - Accelerometer/gyroscope for camera stability

**Key Patterns:**
- Service interface pattern
- Platform abstraction for testability

### 5. Core Layer (`/src/core`)

**Responsibility:** Cross-cutting concerns and utilities

**Components:**

#### Config
- `env.ts` - Environment configuration
- `constants.ts` - App-wide constants including NRT timing budgets

#### Utils
- `result.ts` - Result<T, E> type for error handling
- `date.ts` - Date formatting utilities
- `validation.ts` - Zod-based validation

#### Errors
- `AppError` - Base error class
- Specialized errors: `NetworkError`, `CameraError`, `PermissionError`, `NRTError`, etc.

#### DI (Dependency Injection)
- `container.ts` - tsyringe-based DI container
- `DI_TOKENS` - Injection tokens

#### Analytics
- `AnalyticsService` - Event tracking and error logging

## Key Design Patterns

### 1. Result Type Pattern

Explicit error handling without exceptions:

```typescript
type Result<T, E> = Success<T> | Failure<E>;

// Usage
const result = await sessionRepository.getById(id);
if (result.isSuccess) {
  // Use result.value
} else {
  // Handle result.error
}
```

### 2. Dependency Injection

Constructor-based DI using tsyringe:

```typescript
export class StartSession {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly analyticsService: IAnalyticsService,
  ) {}
}
```

### 3. Repository Pattern

Abstract data access through interfaces:

```typescript
interface SessionRepository {
  create(session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<Session, AppError>>;
  getById(id: string): Promise<Result<Session, AppError>>;
  // ...
}
```

## NRT (Near Real-Time) Architecture

### NRT Requirements

- **Target Latency:** < 500ms end-to-end
- **Target FPS:** 60fps capture
- **Camera:** Ultra-wide angle preferred for full court view
- **Buffer:** 3-second rolling window

### NRT Pipeline Stages

1. **Capture** (50ms budget)
   - High-FPS camera capture
   - Frame buffering

2. **Preprocessing** (100ms budget)
   - Frame extraction
   - Court perspective correction

3. **Inference** (250ms budget)
   - Ball detection
   - Trajectory analysis
   - Bounce detection

4. **Render** (100ms budget)
   - Decision overlay
   - Visual feedback

### NRT Configuration

`NRTConfig` entity controls:
- Mode: `on_device`, `edge`, or `cloud`
- Auto quality adjustment based on performance
- Device tier detection
- Confidence thresholds

## Error Handling Strategy

### Error Types

1. **Domain Errors:** Business rule violations
2. **Infrastructure Errors:** Network, storage, camera failures
3. **Validation Errors:** Input validation failures

### Error Flow

```
Use Case → Result<T, AppError> → ViewModel → UI
```

All errors are:
- Typed and structured
- Logged via AnalyticsService
- Displayed with user-friendly messages via i18n

## State Management

State management approach is intentionally flexible:
- ViewModels manage local screen state
- Global state (if needed) can use Zustand, Redux Toolkit, or MobX
- Repository layer handles data caching

## Testing Strategy

### Unit Tests
- Domain layer: Use cases, entities
- Data layer: Mappers, data sources
- Utilities: Result type, validators

### Integration Tests
- Repository implementations
- Use case + repository integration

### E2E Tests
- Critical user flows
- Camera recording flow
- Session creation and review

## File Organization

```
/src
  /presentation     # UI layer
    /screens        # Screen components
    /components     # Reusable components
    /navigation     # Navigation setup
    /theme          # Design system
    /i18n           # Translations
  /domain           # Business logic
    /entities       # Domain models
    /useCases       # Business operations
    /repositories   # Data contracts
  /data             # Data persistence
    /datasources    # Local & remote sources
    /models         # DTOs
    /mappers        # DTO ↔ Entity
    /repositories   # Repository implementations
  /platform         # Native capabilities
    /camera         # Camera services
    /permissions    # Permission handling
    /storage        # File system
    /sensors        # Motion sensors
  /core             # Cross-cutting
    /config         # Configuration
    /utils          # Utilities
    /errors         # Error types
    /di             # Dependency injection
    /analytics      # Analytics service
  /tests            # Tests
    /unit           # Unit tests
    /integration    # Integration tests
    /e2e            # End-to-end tests
    /__mocks__      # Test mocks
```

## Technology Stack

- **Framework:** React Native (bare workflow)
- **Language:** TypeScript (strict mode)
- **Navigation:** React Navigation
- **State:** Zustand (or Redux Toolkit / MobX)
- **Camera:** react-native-vision-camera
- **Storage:** AsyncStorage + File System
- **DI:** tsyringe
- **Validation:** Zod
- **Testing:** Jest
- **Linting:** ESLint + Prettier

## Development Guidelines

### Code Quality

1. **TypeScript strict mode** - No `any` types
2. **SOLID principles** - Single responsibility, interface segregation
3. **Explicit error handling** - Use Result type
4. **Comprehensive JSDoc** - Document all public interfaces
5. **Consistent naming** - PascalCase for classes, camelCase for methods

### Performance Considerations

1. **NRT latency budgets** must be respected
2. **Frame dropping** before resolution dropping
3. **Background processing** for heavy operations
4. **Lazy loading** for screens and large components
5. **Memoization** for expensive computations

### Security Considerations

1. **Just-in-time permissions** - Request only when needed
2. **Data minimization** - Store only necessary data
3. **Local processing** preferred for privacy
4. **Secure API communication** - HTTPS only
5. **User data control** - Clear deletion paths

## Future Considerations

### Planned Enhancements

1. **SQLite integration** for better local storage
2. **TensorFlow Lite** for on-device inference
3. **Background video processing** for offline clips
4. **Cloud sync** for session backup
5. **Multi-camera support** for different angles
6. **Real-time collaboration** for shared sessions

### Scalability

- Modular architecture allows easy feature addition
- Clean separation enables team parallelization
- Interface-based design facilitates testing
- Repository pattern allows storage migration

## References

- [FOUNDATIONS.md](./FOUNDATIONS.md) - Core practices and NRT requirements
- [React Native Documentation](https://reactnative.dev/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [react-native-vision-camera](https://github.com/mrousavy/react-native-vision-camera)

