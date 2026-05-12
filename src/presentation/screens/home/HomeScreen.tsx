import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { theme } from '@presentation/theme';
import { ScreenWrapper, EmptyState } from '@presentation/components/ui';
import { TransactionListItem } from '@presentation/components/domain/TransactionListItem';
import { useTransactionStore } from '@presentation/store/transactionStore';
import { RootStackParamList } from '@presentation/navigation/RootNavigator';
import { useTranslation } from 'react-i18next';

const { colors, typography, spacing, radius, animations } = theme;

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const nav = useNavigation<NavProp>();
  const {
    transactions, stats, isLoading,
    selectedYear, selectedMonth,
    setSelectedMonth, loadMonth,
  } = useTransactionStore();

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

  const monthLabel = new Date(selectedYear, selectedMonth - 1).toLocaleString('ar-MA', {
    month: 'long', year: 'numeric',
  });

  const recentTx = transactions.slice(0, 5);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenWrapper>
        {/* ─── Hero card ─────────────────────────────────────────────── */}
        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', ...animations.spring.gentle }}
          style={styles.hero}
        >
          {/* Month navigation */}
          <View style={styles.monthNav}>
            <Pressable onPress={goToNextMonth} style={styles.monthBtn}>
              <Text style={styles.monthBtnText}>›</Text>
            </Pressable>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <Pressable onPress={goToPrevMonth} style={styles.monthBtn}>
              <Text style={styles.monthBtnText}>‹</Text>
            </Pressable>
          </View>

          {/* Balance */}
          <Text style={styles.balanceLabel}>{t('home.balance')}</Text>
          <Text style={styles.balanceAmount}>
            {stats?.balance.format() ?? '— د.م'}
          </Text>

          {/* Income / Expense row */}
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
          {/* ─── Add button ─────────────────────────────────────────── */}
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

          {/* ─── Recent transactions ────────────────────────────────── */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 300, delay: 180 }}
          >
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
  safe:   { flex: 1, backgroundColor: colors.primary[600] },
  hero: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
    paddingTop: spacing[2],
    borderBottomLeftRadius:  radius['2xl'],
    borderBottomRightRadius: radius['2xl'],
  },
  monthNav: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  monthBtn:     { padding: spacing[2] },
  monthBtnText: { color: colors.primary[200], fontSize: typography.sizes.xl, fontFamily: typography.fonts.bold },
  monthLabel:   { color: colors.white, fontFamily: typography.fonts.medium, fontSize: typography.sizes.base },
  balanceLabel: { color: colors.primary[200], fontFamily: typography.fonts.regular, fontSize: typography.sizes.sm, textAlign: 'center' },
  balanceAmount: { color: colors.white, fontFamily: typography.fonts.bold, fontSize: typography.sizes['3xl'], textAlign: 'center', marginVertical: spacing[2] },
  heroRow: {
    flexDirection: 'row-reverse',
    marginTop: spacing[4],
    backgroundColor: `${colors.primary[700]}60`,
    borderRadius: radius.lg, padding: spacing[4],
  },
  heroStat:       { flex: 1, alignItems: 'center', gap: spacing[1] },
  heroStatLabel:  { color: colors.primary[200], fontFamily: typography.fonts.regular, fontSize: typography.sizes.xs },
  heroStatAmount: { fontFamily: typography.fonts.bold, fontSize: typography.sizes.sm },
  heroDivider:    { width: 1, backgroundColor: `${colors.white}30`, marginHorizontal: spacing[3] },
  scroll: { padding: spacing[4], paddingBottom: spacing[8] },
  addBtn: {
    backgroundColor: colors.primary[600], borderRadius: radius.lg,
    paddingVertical: spacing[4], alignItems: 'center', marginBottom: spacing[5],
  },
  addBtnText: { color: colors.white, fontFamily: typography.fonts.bold, fontSize: typography.sizes.base },
  sectionTitle: {
    fontFamily: typography.fonts.bold, fontSize: typography.sizes.md,
    color: colors.text.primary, textAlign: 'right', marginBottom: spacing[3],
  },
});
