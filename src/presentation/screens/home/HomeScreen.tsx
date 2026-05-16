import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import { theme } from '@presentation/theme';
import { ScreenWrapper, EmptyState } from '@presentation/components/ui';
import { TransactionListItem } from '@presentation/components/domain/TransactionListItem';
import { useTransactionStore } from '@presentation/store/transactionStore';
import { useSettingsStore } from '@presentation/store/settingsStore';
import { RootStackParamList } from '@presentation/navigation/RootNavigator';

const { colors, typography, spacing, radius, animations } = theme;

const ARABIC_MONTHS = [
  'يناير','فبراير','مارس','أبريل','مايو','يونيو',
  'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر',
] as const;

type NavProp = NativeStackNavigationProp<RootStackParamList>;

// ─── Savings rate bar ─────────────────────────────────────────────────────────

function SavingsRateBar({ rate }: { rate: number }): React.JSX.Element {
  const widthAnim = useSharedValue(0);

  useEffect(() => {
    widthAnim.value = withSpring(rate, { damping: 20, stiffness: 120, mass: 0.8 });
  }, [rate, widthAnim]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${widthAnim.value}%` as `${number}%`,
  }));

  const barColor = rate >= 30
    ? colors.income[500]
    : rate >= 10
      ? colors.amber[600]
      : colors.expense[500];

  return (
    <View style={styles.rateTrack}>
      <Animated.View style={[styles.rateFill, { backgroundColor: barColor }, barStyle]} />
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const nav = useNavigation<NavProp>();
  const {
    transactions, stats, isLoading,
    selectedYear, selectedMonth,
    setSelectedMonth, loadMonth,
  } = useTransactionStore();
  const { settings, loadSettings } = useSettingsStore();

  useEffect(() => {
    void loadMonth(selectedYear, selectedMonth);
  }, [loadMonth, selectedYear, selectedMonth]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const goToPrevMonth = (): void => {
    void Haptics.selectionAsync();
    if (selectedMonth === 1) setSelectedMonth(selectedYear - 1, 12);
    else setSelectedMonth(selectedYear, selectedMonth - 1);
  };

  const goToNextMonth = (): void => {
    void Haptics.selectionAsync();
    if (selectedMonth === 12) setSelectedMonth(selectedYear + 1, 1);
    else setSelectedMonth(selectedYear, selectedMonth + 1);
  };

  const monthLabel = `${ARABIC_MONTHS[selectedMonth - 1]} ${selectedYear}`;
  const recentTx   = transactions.slice(0, 5);

  // Savings rate computation
  const totalExpense = stats?.totalExpense.amount ?? 0;
  const salary       = settings.monthlySalary;
  const remaining    = salary > 0 ? Math.max(0, salary - totalExpense) : 0;
  const savingsRate  = salary > 0
    ? Math.min(100, Math.max(0, ((salary - totalExpense) / salary) * 100))
    : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenWrapper>

        {/* ─── Hero card ───────────────────────────────────────────────── */}
        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', ...animations.spring.gentle }}
          style={styles.hero}
        >
          <View style={styles.monthNav}>
            <Pressable onPress={goToNextMonth} style={styles.monthBtn}>
              <Text style={styles.monthBtnText}>›</Text>
            </Pressable>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <Pressable onPress={goToPrevMonth} style={styles.monthBtn}>
              <Text style={styles.monthBtnText}>‹</Text>
            </Pressable>
          </View>

          <Text style={styles.balanceLabel}>{t('home.balance')}</Text>
          <Text style={styles.balanceAmount}>
            {stats?.balance.format() ?? '— د.م'}
          </Text>

          <View style={styles.heroRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>{t('home.expense')}</Text>
              <Text style={[styles.heroStatAmount, { color: colors.expense[100] }]}>
                -{stats?.totalExpense.format() ?? '0 د.م'}
              </Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>{t('home.income')}</Text>
              <Text style={[styles.heroStatAmount, { color: colors.income[100] }]}>
                +{stats?.totalIncome.format() ?? '0 د.م'}
              </Text>
            </View>
          </View>
        </MotiView>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ─── Savings rate card (only when salary is set) ─────────── */}
          {settings.hasSalary ? (
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', ...animations.spring.gentle, delay: 80 }}
              style={styles.savingsCard}
            >
              {/* Top row: label + rate */}
              <View style={styles.savingsTopRow}>
                <Text style={styles.savingsRate}>
                  {Math.round(savingsRate)}٪
                </Text>
                <Text style={styles.savingsLabel}>{t('salary.savingsRate')}</Text>
              </View>

              {/* Animated bar */}
              <SavingsRateBar rate={savingsRate} />

              {/* Bottom row: remaining / salary */}
              <View style={styles.savingsBottomRow}>
                <Text style={styles.savingsSalary}>
                  {t('salary.perMonth')}: {salary.toFixed(0)} د.م
                </Text>
                <Text style={styles.savingsRemaining}>
                  {t('salary.remaining')}: {remaining.toFixed(0)} د.م
                </Text>
              </View>
            </MotiView>
          ) : (
            /* ─── CTA card when salary not set ────────────────────────── */
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', ...animations.spring.gentle, delay: 80 }}
            >
              <View style={styles.ctaCard}>
                <Text style={styles.ctaEmoji}>💰</Text>
                <Text style={styles.ctaText}>{t('salary.setupCTA')}</Text>
                <Text style={styles.ctaChevron}>⚙️</Text>
              </View>
            </MotiView>
          )}

          {/* ─── Add button ─────────────────────────────────────────────── */}
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', ...animations.spring.bouncy, delay: 120 }}
          >
            <Pressable
              onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); nav.navigate('AddTransaction'); }}
              style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.88 }]}
            >
              <Text style={styles.addBtnText}>{t('transaction.add')}</Text>
            </Pressable>
          </MotiView>

          {/* ─── Recent transactions ────────────────────────────────────── */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 300, delay: 180 }}
            style={styles.sectionRow}
          >
            <Pressable
              onPress={() => { void Haptics.selectionAsync(); nav.navigate('Transactions'); }}
              hitSlop={8}
            >
              <Text style={styles.viewAll}>{t('transactions.title')} ›</Text>
            </Pressable>
            <Text style={styles.sectionTitle}>{t('home.recent')}</Text>
          </MotiView>

          {!isLoading && recentTx.length === 0 && (
            <EmptyState
              emoji="💸"
              title={t('home.emptyTitle')}
              subtitle={t('home.emptySubtitle')}
            />
          )}

          {recentTx.map((tx, i) => (
            <TransactionListItem key={tx.id.value} transaction={tx} index={i} />
          ))}
        </ScrollView>
      </ScreenWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary[600] },
  hero: {
    backgroundColor:      colors.primary[600],
    paddingHorizontal:    spacing[5],
    paddingBottom:        spacing[6],
    paddingTop:           spacing[2],
    borderBottomLeftRadius:  radius['2xl'],
    borderBottomRightRadius: radius['2xl'],
  },
  monthNav: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  monthBtn:      { padding: spacing[2] },
  monthBtnText:  { color: colors.primary[200], fontSize: typography.sizes.xl, fontFamily: typography.fonts.bold },
  monthLabel:    { color: colors.white, fontFamily: typography.fonts.medium, fontSize: typography.sizes.base },
  balanceLabel:  { color: colors.primary[200], fontFamily: typography.fonts.regular, fontSize: typography.sizes.sm, textAlign: 'center' },
  balanceAmount: { color: colors.white, fontFamily: typography.fonts.bold, fontSize: typography.sizes['3xl'], textAlign: 'center', marginVertical: spacing[2] },
  heroRow: {
    flexDirection: 'row-reverse',
    marginTop:     spacing[4],
    backgroundColor: `${colors.primary[700]}60`,
    borderRadius:  radius.lg,
    padding:       spacing[4],
  },
  heroStat:      { flex: 1, alignItems: 'center', gap: spacing[1] },
  heroStatLabel: { color: colors.primary[200], fontFamily: typography.fonts.regular, fontSize: typography.sizes.xs },
  heroStatAmount:{ fontFamily: typography.fonts.bold, fontSize: typography.sizes.sm },
  heroDivider:   { width: 1, backgroundColor: `${colors.white}30`, marginHorizontal: spacing[3] },

  scroll:  { padding: spacing[4], paddingBottom: spacing[8] },

  savingsCard: {
    backgroundColor: colors.background.card,
    borderRadius:    radius.xl,
    padding:         spacing[4],
    marginBottom:    spacing[4],
    gap:             spacing[3],
  },
  savingsTopRow: {
    flexDirection:    'row-reverse',
    justifyContent:   'space-between',
    alignItems:       'center',
  },
  savingsLabel: {
    fontFamily: typography.fonts.bold,
    fontSize:   typography.sizes.base,
    color:      colors.text.primary,
    textAlign:  'right',
  },
  savingsRate: {
    fontFamily: typography.fonts.bold,
    fontSize:   typography.sizes.xl,
    color:      colors.income[600],
  },
  rateTrack: {
    height:          10,
    backgroundColor: colors.background.app,
    borderRadius:    radius.full,
    overflow:        'hidden',
  },
  rateFill: {
    height:       10,
    borderRadius: radius.full,
  },
  savingsBottomRow: {
    flexDirection:  'row-reverse',
    justifyContent: 'space-between',
  },
  savingsRemaining: {
    fontFamily: typography.fonts.medium,
    fontSize:   typography.sizes.sm,
    color:      colors.income[600],
  },
  savingsSalary: {
    fontFamily: typography.fonts.regular,
    fontSize:   typography.sizes.sm,
    color:      colors.text.tertiary,
  },

  ctaCard: {
    flexDirection:    'row-reverse',
    alignItems:       'center',
    backgroundColor:  colors.background.card,
    borderRadius:     radius.lg,
    padding:          spacing[4],
    marginBottom:     spacing[4],
    gap:              spacing[3],
    borderWidth:      1,
    borderColor:      colors.border.default,
    borderStyle:      'dashed',
  },
  ctaEmoji:   { fontSize: 20 },
  ctaText:    { flex: 1, fontFamily: typography.fonts.medium, fontSize: typography.sizes.sm, color: colors.text.secondary, textAlign: 'right' },
  ctaChevron: { fontFamily: typography.fonts.regular, fontSize: typography.sizes.lg, color: colors.text.tertiary },

  addBtn: {
    backgroundColor: colors.primary[600],
    borderRadius:    radius.lg,
    paddingVertical: spacing[4],
    alignItems:      'center',
    marginBottom:    spacing[5],
  },
  addBtnText: { color: colors.white, fontFamily: typography.fonts.bold, fontSize: typography.sizes.base },

  sectionRow: {
    flexDirection:  'row-reverse',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   spacing[3],
  },
  sectionTitle: {
    fontFamily: typography.fonts.bold,
    fontSize:   typography.sizes.md,
    color:      colors.text.primary,
    textAlign:  'right',
  },
  viewAll: {
    fontFamily: typography.fonts.medium,
    fontSize:   typography.sizes.sm,
    color:      colors.primary[600],
  },
});
