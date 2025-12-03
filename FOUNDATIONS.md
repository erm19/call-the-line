# Tennis Out Detection App – Mobile Foundation

This document defines core practices and structure for the cross-platform mobile app that uses the phone’s camera and AI to determine whether a tennis ball was out **in near real time (NRT)**.

---

## 1. Best Practices for Cross-Platform Camera App Development

### 1.1 Permissions & Privacy

- **Request permissions just-in-time**  
  Ask for camera (and microphone, if needed) access only when the user enters the camera feature, not at app launch.
- **Provide clear rationale**  
  Explain why the camera is needed ("We use the camera to capture rallies and help decide if balls were in or out in real time").
- **Handle denial gracefully**  
  - Show an educative screen if permission is denied.
  - Offer a clear path to open system settings and enable permissions.
- **Data minimization**  
  - Store only what’s necessary (e.g., short clips rather than full matches if possible).
  - Avoid unnecessary uploads; let users control what is sent to the cloud.

### 1.2 Camera Performance & Quality (NRT-Focused)

- **Choose NRT-friendly defaults**  
  - Resolution: balance between detail and file size (e.g., 720p or carefully tuned 1080p).
  - FPS: high frame rate preferred (ideally 60fps) to capture fast bounces, but with fallbacks.
- **Low-latency pipeline**  
  - Avoid heavy processing on the UI thread; use background workers / native modules.
  - Design for continuous streaming of frames to an inference pipeline (local or remote).
- **Device variability**  
  - Define minimum supported device capabilities (e.g., must support 60fps at 720p or equivalent).
  - Implement dynamic quality adjustment if the device can’t keep up (drop resolution before dropping FPS).
- **Orientation & aspect ratio**  
  - Lock orientation for the recording experience (usually landscape).
  - Ensure overlays adapt correctly to aspect ratio and safe areas.

### 1.3 Storage, Caching & Cleanup

- **Local storage strategy**  
  - Use a ring buffer approach if needed for NRT: keep only the last N seconds for decision-making.
  - Use app-private storage for recordings by default.
- **Cleanup policies**  
  - Provide “Clean up old clips” functionality.
  - Allow users to delete entire sessions.
- **Compression**  
  - Compress video before upload, especially over mobile networks.
  - Consider background uploads with retries and exponential backoff.

### 1.4 Reliability & Error Handling

- **Network resilience**  
  - NRT decision should **not depend** on network availability if possible (favor on-device or edge inference).
  - If cloud is used, clearly show when NRT is degraded because of poor connectivity.
- **Graceful failures**  
  - Camera unavailable, permission revoked mid-session, insufficient storage.
  - When NRT path fails, fall back to “post-point review” mode without blocking play.
- **Logging & diagnostics**  
  - Log capture start/stop, errors, dropped frames (where feasible).
  - Provide a debug mode for internal testing with frame timing stats and FPS.

### 1.5 AI Integration Practices

- **Separation of concerns**  
  - The mobile app should be agnostic to the internal AI implementation.
  - Communicate via stable, versioned APIs (e.g., `/v1/detect-out`).
- **NRT vs offline processing**  
  - Design two paths:
    - **NRT path:** limited-window buffer around bounce, aggressive time budget (e.g., < 500 ms end-to-end).
    - **Offline path:** full clip upload with richer analysis and higher accuracy.
- **On-device vs cloud**  
  - Aim for **on-device or near-edge** inference for the NRT path when possible.
  - Use cloud inference for offline / deeper analysis, training, and reprocessing.
- **Latency budgets**  
  - Define explicit budget for each step (capture → pre-processing → inference → render overlay).
  - Instrument the app to measure end-to-end latency in real usage.
- **Privacy**  
  - Make clear when clips are processed on-device vs in the cloud.
  - Allow users to delete their data and opt out of training usage where applicable.

---

## 2. Recommended Application Architecture

We use a **Clean Architecture + MVVM** approach, adapted for cross-platform (e.g., React Native + TypeScript, or Flutter). NRT constraints are treated as first-class non-functional requirements.

### 2.1 Layer Overview

1. **Presentation Layer**
   - Framework-specific UI (React Native components / Flutter widgets).
   - Screens, navigation stacks.
   - ViewModels (or equivalent state managers) exposing state and actions.
   - Handle NRT state such as: “live tracking active”, “decision pending”, “NRT degraded”.

2. **Domain Layer**
   - Pure business logic, independent of UI and platform.
   - Entities: Session, Clip, CourtCalibration, PointDecision, AIResult, **NRTConfig**, **LatencyMetrics**, etc.
   - Use Cases (Interactors):
     - `StartSession`, `EndSession`
     - `StartLiveTracking`, `StopLiveTracking`
     - `RecordClip`, `SaveCalibration`
     - `RunNRTDecisionPipeline`
     - `SubmitClipForOfflineAI`, `GetAIResult`
   - Repository interfaces (ports): `SessionRepository`, `ClipRepository`, `AIReviewRepository`, `NRTConfigRepository`, etc.

3. **Data Layer**
   - Implements repositories by composing:
     - Local data sources (SQLite/Room/CoreData/MMKV/AsyncStorage, file system).
     - Remote data sources (REST/GraphQL APIs).
   - Responsible for:
     - DTOs and mappers (DTO ↔ Domain Model).
     - Caching strategies.
     - Handling API errors and translating them into domain-level errors.
   - Should treat NRT path differently from bulk/offline uploads.

4. **Platform Layer**
   - Bridges to native capabilities:
     - Camera (with access to raw frames / high-FPS preview where possible).
     - Sensors (accelerometer, gyroscope) for camera stability detection.
     - File system.
     - Permissions.
   - Includes a dedicated **NRTCameraService** abstraction for:
     - Configuring high-FPS preview.
     - Providing frame streams to the NRT pipeline.
     - Managing a small rolling buffer around key moments.

