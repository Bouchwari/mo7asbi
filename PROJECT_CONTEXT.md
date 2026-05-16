# Hasabi (حسابي) — Project Context & Build Log

> Use this file to onboard any AI assistant, build a prompt, or resume work after a context reset.

---

## 1. What Is This Project?

**Hasabi** (Arabic: حسابي — "my account") is a **production-grade personal finance tracker for Android**, built by a solo developer (Bouchwari / Abdullah Bouchwari). The goal is to publish it on Google Play.

| Key | Value |
|-----|-------|
| App name | حسابي (Hasabi) |
| Platform | Android only (Expo 52 + React Native 0.76) |
| Language | TypeScript — strict mode, zero `any` |
| Architecture | Domain-Driven Design (DDD) — strict layer isolation |
| UI locale | Arabic (RTL) — all text is Arabic, layout is right-to-left |
| Currency | MAD (Moroccan Dirham) — multi-currency ready |
| Font | Tajawal (Google Fonts) — must be on every `Text` component |
| State management | Zustand 5 |
| Animations | Moti (declarative) + Reanimated (gesture/imperative) |
| Persistence | AsyncStorage |
| i18n | react-i18next — single source of truth: `src/i18n/locales/ar.ts` |
| Build | GitHub Actions → `assembleRelease` → APK artifact |
| Repo | https://github.com/Bouchwari/mo7asbi |

---

## 2. Architecture: DDD Layer Map

```
src/
├── domain/                     ← ZERO external deps. Pure TypeScript business logic.
│   ├── shared/
│   │   ├── Entity.ts           ← Base class: equality by ID
│   │   ├── ValueObject.ts      ← Base class: equality by value, immutable
│   │   └── value-objects/
│   │       ├── UniqueId.ts     ← Wraps UUID string
│   │       └── Money.ts        ← Amount + currency, safe arithmetic
│   ├── transaction/
│   │   ├── entities/
│   │   │   └── Transaction.ts  ← Aggregate root
│   │   ├── value-objects/
│   │   │   └── Category.ts     ← CategoryId enum + CATEGORIES map + Category VO
│   │   ├── repositories/
│   │   │   └── ITransactionRepository.ts  ← Port (interface only)
│   │   └── services/
│   │       └── TransactionDomainService.ts ← Pure stats computation
│   └── goal/
│       └── entities/
│           └── SavingsGoal.ts  ← Aggregate with deposit/withdraw behavior
│
├── application/
│   ├── shared/
│   │   └── Result.ts           ← Result<T,E> monad — no exceptions
│   ├── transaction/
│   │   └── use-cases/
│   │       ├── AddTransactionUseCase.ts
│   │       └── GetTransactionStatsUseCase.ts
│   └── goal/
│       └── use-cases/
│           └── GoalUseCases.ts  ← CreateGoal, DepositToGoal
│
├── infrastructure/
│   └── persistence/
│       ├── AsyncStorageTransactionRepository.ts
│       └── AsyncStorageGoalRepository.ts
│
├── presentation/
│   ├── theme/index.ts          ← ALL design tokens live here
│   ├── navigation/RootNavigator.tsx
│   ├── store/
│   │   └── transactionStore.ts ← Zustand store, calls use cases
│   ├── components/
│   │   ├── ui/index.tsx        ← AnimatedCard, Button, EmptyState, ScreenWrapper
│   │   └── domain/
│   │       └── TransactionListItem.tsx
│   └── screens/
│       ├── home/HomeScreen.tsx
│       ├── add-transaction/AddTransactionScreen.tsx
│       ├── statistics/StatisticsScreen.tsx
│       ├── settings/SettingsScreen.tsx
│       └── goals/GoalsScreen.tsx
│
├── i18n/
│   ├── index.ts
│   └── locales/ar.ts           ← Single source of truth for all Arabic text
│
└── container.ts                ← DI: wires infra → use cases
```

