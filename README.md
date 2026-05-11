# حسابي (Hasabi) — Personal Finance Tracker

A production-grade personal expense tracking app built with **Domain-Driven Design (DDD)**, **React Native (Expo)**, and **TypeScript strict**.

---

## Architecture: Domain-Driven Design

```
src/
├── domain/              ← Pure business logic. NO React, NO AsyncStorage, NO framework.
│   ├── shared/          ← Base Entity, ValueObject, Money, UniqueId
│   ├── transaction/     ← Transaction aggregate, Category, TransactionType
│   ├── goal/            ← SavingsGoal aggregate, GoalType
│   └── budget/          ← Budget aggregate (future)
│
├── application/         ← Use cases & DTOs. Orchestrates domain. Returns Result<T>.
│   ├── shared/          ← Result monad
│   ├── transaction/     ← AddTransaction, GetStats, Export use cases
│   └── goal/            ← CreateGoal, Deposit, Withdraw use cases
│
├── infrastructure/      ← I/O implementations (AsyncStorage, file export).
│   ├── persistence/     ← AsyncStorage repositories (implement domain interfaces)
│   └── export/          ← CSV / JSON export services
│
├── presentation/        ← React Native UI. Uses application layer only.
│   ├── theme/           ← Design tokens (colors, typography, spacing, animations)
│   ├── navigation/      ← React Navigation setup
│   ├── store/           ← Zustand stores (call use cases, hold UI state)
│   ├── components/      ← Reusable UI + domain components
│   └── screens/         ← One folder per screen
│
├── i18n/                ← Arabic first, built for worldwide expansion
└── container.ts         ← Dependency injection (wires infra → use cases)
```

### Key DDD Principles Applied

| Principle | Implementation |
|-----------|---------------|
| Aggregate roots | `Transaction`, `SavingsGoal`, `Budget` |
| Value objects | `Money`, `UniqueId`, `Category`, `GoalType` |
| Repository pattern | `ITransactionRepository` (domain interface) → `AsyncStorageTransactionRepository` (infra impl) |
| Use cases | Single responsibility, return `Result<T>` not exceptions |
| DI Container | `src/container.ts` — swap storage engine without touching domain |
| Domain services | `TransactionDomainService` — business logic spanning multiple entities |

---

## Tech Stack

| Concern | Library |
|---------|---------|
| Framework | Expo SDK 52 + React Native 0.76 |
| Language | TypeScript 5 (strict) |
| State | Zustand 5 |
| Navigation | React Navigation v7 |
| Animations | Reanimated 3 + Moti |
| Forms | React Hook Form + Zod |
| Storage | AsyncStorage |
| Charts | Victory Native |
| Icons | Phosphor React Native |
| i18n | i18next |
| Date | date-fns |
| Haptics | expo-haptics |
| Export | expo-file-system + expo-sharing |

---

## Setup

### Prerequisites
- Node.js 20+
- VS Code with ESLint + Prettier extensions
- Expo Go on your Android phone (for development)
- EAS CLI for APK builds: `npm install -g eas-cli`

### Install

```bash
cd hasabi
npm install
```

### Run in development

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone.

### Build APK

```bash
# Login to EAS
eas login

# Initialize project (first time only)
eas build:configure

# Build preview APK (unsigned, for testing)
eas build --platform android --profile preview

# Build production APK (signed, for Play Store)
eas build --platform android --profile production
```

### EAS profiles (eas.json — create this file)

```json
{
  "cli": { "version": ">= 7.0.0" },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

---

## Screens

| Screen | Path |
|--------|------|
| Home Dashboard | `screens/home/HomeScreen.tsx` |
| Add Transaction | `screens/add-transaction/AddTransactionScreen.tsx` |
| Statistics | `screens/statistics/StatisticsScreen.tsx` |
| Savings Goals | `screens/goals/GoalsScreen.tsx` |
| Settings | `screens/settings/SettingsScreen.tsx` |

---

## Design System

All design tokens live in `src/presentation/theme/index.ts`:

- **Colors** — primary blue, income green, expense red, category colors
- **Typography** — Tajawal font (Arabic), defined type scale
- **Spacing** — 4px base grid (4, 8, 12, 16, 20, 24, 32, 40, 48, 64)
- **Radius** — sm(8) md(12) lg(16) xl(20) 2xl(24) full
- **Shadows** — Platform-aware (iOS shadow, Android elevation)
- **Animations** — Spring configs (gentle, bouncy, snappy) + Moti presets

---

## Adding a New Feature (DDD Flow)

1. **Domain** — Add entity/value object/service in `src/domain/`
2. **Repository interface** — Define in `src/domain/.../repositories/`
3. **Use case** — Implement in `src/application/.../use-cases/`
4. **Repository implementation** — Implement in `src/infrastructure/persistence/`
5. **Wire** — Add to `src/container.ts`
6. **Store** — Call use case from Zustand store in `src/presentation/store/`
7. **UI** — Build screen/component in `src/presentation/`

---

## Future Roadmap (Google Play worldwide)

- [ ] Multi-currency support (EUR, USD)
- [ ] Add French + English translations (i18n already wired)
- [ ] Dark mode (theme tokens ready)
- [ ] Push notifications for recurring charges
- [ ] Receipt photo attachments
- [ ] Budget limits per category
- [ ] Cloud backup / sync
- [ ] Widget (Android home screen)

---

## Project by Abdo
Built with ❤️ using Claude + DDD principles.
