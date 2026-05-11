import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import { theme } from '@presentation/theme';
import { Button, ScreenWrapper } from '@presentation/components/ui';
import { useTransactionStore } from '@presentation/store/transactionStore';
import { CategoryId, TransactionType, CATEGORIES } from '@domain/transaction/value-objects/Category';

const { colors, typography, spacing, radius, animations } = theme;

export default function AddTransactionScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const { addTransaction } = useTransactionStore();

  const [type,       setType]       = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount,     setAmount]     = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>(CategoryId.FOOD);
  const [note,       setNote]       = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const expenseCategories = Object.values(CATEGORIES).filter(c => c.type === TransactionType.EXPENSE);
  const incomeCategories  = Object.values(CATEGORIES).filter(c => c.type === TransactionType.INCOME);
  const visibleCategories = type === TransactionType.EXPENSE ? expenseCategories : incomeCategories;

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
      date: new Date(),
      note: note.trim() || undefined,
      recurring: { isRecurring: false },
    });
    setLoading(false);
    if (result.success) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAmount(''); setNote(''); setError(null);
    } else {
      setError(result.error ?? t('errors.generic'));
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenWrapper>
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', ...animations.spring.gentle }}
          style={styles.header}
        >
          <Text style={styles.title}>{t('transaction.add')}</Text>
        </MotiView>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* ─── Type toggle ─── */}
            <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', ...animations.spring.gentle, delay: 60 }} style={styles.card}>
              <View style={styles.typeRow}>
                {([TransactionType.EXPENSE, TransactionType.INCOME] as const).map(tp => (
                  <Pressable
                    key={tp}
                    onPress={() => { void Haptics.selectionAsync(); setType(tp); setCategoryId(tp === TransactionType.EXPENSE ? CategoryId.FOOD : CategoryId.SALARY); }}
                    style={[styles.typeBtn, type === tp && styles[`typeBtn_${tp}`]]}
                  >
                    <Text style={[styles.typeBtnLabel, type === tp && styles[`typeBtnLabel_${tp}`]]}>
                      {tp === TransactionType.EXPENSE ? t('transaction.expense') : t('transaction.income')}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </MotiView>

            {/* ─── Amount ─── */}
            <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', ...animations.spring.gentle, delay: 120 }} style={styles.card}>
              <Text style={styles.fieldLabel}>{t('transaction.amount')}</Text>
              <View style={styles.amountRow}>
                <Text style={styles.currencySymbol}>د.م</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.text.tertiary}
                  textAlign="right"
                  style={styles.amountInput}
                />
              </View>
            </MotiView>

            {/* ─── Category ─── */}
            <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', ...animations.spring.gentle, delay: 180 }} style={styles.card}>
              <Text style={styles.fieldLabel}>{t('transaction.category')}</Text>
              <View style={styles.categoryGrid}>
                {visibleCategories.map(cat => (
                  <Pressable
                    key={cat.id}
                    onPress={() => { void Haptics.selectionAsync(); setCategoryId(cat.id); }}
                    style={[styles.categoryChip, categoryId === cat.id && { backgroundColor: `${cat.color}20`, borderColor: cat.color }]}
                  >
                    <Text style={styles.categoryChipLabel}>{cat.id}</Text>
                  </Pressable>
                ))}
              </View>
            </MotiView>

            {/* ─── Note ─── */}
            <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', ...animations.spring.gentle, delay: 240 }} style={styles.card}>
              <Text style={styles.fieldLabel}>{t('transaction.note')}</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={t('transaction.notePlaceholder')}
                placeholderTextColor={colors.text.tertiary}
                textAlign="right"
                style={styles.noteInput}
                multiline
              />
            </MotiView>

            {/* ─── Error ─── */}
            {error ? (
              <Text style={styles.error}>{error}</Text>
            ) : null}

            {/* ─── Submit ─── */}
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ type: 'timing', duration: 300, delay: 300 }}>
              <Button label={t('transaction.save')} onPress={() => { void handleSubmit(); }} loading={loading} />
            </MotiView>
          </ScrollView>
        </KeyboardAvoidingView>
      </ScreenWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background.app },
  header: {
    paddingHorizontal: spacing[4], paddingVertical: spacing[4],
    backgroundColor: colors.white, borderBottomWidth: 0.5, borderBottomColor: colors.border.default,
  },
  title: { fontFamily: typography.fonts.bold, fontSize: typography.sizes.md, color: colors.text.primary, textAlign: 'right' },
  scroll: { padding: spacing[4], paddingBottom: spacing[8] },
  card: { backgroundColor: colors.background.card, borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[3] },
  typeRow: { flexDirection: 'row-reverse', gap: spacing[2] },
  typeBtn: {
    flex: 1, paddingVertical: spacing[3], borderRadius: radius.md,
    alignItems: 'center', backgroundColor: colors.background.input, borderWidth: 1.5, borderColor: 'transparent',
  },
  typeBtn_expense:       { backgroundColor: colors.expense[50],  borderColor: colors.expense[600] },
  typeBtn_income:        { backgroundColor: colors.income[50],   borderColor: colors.income[600] },
  typeBtnLabel:          { fontFamily: typography.fonts.medium, fontSize: typography.sizes.sm, color: colors.text.secondary },
  typeBtnLabel_expense:  { color: colors.expense[600] },
  typeBtnLabel_income:   { color: colors.income[600] },
  fieldLabel: { fontFamily: typography.fonts.medium, fontSize: typography.sizes.sm, color: colors.text.secondary, textAlign: 'right', marginBottom: spacing[2] },
  amountRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing[2] },
  currencySymbol: { fontFamily: typography.fonts.bold, fontSize: typography.sizes.lg, color: colors.text.tertiary },
  amountInput: {
    flex: 1, fontFamily: typography.fonts.bold, fontSize: typography.sizes['2xl'],
    color: colors.text.primary, backgroundColor: colors.background.input,
    borderRadius: radius.md, padding: spacing[3],
  },
  categoryGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing[2] },
  categoryChip: {
    paddingHorizontal: spacing[3], paddingVertical: spacing[2],
    borderRadius: radius.full, backgroundColor: colors.background.input,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  categoryChipLabel: { fontFamily: typography.fonts.medium, fontSize: typography.sizes.xs, color: colors.text.secondary },
  noteInput: {
    fontFamily: typography.fonts.regular, fontSize: typography.sizes.base,
    color: colors.text.primary, backgroundColor: colors.background.input,
    borderRadius: radius.md, padding: spacing[3], minHeight: 80,
  },
  error: { fontFamily: typography.fonts.regular, fontSize: typography.sizes.sm, color: colors.expense[600], textAlign: 'center', marginBottom: spacing[3] },
});