### Layer Isolation Rules (CRITICAL)
- **domain/** → zero imports from React Native, AsyncStorage, Expo, or any library
- **application/** → imports only from `domain/`
- **infrastructure/** → imports from `domain/` and `application/` only
- **presentation/** → imports from `application/`, uses `container.ts` for use cases — never calls repositories directly

### Path Aliases
```typescript
@domain/*       → src/domain/*
@application/*  → src/application/*
@infrastructure/* → src/infrastructure/*
@presentation/* → src/presentation/*
@i18n/*         → src/i18n/*
```
Always use aliases — never relative cross-layer imports.

---

## 3. What's Been Built

### Screens
| Screen | File | Status |
|--------|------|--------|
| Home | `src/presentation/screens/home/HomeScreen.tsx` | ✅ Complete — hero balance card, month nav, recent transactions list |
| Add Transaction | `src/presentation/screens/add-transaction/AddTransactionScreen.tsx` | ✅ Complete — EXPENSES/INCOME tabs, large amount input, circular category grid (3-col), today/yesterday date chips, note input |
| Statistics | `src/presentation/screens/statistics/StatisticsScreen.tsx` | ✅ Complete — ring donut chart (CSS border trick), EXPENSES/INCOME tabs, month navigation, animated category bars, income-by-category computed from transactions |
| Settings | `src/presentation/screens/settings/SettingsScreen.tsx` | ✅ Complete — icon-box + label + value + chevron rows, app identity card |
| Goals | `src/presentation/screens/goals/GoalsScreen.tsx` | ✅ Complete — goal cards with Reanimated progress bars, deposit bottom sheet |

### Domain / Application / Infrastructure
- Transaction entity + Money VO + Category VO/enum — ✅
- SavingsGoal entity with deposit behavior — ✅
- All use cases: AddTransaction, GetTransactionStats, CreateGoal, DepositToGoal — ✅
- AsyncStorage repositories for transactions and goals — ✅
- DI container wiring — ✅
- Zustand transaction store with month-based loading — ✅

### CI / Build
- GitHub Actions workflow (`.github/workflows/build.yml`) — ✅
- Builds release APK, arm64-v8a only (~25 MB), throwaway keystore signing
- Triggered on every push to `main`

---

## 4. Key Design Decisions

### Ring/Donut Chart Without SVG
`react-native-svg` is not installed. A donut ring is created by:
```tsx
<View style={{
  width: 190, height: 190, borderRadius: 95,
  borderWidth: 26, borderColor: accentColor,
  alignItems: 'center', justifyContent: 'center',
}}>
  <Text>{totalFormatted}</Text>
</View>
```
No Victory Native, no SVG dependency needed.

### Income-by-Category (Not in MonthStats)
`TransactionDomainService.computeMonthStats` only populates `byCategory` for **expense** transactions. For the Statistics screen income tab, income breakdown is computed in the presentation layer:
```typescript
const incomeByCat = useMemo((): Map<CategoryId, Money> => {
  const map = new Map<CategoryId, Money>();
  for (const tx of transactions) {
    if (!tx.isIncome) continue;
    map.set(tx.category.id, (map.get(tx.category.id) ?? Money.zero('MAD')).add(tx.amount));
  }
  return map;
}, [transactions]);
```

### Animated Category List Re-entry on Tab Switch
Moti's `from/animate` only fires on mount. To re-animate category rows when switching EXPENSES ↔ INCOME tabs:
```tsx
<MotiView key={`${activeTab}-${catId}`} ...>
```
The composite key forces React to unmount/remount each row, triggering the entrance animation again.

### Arabic Month Names (Hermes-Safe)
Hermes JS engine has limited `Intl` support. `toLocaleString('ar-MA')` and `Intl.DateTimeFormat` with Arabic locale crash. Use a static array instead:
```typescript
const ARABIC_MONTHS = [
  'يناير','فبراير','مارس','أبريل','مايو','يونيو',
  'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر',
] as const;
```

### Animated Progress Bars (Goals)
Use Reanimated (not Moti) for progress bars:
```typescript
const widthAnim = useSharedValue(0);
useEffect(() => {
  widthAnim.value = withSpring(percentage, animations.spring.gentle);
}, [percentage]);
const animStyle = useAnimatedStyle(() => ({ width: `${widthAnim.value}%` }));
```

---

## 5. Errors & Fixes Encountered

### 1. `colors.expense[300]` / `colors.expense[400]` — TypeScript Error TS7053
**Problem:** Used non-existent color shades for tab indicator and active tab label colors.
**Cause:** The theme only defines expense/income with shades: `50, 100, 500, 600, 700`. Shades 300 and 400 do not exist.
**Fix:** Changed to `colors.expense[100]` and `colors.income[100]` for the light tab label/indicator colors.

### 2. Hermes `crypto.getRandomValues` Crash
**Problem:** UUID generation using `crypto.getRandomValues` crashes on Hermes JS engine.
**Fix:** `UniqueId.ts` uses a custom random string fallback compatible with Hermes.

### 3. Hermes `Intl` / Arabic Locale Crash
**Problem:** `date.toLocaleString('ar-MA')` or `Intl.DateTimeFormat` with Arabic locale crashes on Hermes.
**Fix:** Use `date-fns` with `{ locale: arLocale }` for dates; use static `ARABIC_MONTHS` array for month names; never call `.toLocaleString('ar-MA')` on numbers.

### 4. Moti Category List Not Re-Animating on Tab Switch
**Problem:** When switching between EXPENSES and INCOME tabs, category rows didn't re-animate because Moti only runs `from→animate` on mount.
**Fix:** Use composite key `key={`${activeTab}-${catId}`}` to force remount on tab change.

### 5. Animated Bar Width Type Error
**Problem:** TypeScript rejected `width: '0%'` and `width: \`${pct}%\`` in Moti animate props.
**Fix:** Use explicit type assertions: `width: '0%' as const` and `width: \`${Math.round(pct)}%\` as \`${number}%\``.

### 6. NDK Missing in CI Build
**Problem:** GitHub Actions build failed — Android NDK not installed.
**Fix:** Added NDK install step to workflow; added `-Xmx4g` JVM args to prevent Gradle OOM.

### 7. Corrupt Placeholder PNG Assets
**Problem:** Build failed because placeholder image files were corrupt/empty.
**Fix:** Replaced with valid minimal PNG files.

---

## 6. Theme Quick Reference

```typescript
// Colors — expense/income ONLY have shades: 50, 100, 500, 600, 700
// primary has: 50, 100, 200, 400, 500, 600, 700, 800, 900
// gray has: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
colors.primary[600]       // #2563EB — main blue
colors.expense[600]       // #DC2626 — expense red
colors.expense[100]       // light red (use for active tab labels on dark bg)
colors.income[600]        // #16A34A — income green
colors.income[100]        // light green
colors.amber[600]         // #D97706 — warning / savings
colors.text.primary       // #0F172A
colors.text.secondary     // #475569
colors.text.tertiary      // #94A3B8
colors.background.app     // #F8FAFC — screen background
colors.background.card    // #FFFFFF — card background
colors.border.default     // #E2E8F0
colors.white              // #FFFFFF

// Typography — ALWAYS set fontFamily on every Text
typography.fonts.regular  // 'Tajawal_400Regular'
typography.fonts.medium   // 'Tajawal_500Medium'
typography.fonts.bold     // 'Tajawal_700Bold'
typography.sizes.xs       // 11
typography.sizes.sm       // 13
typography.sizes.base     // 15
typography.sizes.md       // 17
typography.sizes.lg       // 20
typography.sizes.xl       // 24

// Spacing (multiples of 4px)
spacing[1]=4  spacing[2]=8  spacing[3]=12  spacing[4]=16
spacing[5]=20 spacing[6]=24 spacing[8]=32  spacing[10]=40

// Radius
radius.sm=8  radius.md=12  radius.lg=16  radius.xl=20  radius.full=9999

// Animation springs
animations.spring.gentle  // { damping: 20, stiffness: 120, mass: 0.8 }
animations.spring.bouncy  // { damping: 14, stiffness: 160, mass: 0.8 }
animations.spring.snappy  // { damping: 24, stiffness: 200, mass: 0.6 }
```

---

## 7. Non-Negotiable Code Rules

```typescript
// ❌ Never hardcode colors
style={{ color: '#DC2626' }}
// ✅ Always use theme tokens
style={{ color: colors.expense[600] }}

// ❌ Never hardcode Arabic text in components
<Text>إضافة معاملة</Text>
// ✅ Always use i18n
const { t } = useTranslation();
<Text>{t('transaction.add')}</Text>

// ❌ Never call repositories from screens/stores directly
const txs = await container.transactionRepository.findAll();
// ✅ Call use cases via store only
const { transactions } = useTransactionStore();

// ❌ Never throw in use cases
throw new Error('invalid amount');
// ✅ Return Result.fail
return Result.fail('المبلغ غير صالح');

// ❌ Never import React Native in domain layer
import { Platform } from 'react-native'; // NEVER in src/domain/

// ❌ Never use relative cross-layer imports
import { Money } from '../../../domain/shared/value-objects/Money';
// ✅ Always use path aliases
import { Money } from '@domain/shared/value-objects/Money';

// ❌ RTL — never forget row-reverse
style={{ flexDirection: 'row' }}
// ✅
style={{ flexDirection: 'row-reverse' }}

// ❌ Never hardcode pixel spacing
style={{ padding: 16 }}
// ✅
style={{ padding: spacing[4] }}

// ❌ Never omit fontFamily on Text
<Text style={{ fontSize: 16 }}>
// ✅
<Text style={{ fontFamily: typography.fonts.regular, fontSize: typography.sizes.base }}>

// ❌ Never use 'any'
const data: any = response;
// ✅ Use unknown + type guards
const data: unknown = response;

// ❌ Zero inline static styles in JSX
<View style={{ padding: 16, backgroundColor: '#fff' }}>
// ✅ All static styles in StyleSheet.create({}) at bottom of file
// Exception: truly dynamic values like { width: `${pct}%` } are OK inline
```

---

## 8. i18n Keys (ar.ts)

```typescript
home:        { balance, income, expense, recent, emptyTitle, emptySubtitle }
transaction: { add, save, expense, income, amount, category, note, notePlaceholder, date, today, yesterday }
goals:       { title, newGoal, create, deposit, add, namePlaceholder, targetPlaceholder, emptyTitle, emptySubtitle }
stats:       { title, byCategory, totalTransactions, emptyTitle, emptySubtitle }
settings:    { title, general, about, currency, language, version, tagline, madeWith, platform }
categories:  { food, transport, shopping, entertainment, health, education, housing, bills, other_expense, salary, freelance, gift, savings, other_income }
errors:      { invalidAmount, fillRequired, generic }
```

---

## 9. Haptic Feedback Rules

```typescript
// Primary button press
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
// Success (save, goal completed)
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
// Error
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
// Selection (toggle, category tap, tab switch)
Haptics.selectionAsync()
```

---

## 10. What's Left to Build (Priority Order)

1. **TransactionsScreen** — full paginated list of all transactions, filter by category chip bar, swipe-to-delete
2. **GoalStore improvements** — Zustand store for goals mirroring transactionStore pattern
3. **Budget domain** — `Budget` entity, `IBudgetRepository`, `SetBudgetUseCase`, UI in SettingsScreen
4. **RecurringCharges** — manage recurring expenses, surface pending on HomeScreen dashboard
5. **QuickTemplates** — save and reuse common transactions in one tap
6. **ExportService** — CSV + JSON export via `expo-file-system` + `expo-sharing`
7. **Salary input** — settings field to record monthly salary, show savings rate on HomeScreen
8. **Play Store prep** — app icon, splash screen, `eas.json` production profile, signed AAB

---

## 11. GitHub Actions CI

File: `.github/workflows/build.yml`

What it does:
1. Checkout + Node 20 + Java 17
2. Accept Android SDK licenses
3. `npm install --legacy-peer-deps`
4. `npx tsc --noEmit` (TypeScript check must pass)
5. `npx expo prebuild --platform android --clean`
6. Patch `android/app/build.gradle` to restrict ABI to `arm64-v8a` (cuts APK from ~140MB to ~25MB)
7. Generate throwaway signing keystore (not for Play Store)
8. `./gradlew assembleRelease` with signing params
9. Upload APK artifact (`hasabi-release`, 30-day retention)

Triggers: push to `main` or manual `workflow_dispatch`.

---

## 12. Running Locally

```bash
# Start dev server
npx expo start

# TypeScript check (no build)
npx tsc --noEmit

# Build APK (preview, EAS)
eas build --platform android --profile preview

# Build AAB for Play Store (signed)
eas build --platform android --profile production
```

---

## 13. Screen UI Pattern Template

Every screen follows this structure:

```tsx
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useTranslation } from 'react-i18next';
import { theme } from '@presentation/theme';

const { colors, spacing, radius, typography, animations } = theme;

export default function ExampleScreen(): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <MotiView
        from={{ opacity: 0, translateY: -8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', ...animations.spring.gentle }}
        style={styles.header}
      >
        <Text style={styles.title}>{t('...')}</Text>
      </MotiView>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {items.map((item, i) => (
          <MotiView
            key={item.id}
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', ...animations.spring.gentle, delay: i * 60 }}
          >
            {/* card content */}
          </MotiView>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background.app },
  header: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    backgroundColor: colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border.default,
  },
  title:  { fontFamily: typography.fonts.bold, fontSize: typography.sizes.md, color: colors.text.primary, textAlign: 'right' },
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
});
```

---

## 14. Adding a New Feature — Always Follow This Order

1. **Domain** — new Entity, Value Object, or Domain Service if needed
2. **Repository interface** — define in `domain/` if it needs persistence
3. **Use Case** — one action, returns `Result<T>`
4. **Repository implementation** — AsyncStorage impl in `infrastructure/`
5. **Wire** — add to `src/container.ts`
6. **Store** — add action to Zustand store; store calls use case, never repository directly
7. **Component/Screen** — UI uses store only
8. **i18n** — add all new Arabic strings to `src/i18n/locales/ar.ts` first
9. **Animations** — stagger entrance animations, add haptic feedback to every interactive element
10. **TypeScript** — mentally run `npx tsc --noEmit` before finishing
