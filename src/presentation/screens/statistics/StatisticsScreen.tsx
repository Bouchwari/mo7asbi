import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useTranslation } from 'react-i18next';

import { theme } from '@presentation/theme';
import { EmptyState, ScreenWrapper } from '@presentation/components/ui';
import { useTransactionStore } from '@presentation/store/transactionStore';
import { CATEGORIES } from '@domain/transaction/value-objects/Category';

const { colors, typography, spacing, radius, animations } = theme;

export default function StatisticsScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const { stats, transactions, selectedYear, selectedMonth, isLoading } = useTransactionStore();

  useEffect(() => {
    void useTransactionStore.getState().loadMonth(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const categoryEntries = stats
    ? Array.from(stats.byCategory.entries())
        .sort((a, b) => b[1].amount - a[1].amount)
    : [];

  const totalExpense = stats?.totalExpense.amount ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenWrapper>
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', ...animations.spring.gentle }}
          style={styles.header}
        >
          <Text style={styles.title}>{t('stats.title')}</Text>
        </MotiView>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* ─── Summary cards ─── */}
          <View style={styles.summaryRow}>
            {(
              [
                { label: t('home.income'),  value: stats?.totalIncome.format()  ?? '0', color: colors.income[600]  },
                { label: t('home.expense'), value: stats?.totalExpense.format() ?? '0', color: colors.expense[600] },
                { label: t('home.balance'), value: stats?.balance.format()       ?? '0', color: colors.primary[600] },
              ] as const
            ).map((item, i) => (
              <MotiView
                key={item.label}
                from={{ opacity: 0, translateY: 12 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', ...animations.spring.gentle, delay: i * 60 }}
                style={styles.summaryCard}
              >
                <Text style={[styles.summaryValue, { color: item.color }]}>{item.value}</Text>
                <Text style={styles.summaryLabel}>{item.label}</Text>
              </MotiView>
            ))}
          </View>

          {/* ─── Category breakdown ─── */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 300, delay: 200 }}
          >
            <Text style={styles.sectionTitle}>{t('stats.byCategory')}</Text>
          </MotiView>

          {!isLoading && categoryEntries.length === 0 && (
            <EmptyState emoji="📊" title={t('stats.emptyTitle')} subtitle={t('stats.emptySubtitle')} />
          )}

          {categoryEntries.map(([catId, money], i) => {
            const cat = CATEGORIES[catId];
            const pct = totalExpense > 0 ? (money.amount / totalExpense) * 100 : 0;
            return (
              <MotiView
                key={catId}
                from={{ opacity: 0, translateX: 16 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'spring', ...animations.spring.gentle, delay: i * 50 }}
                style={styles.categoryRow}
              >
                <View style={styles.categoryLeft}>
                  <Text style={styles.categoryAmount}>{money.format()}</Text>
                  <Text style={[styles.categoryPct, { color: cat.color }]}>{Math.round(pct)}٪</Text>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={styles.categoryName}>{catId}</Text>
                  <View style={styles.barTrack}>
                    <MotiView
                      from={{ width: '0%' as const }}
                      animate={{ width: `${pct}%` as `${number}%` }}
                      transition={{ type: 'spring', ...animations.spring.gentle, delay: i * 50 + 100 }}
                      style={[styles.barFill, { backgroundColor: cat.color }]}
                    />
                  </View>
                </View>
              </MotiView>
            );
          })}

          {/* ─── Transaction count ─── */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 300, delay: 400 }}
            style={styles.countCard}
          >
            <Text style={styles.countLabel}>{t('stats.totalTransactions')}</Text>
            <Text style={styles.countValue}>{transactions.length.toLocaleString('ar-MA')}</Text>
          </MotiView>
        </ScrollView>
      </ScreenWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background.app },
  header: { paddingHorizontal: spacing[4], paddingVertical: spacing[4], backgroundColor: colors.white, borderBottomWidth: 0.5, borderBottomColor: colors.border.default },
  title:  { fontFamily: typography.fonts.bold, fontSize: typography.sizes.md, color: colors.text.primary, textAlign: 'right' },
  scroll: { padding: spacing[4], paddingBottom: spacing[8] },
  summaryRow: { flexDirection: 'row-reverse', gap: spacing[2], marginBottom: spacing[4] },
  summaryCard: { flex: 1, backgroundColor: colors.background.card, borderRadius: radius.md, padding: spacing[3], alignItems: 'center', gap: spacing[1] },
  summaryValue: { fontFamily: typography.fonts.bold, fontSize: typography.sizes.sm, textAlign: 'center' },
  summaryLabel: { fontFamily: typography.fonts.regular, fontSize: typography.sizes.xs, color: colors.text.tertiary, textAlign: 'center' },
  sectionTitle: { fontFamily: typography.fonts.bold, fontSize: typography.sizes.md, color: colors.text.primary, textAlign: 'right', marginBottom: spacing[3] },
  categoryRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing[3], backgroundColor: colors.background.card, borderRadius: radius.md, padding: spacing[3], marginBottom: spacing[2] },
  categoryLeft:   { alignItems: 'flex-end', minWidth: 80 },
  categoryAmount: { fontFamily: typography.fonts.bold,    fontSize: typography.sizes.sm, color: colors.text.primary,   textAlign: 'right' },
  categoryPct:    { fontFamily: typography.fonts.regular, fontSize: typography.sizes.xs,                                textAlign: 'right' },
  categoryRight:  { flex: 1, alignItems: 'flex-end', gap: spacing[1] },
  categoryName:   { fontFamily: typography.fonts.medium, fontSize: typography.sizes.sm, color: colors.text.secondary, textAlign: 'right' },
  barTrack: { width: '100%', height: 6, backgroundColor: colors.background.input, borderRadius: radius.full, overflow: 'hidden' },
  barFill:  { height: 6, borderRadius: radius.full },
  countCard: { backgroundColor: colors.background.card, borderRadius: radius.lg, padding: spacing[4], flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing[2] },
  countLabel: { fontFamily: typography.fonts.regular, fontSize: typography.sizes.base, color: colors.text.secondary },
  countValue: { fontFamily: typography.fonts.bold, fontSize: typography.sizes.xl, color: colors.primary[600] },
});
