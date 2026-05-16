import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, FlatList, Pressable, SectionList,
  StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as Haptics from 'expo-haptics';
import { format, isToday, isYesterday } from 'date-fns';
import { ar as arLocale } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import { theme } from '@presentation/theme';
import { EmptyState } from '@presentation/components/ui';
import { TransactionListItem } from '@presentation/components/domain/TransactionListItem';
import { useTransactionStore } from '@presentation/store/transactionStore';
import {
  CATEGORIES, CategoryId, CategoryMeta,
  TransactionType,
} from '@domain/transaction/value-objects/Category';
import { Transaction } from '@domain/transaction/entities/Transaction';

const { colors, typography, spacing, radius, animations } = theme;

const ARABIC_MONTHS = [
  'يناير','فبراير','مارس','أبريل','مايو','يونيو',
  'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر',
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Section {
  title: string;
  dateKey: string;
  data: Transaction[];
  netLabel: string;
}

// ─── Swipeable row ────────────────────────────────────────────────────────────

interface SwipeableRowProps {
  transaction: Transaction;
  index: number;
  onDelete: (tx: Transaction) => void;
}

function SwipeableRow({ transaction: tx, index, onDelete }: SwipeableRowProps): React.JSX.Element {
  const swipeRef = useRef<Swipeable | null>(null);

  const renderRightActions = useCallback((): React.JSX.Element => (
    <Pressable
      style={styles.deleteAction}
      onPress={() => {
        swipeRef.current?.close();
        onDelete(tx);
      }}
    >
      <Text style={styles.deleteActionEmoji}>🗑️</Text>
      <Text style={styles.deleteActionText}>حذف</Text>
    </Pressable>
  ), [tx, onDelete]);

  const handleSwipeOpen = useCallback((): void => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      rightThreshold={60}
      overshootRight={false}
      onSwipeableOpen={handleSwipeOpen}
    >
      <TransactionListItem transaction={tx} index={index} />
    </Swipeable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TransactionsScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const nav = useNavigation();
  const {
    transactions, isLoading,
    selectedYear, selectedMonth,
    setSelectedMonth, loadMonth,
    deleteTransaction,
  } = useTransactionStore();

  const [activeTab, setActiveTab]               = useState<TransactionType>(TransactionType.EXPENSE);
  const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryId | null>(null);

  useEffect(() => {
    void loadMonth(selectedYear, selectedMonth);
  }, [loadMonth, selectedYear, selectedMonth]);

  // ── Month navigation ──────────────────────────────────────────────────────

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

  // ── Category chips for the active tab ────────────────────────────────────

  const visibleCategories = useMemo((): CategoryMeta[] =>
    Object.values(CATEGORIES).filter(c => c.type === activeTab),
  [activeTab]);

  const handleTabChange = (tab: TransactionType): void => {
    void Haptics.selectionAsync();
    setActiveTab(tab);
    setSelectedCategoryId(null);
  };

  const handleCategoryChip = (id: CategoryId | null): void => {
    void Haptics.selectionAsync();
    setSelectedCategoryId(prev => prev === id ? null : id);
  };

  // ── Filtered + grouped sections ───────────────────────────────────────────

  const sections = useMemo((): Section[] => {
    const filtered = transactions.filter(tx => {
      if (tx.type !== activeTab) return false;
      if (selectedCategoryId !== null && tx.category.id !== selectedCategoryId) return false;
      return true;
    });

    const groups = new Map<string, Transaction[]>();
    for (const tx of filtered) {
      const key = format(tx.date, 'yyyy-MM-dd');
      const existing = groups.get(key);
      if (existing) existing.push(tx);
      else groups.set(key, [tx]);
    }

    return Array.from(groups.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([dateKey, data]) => {
        const date = new Date(dateKey);
        let title: string;
        if (isToday(date)) title = t('transaction.today');
        else if (isYesterday(date)) title = t('transaction.yesterday');
        else title = format(date, 'd MMMM', { locale: arLocale });

        const netAmount = data.reduce((sum, tx) => sum + tx.amount.amount, 0);
        const netLabel  = `${netAmount.toFixed(0)} د.م`;

        return { title, dateKey, data, netLabel };
      });
  }, [transactions, activeTab, selectedCategoryId, t]);

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = useCallback((tx: Transaction): void => {
    Alert.alert(
      t('transactions.deleteTitle'),
      t('transactions.deleteConfirm'),
      [
        { text: t('transactions.cancel'), style: 'cancel' },
        {
          text:  t('transactions.delete'),
          style: 'destructive',
          onPress: () => {
            void (async () => {
              const result = await deleteTransaction(tx.id.value);
              if (result.success) {
                void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            })();
          },
        },
      ],
    );
  }, [t, deleteTransaction]);

  const monthLabel = `${ARABIC_MONTHS[selectedMonth - 1]} ${selectedYear}`;
  const isExpense  = activeTab === TransactionType.EXPENSE;
  const accentColor = isExpense ? colors.expense[600] : colors.income[600];

  // ── Renders ───────────────────────────────────────────────────────────────

  const renderChip = useCallback(({ item, index: i }: { item: CategoryMeta | null; index: number }): React.JSX.Element => {
    const isAll      = item === null;
    const isSelected = isAll ? selectedCategoryId === null : selectedCategoryId === item?.id;
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', ...animations.spring.bouncy, delay: i * 30 }}
      >
        <Pressable
          onPress={() => handleCategoryChip(isAll ? null : item!.id)}
          style={[
            styles.chip,
            isSelected && { backgroundColor: colors.primary[100] },
          ]}
        >
          {!isAll && <Text style={styles.chipEmoji}>{item!.icon}</Text>}
          <Text style={[
            styles.chipLabel,
            isSelected && { color: colors.primary[600], fontFamily: typography.fonts.bold },
          ]}>
            {isAll ? t('transactions.filterAll') : t(`categories.${item!.id}`)}
          </Text>
        </Pressable>
      </MotiView>
    );
  }, [selectedCategoryId, t, handleCategoryChip]);

  const chipData = useMemo(
    (): Array<CategoryMeta | null> => [null, ...visibleCategories],
    [visibleCategories],
  );

  const renderSectionHeader = useCallback(({ section }: { section: Section }): React.JSX.Element => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionNet, { color: accentColor }]}>{section.netLabel}</Text>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  ), [accentColor]);

  const renderItem = useCallback(({ item, index }: { item: Transaction; index: number }): React.JSX.Element => (
    <SwipeableRow transaction={item} index={index} onDelete={handleDelete} />
  ), [handleDelete]);

  const keyExtractor = useCallback((item: Transaction): string => item.id.value, []);

  const ListEmpty = useMemo(() => (
    !isLoading
      ? <EmptyState emoji="💸" title={t('transactions.empty')} subtitle={t('transactions.emptySubtitle')} />
      : null
  ), [isLoading, t]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* ─── Header ─────────────────────────────────────────────────── */}
      <MotiView
        from={{ opacity: 0, translateY: -8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', ...animations.spring.gentle }}
        style={styles.header}
      >
        <Pressable
          onPress={() => { void Haptics.selectionAsync(); nav.goBack(); }}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Text style={styles.backBtnText}>›</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('transactions.title')}</Text>
        <View style={styles.backBtn} />
      </MotiView>

      {/* ─── EXPENSES / INCOME tabs ──────────────────────────────────── */}
      <View style={styles.typeTabs}>
        {([TransactionType.EXPENSE, TransactionType.INCOME] as const).map(tp => (
          <Pressable key={tp} onPress={() => handleTabChange(tp)} style={styles.typeTab}>
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
        <Pressable onPress={goToNextMonth} style={styles.monthBtn} hitSlop={8}>
          <Text style={styles.monthBtnText}>›</Text>
        </Pressable>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <Pressable onPress={goToPrevMonth} style={styles.monthBtn} hitSlop={8}>
          <Text style={styles.monthBtnText}>‹</Text>
        </Pressable>
      </View>

      {/* ─── Category filter chips ───────────────────────────────────── */}
      <FlatList
        data={chipData}
        renderItem={renderChip}
        keyExtractor={(item) => item === null ? 'all' : item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipList}
        style={styles.chipRow}
        inverted
      />

      {/* ─── Transaction list ─────────────────────────────────────────── */}
      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={ListEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        stickySectionHeadersEnabled={false}
      />

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary[600] },

  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
  },
  headerTitle:  { fontFamily: typography.fonts.bold, fontSize: typography.sizes.md, color: colors.white },
  backBtn:      { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backBtnText:  { fontFamily: typography.fonts.bold, fontSize: typography.sizes.xl, color: colors.primary[200] },

  typeTabs: {
    flexDirection: 'row-reverse',
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: `${colors.white}20`,
  },
  typeTab:    { flex: 1, alignItems: 'center', paddingBottom: spacing[3], paddingTop: spacing[1] },
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
    paddingVertical: spacing[2],
    backgroundColor: `${colors.primary[700]}60`,
  },
  monthBtn:     { padding: spacing[2] },
  monthBtnText: { color: colors.primary[200], fontSize: typography.sizes.xl, fontFamily: typography.fonts.bold },
  monthLabel:   { color: colors.white, fontFamily: typography.fonts.medium, fontSize: typography.sizes.base },

  chipRow:  { maxHeight: 52, backgroundColor: colors.white },
  chipList: { paddingHorizontal: spacing[3], paddingVertical: spacing[2], gap: spacing[2] },
  chip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  chipEmoji: { fontSize: 13 },
  chipLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },

  scroll: { paddingHorizontal: spacing[4], paddingBottom: spacing[10], backgroundColor: colors.background.app },

  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  sectionTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'right',
  },
  sectionNet: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.sm,
  },

  deleteAction: {
    backgroundColor: colors.expense[600],
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: radius.md,
    marginBottom: spacing[2],
    gap: spacing[1],
  },
  deleteActionEmoji: { fontSize: 20 },
  deleteActionText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xs,
    color: colors.white,
  },
});
