import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import { theme } from '@presentation/theme';
import { EmptyState } from '@presentation/components/ui';
import { useTransactionStore } from '@presentation/store/transactionStore';
import { CATEGORIES, CategoryId, TransactionType } from '@domain/transaction/value-objects/Category';
import { Money } from '@domain/shared/value-objects/Money';

const { colors, typography, spacing, radius, animations } = theme;

const ARABIC_MONTHS = [
  'يناير','فبراير','مارس','أبريل','مايو','يونيو',
  'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر',
] as const;

export default function StatisticsScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const {
    stats, transactions, isLoading,
    selectedYear, selectedMonth,
    setSelectedMonth, loadMonth,
  } = useTransactionStore();

  const [activeTab, setActiveTab] = useState<TransactionType>(TransactionType.EXPENSE);

  useEffect(() => {
    void loadMonth(selectedYear, selectedMonth);
  }, [loadMonth, selectedYear, selectedMonth]);

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

  const incomeByCat = useMemo((): Map<CategoryId, Money> => {
    const map = new Map<CategoryId, Money>();
    for (const tx of transactions) {
      if (!tx.isIncome) continue;
      map.set(tx.category.id, (map.get(tx.category.id) ?? Money.zero('MAD')).add(tx.amount));
    }
    return map;
  }, [transactions]);

  const isExpense   = activeTab === TransactionType.EXPENSE;
  const accentColor = isExpense ? colors.expense[600] : colors.income[600];

  const total           = isExpense ? (stats?.totalExpense.amount ?? 0)  : (stats?.totalIncome.amount ?? 0);
  const totalFormatted  = isExpense ? (stats?.totalExpense.format() ?? '0 د.م') : (stats?.totalIncome.format() ?? '0 د.م');

  const categoryEntries = useMemo(() => {
    const source = isExpense ? (stats?.byCategory ?? new Map<CategoryId, Money>()) : incomeByCat;
    return Array.from(source.entries())
      .filter(([, m]) => m.amount > 0)
      .sort((a, b) => b[1].amount - a[1].amount);
  }, [isExpense, stats, incomeByCat]);

  const monthLabel = `${ARABIC_MONTHS[selectedMonth - 1]} ${selectedYear}`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* ─── Header ──────────────────────────────────────────────────── */}
      <MotiView
        from={{ opacity: 0, translateY: -8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', ...animations.spring.gentle }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{t('stats.title')}</Text>
      </MotiView>

      {/* ─── EXPENSES / INCOME tabs ──────────────────────────────────── */}
      <View style={styles.typeTabs}>
        {([TransactionType.EXPENSE, TransactionType.INCOME] as const).map(tp => (
          <Pressable key={tp} onPress={() => { void Haptics.selectionAsync(); setActiveTab(tp); }} style={styles.typeTab}>
            <Text style={[
              styles.typeTabLabel,
              activeTab === tp && (tp === TransactionType.EXPENSE
                ? styles.typeTabLabel_expense
                : styles.typeTabLabel_income),
            ]}>
              {tp === TransactionType.EXPENSE ? t('transaction.expense') : t('transaction.income')}
            </Text>
            {activeTab === tp && (
              <MotiView
                from={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ type: 'spring', ...animations.spring.snappy }}
                style={[styles.typeTabBar, { backgroundColor: accentColor }]}
              />
            )}
          </Pressable>
        ))}
      </View>

      {/* ─── Month navigation ────────────────────────────────────────── */}
      <View style={styles.monthNav}>
        <Pressable onPress={goToNextMonth} style={styles.monthBtn}>
          <Text style={styles.monthBtnText}>›</Text>
        </Pressable>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <Pressable onPress={goToPrevMonth} style={styles.monthBtn}>
          <Text style={styles.monthBtnText}>‹</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ─── Ring chart ──────────────────────────────────────────── */}
        <MotiView
          from={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', ...animations.spring.gentle, delay: 60 }}
          style={styles.chartCard}
        >
          <View style={[styles.ring, { borderColor: accentColor }]}>
            <Text style={[styles.ringAmount, { color: accentColor }]} numberOfLines={1} adjustsFontSizeToFit>
              {totalFormatted}
            </Text>
            <Text style={styles.ringSubLabel}>
              {isExpense ? t('home.expense') : t('home.income')}
            </Text>
          </View>
        </MotiView>

        {/* ─── Summary row ─────────────────────────────────────────── */}
        <View style={styles.summaryRow}>
          {[
            { label: t('home.income'),  value: stats?.totalIncome.format()  ?? '0 د.م', color: colors.income[600]  },
            { label: t('home.balance'), value: stats?.balance.format()      ?? '0 د.م', color: colors.primary[600] },
            { label: t('home.expense'), value: stats?.totalExpense.format() ?? '0 د.م', color: colors.expense[600] },
          ].map((item, i) => (
            <MotiView
              key={item.label}
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', ...animations.spring.gentle, delay: 140 + i * 50 }}
              style={styles.summaryCard}
            >
              <Text style={[styles.summaryValue, { color: item.color }]} numberOfLines={1} adjustsFontSizeToFit>
                {item.value}
              </Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
            </MotiView>
          ))}
        </View>

        {/* ─── Category breakdown ──────────────────────────────────── */}
        <Text style={styles.sectionTitle}>{t('stats.byCategory')}</Text>

        {!isLoading && categoryEntries.length === 0 && (
          <EmptyState emoji="📊" title={t('stats.emptyTitle')} subtitle={t('stats.emptySubtitle')} />
        )}

        {categoryEntries.map(([catId, money], i) => {
          const cat = CATEGORIES[catId];
          const pct = total > 0 ? (money.amount / total) * 100 : 0;
          return (
            <MotiView
              key={`${activeTab}-${catId}`}
              from={{ opacity: 0, translateX: 16 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'spring', ...animations.spring.gentle, delay: 260 + i * 45 }}
              style={styles.catRow}
            >
              {/* Circle icon */}
              <View style={[styles.catCircle, { backgroundColor: cat.color }]}>
                <Text style={styles.catEmoji}>{cat.icon}</Text>
              </View>

              {/* Label + bar */}
              <View style={styles.catBody}>
                <View style={styles.catTopRow}>
                  <Text style={styles.catAmount}>{money.format()}</Text>
                  <Text style={styles.catName}>{t(`categories.${cat.id}`)}</Text>
                </View>
                <View style={styles.catBarRow}>
                  <Text style={[styles.catPct, { color: cat.color }]}>{Math.round(pct)}٪</Text>
                  <View style={styles.barTrack}>
                    <MotiView
                      from={{ width: '0%' as const }}
                      animate={{ width: `${Math.round(pct)}%` as `${number}%` }}
                      transition={{ type: 'spring', ...animations.spring.gentle, delay: 320 + i * 45 }}
                      style={[styles.barFill, { backgroundColor: cat.color }]}
                    />
                  </View>
                </View>
              </View>
            </MotiView>
          );
        })}

        {/* ─── Transaction count ───────────────────────────────────── */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 300, delay: 500 }}
          style={styles.countCard}
        >
          <Text style={styles.countValue}>{transactions.length.toString()}</Text>
          <Text style={styles.countLabel}>{t('stats.totalTransactions')}</Text>
        </MotiView>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary[600] },

  header: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
  },
  headerTitle: { fontFamily: typography.fonts.bold, fontSize: typography.sizes.md, color: colors.white, textAlign: 'right' },

  typeTabs: {
    flexDirection: 'row-reverse',
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: `${colors.white}20`,
  },
  typeTab: { flex: 1, alignItems: 'center', paddingBottom: spacing[3], paddingTop: spacing[1] },
  typeTabLabel: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.base,
    color: `${colors.white}55`,
  },
  typeTabLabel_expense: { color: colors.expense[100] },
  typeTabLabel_income:  { color: colors.income[100] },
  typeTabBar: {
    position: 'absolute',
    bottom: 0,
    left: spacing[4],
    right: spacing[4],
    height: 2,
    borderRadius: 1,
  },

  monthNav: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: `${colors.primary[700]}60`,
  },
  monthBtn:     { padding: spacing[2] },
  monthBtnText: { color: colors.primary[200], fontSize: typography.sizes.xl, fontFamily: typography.fonts.bold },
  monthLabel:   { color: colors.white, fontFamily: typography.fonts.medium, fontSize: typography.sizes.base },

  scroll: { padding: spacing[4], paddingBottom: spacing[10], backgroundColor: colors.background.app },

  chartCard: {
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: radius.xl,
    paddingVertical: spacing[6],
    marginBottom: spacing[4],
  },
  ring: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringAmount: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
    textAlign: 'center',
  },
  ringSubLabel: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },

  summaryRow: { flexDirection: 'row-reverse', gap: spacing[2], marginBottom: spacing[5] },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: radius.md,
    padding: spacing[3],
    alignItems: 'center',
    gap: spacing[1],
  },
  summaryValue: { fontFamily: typography.fonts.bold,    fontSize: typography.sizes.xs, textAlign: 'center' },
  summaryLabel: { fontFamily: typography.fonts.regular, fontSize: 10,                  color: colors.text.tertiary, textAlign: 'center' },

  sectionTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    textAlign: 'right',
    marginBottom: spacing[3],
  },

  catRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.background.card,
    borderRadius: radius.lg,
    padding: spacing[3],
    marginBottom: spacing[2],
  },
  catCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  catEmoji: { fontSize: 22 },
  catBody:  { flex: 1, gap: spacing[1] },
  catTopRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catName:   { fontFamily: typography.fonts.medium, fontSize: typography.sizes.base, color: colors.text.primary },
  catAmount: { fontFamily: typography.fonts.bold,   fontSize: typography.sizes.sm,   color: colors.text.secondary },
  catBarRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing[2],
  },
  catPct:    { fontFamily: typography.fonts.medium, fontSize: typography.sizes.xs, minWidth: 36, textAlign: 'right' },
  barTrack:  { flex: 1, height: 6, backgroundColor: colors.background.input, borderRadius: radius.full, overflow: 'hidden' },
  barFill:   { height: 6, borderRadius: radius.full },

  countCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.card,
    borderRadius: radius.lg,
    padding: spacing[4],
    marginTop: spacing[2],
  },
  countLabel: { fontFamily: typography.fonts.regular, fontSize: typography.sizes.base, color: colors.text.secondary },
  countValue: { fontFamily: typography.fonts.bold,    fontSize: typography.sizes.xl,   color: colors.primary[600] },
});
