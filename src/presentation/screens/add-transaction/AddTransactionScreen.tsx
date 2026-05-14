import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import { theme } from '@presentation/theme';
import { Button } from '@presentation/components/ui';
import { useTransactionStore } from '@presentation/store/transactionStore';
import { CategoryId, TransactionType, CATEGORIES } from '@domain/transaction/value-objects/Category';

const { colors, typography, spacing, radius, animations } = theme;

export default function AddTransactionScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const nav = useNavigation();
  const { addTransaction } = useTransactionStore();

  const [type,        setType]        = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount,      setAmount]      = useState('');
  const [categoryId,  setCategoryId]  = useState<CategoryId>(CategoryId.FOOD);
  const [note,        setNote]        = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [dateOffset,  setDateOffset]  = useState<0 | 1>(0);

  const expenseCategories = Object.values(CATEGORIES).filter(c => c.type === TransactionType.EXPENSE);
  const incomeCategories  = Object.values(CATEGORIES).filter(c => c.type === TransactionType.INCOME);
  const visibleCategories = type === TransactionType.EXPENSE ? expenseCategories : incomeCategories;

  const isExpense   = type === TransactionType.EXPENSE;
  const accentColor = isExpense ? colors.expense[600] : colors.income[600];

  const handleTypeChange = (newType: TransactionType): void => {
    void Haptics.selectionAsync();
    setType(newType);
    setCategoryId(newType === TransactionType.EXPENSE ? CategoryId.FOOD : CategoryId.SALARY);
  };

  const getDate = (): Date => {
    const d = new Date();
    d.setDate(d.getDate() - dateOffset);
    return d;
  };

  const handleSubmit = async (): Promise<void> => {
    const parsed = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      setError(t('errors.invalidAmount'));
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await addTransaction({
      amount: parsed, currency: 'MAD',
      categoryId, type,
      date: getDate(),
      note: note.trim() || undefined,
      recurring: { isRecurring: false },
    });
    setLoading(false);
    if (result.success) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      nav.goBack();
    } else {
      setError(result.error ?? t('errors.generic'));
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* ─── Top header ─────────────────────────────────────────────── */}
      <MotiView
        from={{ opacity: 0, translateY: -8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', ...animations.spring.gentle }}
        style={styles.header}
      >
        <Pressable
          onPress={() => { void Haptics.selectionAsync(); nav.goBack(); }}
          style={styles.closeBtn}
          hitSlop={12}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('transaction.add')}</Text>
        <View style={styles.closeBtn} />
      </MotiView>

      {/* ─── EXPENSES / INCOME underline tabs ───────────────────────── */}
      <View style={styles.typeTabs}>
        {([TransactionType.EXPENSE, TransactionType.INCOME] as const).map(tp => (
          <Pressable key={tp} onPress={() => handleTypeChange(tp)} style={styles.typeTab}>
            <Text style={[
              styles.typeTabLabel,
              type === tp && (tp === TransactionType.EXPENSE
                ? styles.typeTabLabel_expense
                : styles.typeTabLabel_income),
            ]}>
              {tp === TransactionType.EXPENSE ? t('transaction.expense') : t('transaction.income')}
            </Text>
            {type === tp && (
              <MotiView
                from={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ type: 'spring', ...animations.spring.snappy }}
                style={[styles.typeTabBar, {
                  backgroundColor: tp === TransactionType.EXPENSE
                    ? colors.expense[100]
                    : colors.income[100],
                }]}
              />
            )}
          </Pressable>
        ))}
      </View>

      {/* ─── Body ───────────────────────────────────────────────────── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.body}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Amount */}
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', ...animations.spring.gentle, delay: 60 }}
            style={styles.amountCard}
          >
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.text.tertiary}
              textAlign="center"
              style={styles.amountInput}
            />
            <Text style={[styles.currencyLabel, { color: accentColor }]}>MAD</Text>
          </MotiView>

          {/* Categories */}
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', ...animations.spring.gentle, delay: 120 }}
          >
            <Text style={styles.sectionLabel}>{t('transaction.category')}</Text>
            <View style={styles.categoryGrid}>
              {visibleCategories.map((cat, i) => (
                <MotiView
                  key={cat.id}
                  from={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', ...animations.spring.bouncy, delay: i * 35 }}
                  style={styles.categoryItem}
                >
                  <Pressable
                    onPress={() => { void Haptics.selectionAsync(); setCategoryId(cat.id); }}
                    style={styles.categoryItemInner}
                  >
                    <View style={[
                      styles.categoryCircle,
                      { backgroundColor: cat.color },
                      categoryId === cat.id && styles.categoryCircleActive,
                    ]}>
                      <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                    </View>
                    <Text style={[
                      styles.categoryLabel,
                      categoryId === cat.id && { color: cat.color, fontFamily: typography.fonts.bold },
                    ]}>
                      {t(`categories.${cat.id}`)}
                    </Text>
                  </Pressable>
                </MotiView>
              ))}
            </View>
          </MotiView>

          {/* Quick date */}
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', ...animations.spring.gentle, delay: 200 }}
          >
            <Text style={styles.sectionLabel}>{t('transaction.date')}</Text>
            <View style={styles.dateRow}>
              {([0, 1] as const).map(offset => (
                <Pressable
                  key={offset}
                  onPress={() => { void Haptics.selectionAsync(); setDateOffset(offset); }}
                  style={[
                    styles.dateChip,
                    dateOffset === offset && { backgroundColor: accentColor },
                  ]}
                >
                  <Text style={[
                    styles.dateChipLabel,
                    dateOffset === offset && styles.dateChipLabelActive,
                  ]}>
                    {offset === 0 ? t('transaction.today') : t('transaction.yesterday')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </MotiView>

          {/* Note */}
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', ...animations.spring.gentle, delay: 260 }}
          >
            <Text style={styles.sectionLabel}>{t('transaction.note')}</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={t('transaction.notePlaceholder')}
              placeholderTextColor={colors.text.tertiary}
              textAlign="right"
              style={styles.noteInput}
              multiline
              textAlignVertical="top"
            />
          </MotiView>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 300, delay: 320 }}
          >
            <Button label={t('transaction.save')} onPress={() => { void handleSubmit(); }} loading={loading} />
          </MotiView>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  closeBtn:     { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontFamily: typography.fonts.bold, fontSize: typography.sizes.md, color: colors.primary[200] },

  typeTabs: {
    flexDirection: 'row-reverse',
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: `${colors.white}20`,
  },
  typeTab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: spacing[3],
    paddingTop: spacing[1],
  },
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

  body: { flex: 1, backgroundColor: colors.background.app },
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },

  amountCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    backgroundColor: colors.background.card,
    borderRadius: radius.xl,
    paddingVertical: spacing[6],
    marginBottom: spacing[5],
  },
  amountInput: {
    fontFamily: typography.fonts.bold,
    fontSize: 42,
    color: colors.text.primary,
    minWidth: 100,
    textAlign: 'center',
    padding: 0,
  },
  currencyLabel: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xl,
  },

  sectionLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'right',
    marginBottom: spacing[3],
  },

  categoryGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    backgroundColor: colors.background.card,
    borderRadius: radius.xl,
    padding: spacing[3],
    marginBottom: spacing[5],
  },
  categoryItem:      { width: '33.33%', alignItems: 'center' },
  categoryItemInner: { alignItems: 'center', paddingVertical: spacing[3] },
  categoryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
    opacity: 0.75,
  },
  categoryCircleActive: {
    opacity: 1,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  categoryEmoji: { fontSize: 26 },
  categoryLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  dateRow: {
    flexDirection: 'row-reverse',
    gap: spacing[2],
    marginBottom: spacing[5],
  },
  dateChip: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
    backgroundColor: colors.background.card,
  },
  dateChipLabel:       { fontFamily: typography.fonts.medium, fontSize: typography.sizes.sm, color: colors.text.secondary },
  dateChipLabelActive: { color: colors.white },

  noteInput: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    backgroundColor: colors.background.card,
    borderRadius: radius.lg,
    padding: spacing[4],
    minHeight: 80,
    marginBottom: spacing[5],
  },

  error: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.expense[600],
    textAlign: 'center',
    marginBottom: spacing[3],
  },
});