5. **Cross-Cutting Concerns**
   - Configuration & environment (NRT tuning values per platform/device tier).
   - Logging & analytics (including latency metrics).
   - DI (dependency injection) or simple composition root.
   - Error handling and result types.

### 2.2 Architectural Principles

- **Dependency rule**  
  - Outer layers depend on inner layers, never the opposite.
  - Presentation → Domain → Data/Platform (via interfaces).
- **Testability**  
  - Domain and ViewModels should be testable without the actual camera or network.
  - NRT logic (e.g., frame-window selection, impact detection heuristics) should be unit-testable with synthetic input.
- **Incremental delivery**  
  - Each PRD increments domain + presentation in small, cohesive steps.
  - Keep the NRT path behind feature flags initially, then harden as metrics look good.
- **Feature modularization**  
  - Group code by feature (e.g., `sessions`, `camera`, `nrt`, `review`, `auth`) within the layered structure.

---

## 3. Project Folder/Directory Scaffolding

Example structure assuming **React Native + TypeScript + Clean Architecture**. The same concept can be mapped to Flutter or other stacks.

```text
root/
  android/
  ios/
  app.json
  package.json
  tsconfig.json

  /src
    /presentation
      /navigation
        AppNavigator.tsx
        types.ts
      /screens
        /Home
          HomeScreen.tsx
          HomeViewModel.ts
        /Camera
          CameraScreen.tsx
          CameraViewModel.ts
        /Session
          SessionListScreen.tsx
          SessionDetailScreen.tsx
        /Review
          ReviewScreen.tsx
          ReviewViewModel.ts
        /Auth
          LoginScreen.tsx
        /NRT
          NRTStatusBanner.tsx
      /components
        Button.tsx
        Icon.tsx
        Loader.tsx
        VideoPlayer.tsx
        CourtOverlay.tsx
        LatencyIndicator.tsx
      /state
        store.ts
        hooks.ts
      /theme
        colors.ts
        typography.ts
        spacing.ts
      /i18n
        index.ts
        en.json
        he.json

    /domain
      /entities
        Session.ts
        Clip.ts
        CourtCalibration.ts
        PointDecision.ts
        AIResult.ts
        NRTConfig.ts
        LatencyMetrics.ts
      /useCases
        StartSession.ts
        EndSession.ts
        RecordClip.ts
        SaveCalibration.ts
        GetSessions.ts
        SubmitClipForAI.ts
        GetAIResult.ts
        StartLiveTracking.ts
        StopLiveTracking.ts
        RunNRTDecisionPipeline.ts
      /repositories
        SessionRepository.ts
        ClipRepository.ts
        CalibrationRepository.ts
        AIReviewRepository.ts
        NRTConfigRepository.ts

    /data
      /datasources
        /local
          SessionLocalDataSource.ts
          ClipLocalDataSource.ts
          CalibrationLocalDataSource.ts
          NRTConfigLocalDataSource.ts
        /remote
          ApiClient.ts
          SessionRemoteDataSource.ts
          AIReviewRemoteDataSource.ts
      /models
        SessionDTO.ts
        ClipDTO.ts
        AIResultDTO.ts
        CalibrationDTO.ts
        NRTConfigDTO.ts
      /repositories
        SessionRepositoryImpl.ts
        ClipRepositoryImpl.ts
        CalibrationRepositoryImpl.ts
        AIReviewRepositoryImpl.ts
        NRTConfigRepositoryImpl.ts
      /mappers
        sessionMapper.ts
        clipMapper.ts
        calibrationMapper.ts
        aiResultMapper.ts
        nrtConfigMapper.ts

    /platform
      /camera
        CameraService.ts
        NRTCameraService.ts
        CameraConfig.ts
      /permissions
        PermissionService.ts
      /storage
        FileStorageService.ts
      /sensors
        MotionSensorService.ts

    /core
      /config
        env.ts
        constants.ts
      /utils
        result.ts
        date.ts
        validation.ts
      /errors
        AppError.ts
      /di
        container.ts
      /analytics
        AnalyticsService.ts

    /tests
      /unit
      /integration
      /e2e
```

### 3.1 Feature Modules (Example)

You can further introduce a feature-based structure while keeping layers inside each feature:

```text
/src/features
  /sessions
    /presentation
      SessionListScreen.tsx
      SessionDetailScreen.tsx
    /domain
      entities/Session.ts
      useCases/GetSessions.ts
    /data
      repositories/SessionRepositoryImpl.ts
      datasources/SessionLocalDataSource.ts
  /camera
  /review
  /auth
  /nrt
```

This works well once the app grows and you want to isolate features.

---

## 4. NRT-Focused Initial Setup Checklist

1. Choose cross-platform stack (e.g., React Native + TypeScript).
2. Initialize project (`npx react-native init` or `npx create-expo-app`).
3. Apply folder structure and base tooling:
   - ESLint/Prettier.
   - Jest + basic test.
4. Implement DI / container wiring for:
   - Repositories.
   - Camera service and NRT camera service.
   - Storage service.
5. Implement empty shells for:
   - Core entities (Session, Clip, CourtCalibration, NRTConfig).
   - Core use cases (StartSession, StartLiveTracking, RunNRTDecisionPipeline).
6. Implement base navigation and empty screens for:
   - Home, Camera, Sessions, Review, NRT status UI.
7. Configure platform-specific permissions and build the app on real devices.
8. Add simple FPS and latency logging to validate that the NRT baseline is achievable on target devices.
