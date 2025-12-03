# Call The Line

AI-powered tennis line call detection app with Near Real-Time (NRT) ball tracking.

## Features

- 🎾 **Near Real-Time Ball Tracking** - Live ball tracking with < 500ms latency
- 📹 **High-FPS Recording** - 60fps video capture with ultra-wide camera
- 🤖 **AI-Powered Decisions** - Accurate line call detection
- 📊 **Session Management** - Track and review multiple tennis sessions
- 🎯 **Court Calibration** - Automatic court boundary detection
- 📱 **Cross-Platform** - iOS and Android support

## Architecture

This project follows **Clean Architecture + MVVM** principles with a focus on:

- **Testability** - Interface-based design with dependency injection
- **Maintainability** - Clear separation of concerns across layers
- **Performance** - Optimized for real-time camera processing
- **Type Safety** - TypeScript strict mode throughout

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## Project Structure

```
/src
  /presentation  # UI layer (React components, screens, navigation)
  /domain        # Business logic (entities, use cases, repositories)
  /data          # Data layer (API, local storage, DTOs)
  /platform      # Platform services (camera, permissions, sensors)
  /core          # Utilities, config, DI, errors
  /tests         # Unit, integration, and E2E tests
```

## Setup

### Prerequisites

- Node.js >= 18
- npm >= 9
- React Native development environment
- iOS: Xcode and CocoaPods
- Android: Android Studio and SDK

### Installation

```bash
# Install dependencies
npm install

# iOS: Install CocoaPods
cd ios && pod install && cd ..
```

### Running the App

```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Development

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Testing
npm test

# Format code
npm run format
```

## Tech Stack

- **Framework:** React Native (bare workflow)
- **Language:** TypeScript
- **Navigation:** React Navigation
- **Camera:** react-native-vision-camera
- **Storage:** AsyncStorage
- **DI:** tsyringe
- **State:** Zustand
- **Testing:** Jest

## NRT Configuration

The app is optimized for Near Real-Time processing with:

- **Target FPS:** 60fps (fallback to 30fps)
- **Resolution:** 1280x720 (720p)
- **Max Latency:** 500ms end-to-end
- **Buffer Window:** 3 seconds
- **Camera:** Ultra-wide angle preferred

These settings can be adjusted in `src/core/config/constants.ts`.

## Development Guidelines

1. **Follow Clean Architecture** - Respect layer boundaries
2. **Use TypeScript strictly** - No `any` types
3. **Explicit error handling** - Use Result<T, E> type
4. **Write tests** - Unit tests for domain layer
5. **Document with JSDoc** - All public interfaces

## Contributing

This is a personal project, but feedback and suggestions are welcome!

## License

ISC

## Author

Eyal Moskowitz

---

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

For foundational principles and NRT requirements, see [FOUNDATIONS.md](./FOUNDATIONS.md).

