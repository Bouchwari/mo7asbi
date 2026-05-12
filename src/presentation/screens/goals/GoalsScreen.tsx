import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import { theme } from '@presentation/theme';
import { Button, EmptyState, ScreenWrapper } from '@presentation/components/ui';
import { useGoalStore } from '@presentation/store/goalStore';
import { SavingsGoal } from '@domain/goal/entities/SavingsGoal';

const { colors, typography, spacing, radius, animations } = theme;

// ─── Progress bar ─────────────────────────────────────────────────────────────

function GoalProgressBar({ percent }: { percent: number }): React.JSX.Element {
  const width = useSharedValue(0);
  useEffect(() => { width.value = withSpring(percent, animations.spring.gentle); }, [percent]);
  const style = useAnimatedStyle(() => ({ width: `${width.value}%` as `${number}%` }));
  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, style]} />
    </View>
  );
}

// ─── Goal card ────────────────────────────────────────────────────────────────

function GoalCard({ goal, index }: { goal: SavingsGoal; index: number }): React.JSX.Element {
  const { t } = useTranslation();
  const { depositToGoal } = useGoalStore();
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmt,  setDepositAmt]  = useState('');

  const handleDeposit = async (): Promise<void> => {
    const parsed = parseFloat(depositAmt.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await depositToGoal({ goalId: goal.id.value, amount: parsed, currency: 'MAD' });
    setDepositAmt('');
    setShowDeposit(false);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', ...animations.spring.gentle, delay: index * 60 }}
      style={styles.goalCard}
    >
      <View style={styles.goalHeader}>
        <Text style={styles.goalEmoji}>{goal.emoji}</Text>
        <View style={styles.goalInfo}>
          <Text style={styles.goalName}>{goal.name}</Text>
          <Text style={styles.goalAmounts}>
            {goal.savedAmount.format()} / {goal.targetAmount.format()}
          </Text>
        </View>
        <Text style={[styles.goalPercent, goal.isCompleted && { color: colors.income[600] }]}>
          {Math.round(goal.progressPercent)}٪
        </Text>
      </View>

      <GoalProgressBar percent={goal.progressPercent} />

      {!goal.isCompleted && (
        <Pressable
          onPress={() => { void Haptics.selectionAsync(); setShowDeposit(v => !v); }}
          style={styles.depositToggle}
        >
          <Text style={styles.depositToggleLabel}>{t('goals.deposit')}</Text>
        </Pressable>
      )}

      {showDeposit && (
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', ...animations.spring.snappy }}
          style={styles.depositRow}
        >
          <TextInput
            value={depositAmt}
            onChangeText={setDepositAmt}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.text.tertiary}
            textAlign="right"
            style={styles.depositInput}
          />
          <Button label={t('goals.add')} onPress={() => { void handleDeposit(); }} />
        </MotiView>
      )}
    </MotiView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function GoalsScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const { goals, isLoading, loadGoals, createGoal } = useGoalStore();

  const [showForm, setShowForm] = useState(false);
  const [name,     setName]     = useState('');
  const [target,   setTarget]   = useState('');
  const [emoji,    setEmoji]    = useState('🎯');
  const [formErr,  setFormErr]  = useState<string | null>(null);

  useEffect(() => { void loadGoals(); }, []);

  const handleCreate = async (): Promise<void> => {
    const parsed = parseFloat(target.replace(',', '.'));
    if (!name.trim() || isNaN(parsed) || parsed <= 0) {
      setFormErr(t('errors.fillRequired'));
      return;
    }
    setFormErr(null);
    const result = await createGoal({ name: name.trim(), targetAmount: parsed, currency: 'MAD', emoji });
    if (result.success) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowForm(false); setName(''); setTarget(''); setEmoji('🎯');
    } else {
      setFormErr(result.error !== undefined ? result.error : null);
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
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowForm(v => !v); }}
              style={styles.addBtn}
            >
              <Text style={styles.addBtnLabel}>{showForm ? '✕' : '+ ' + t('goals.newGoal')}</Text>
            </Pressable>
            <Text style={styles.title}>{t('goals.title')}</Text>
          </View>
        </MotiView>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* ─── New goal form ─── */}
          {showForm && (
            <MotiView
              from={{ opacity: 0, translateY: -12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', ...animations.spring.snappy }}
              style={styles.formCard}
            >
              <TextInput value={emoji} onChangeText={setEmoji} style={styles.emojiInput} maxLength={2} />
              <TextInput value={name} onChangeText={setName} placeholder={t('goals.namePlaceholder')} placeholderTextColor={colors.text.tertiary} textAlign="right" style={styles.input} />
              <TextInput value={target} onChangeText={setTarget} keyboardType="decimal-pad" placeholder={t('goals.targetPlaceholder')} placeholderTextColor={colors.text.tertiary} textAlign="right" style={styles.input} />
              {formErr ? <Text style={styles.error}>{formErr}</Text> : null}
              <Button label={t('goals.create')} onPress={() => { void handleCreate(); }} />
            </MotiView>
          )}

          {!isLoading && goals.length === 0 && !showForm && (
            <EmptyState emoji="🎯" title={t('goals.emptyTitle')} subtitle={t('goals.emptySubtitle')} />
          )}

          {goals.map((goal, i) => (
            <GoalCard key={goal.id.value} goal={goal} index={i} />
          ))}
        </ScrollView>
      </ScreenWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background.app },
  header: { paddingHorizontal: spacing[4], paddingVertical: spacing[4], backgroundColor: colors.white, borderBottomWidth: 0.5, borderBottomColor: colors.border.default },
  headerRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  title:  { fontFamily: typography.fonts.bold, fontSize: typography.sizes.md, color: colors.text.primary, textAlign: 'right' },
  addBtn: { backgroundColor: colors.primary[50], paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: radius.full },
  addBtnLabel: { fontFamily: typography.fonts.medium, fontSize: typography.sizes.sm, color: colors.primary[600] },
  scroll: { padding: spacing[4], paddingBottom: spacing[8] },
  formCard: { backgroundColor: colors.background.card, borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[3], gap: spacing[3] },
  emojiInput: { fontFamily: typography.fonts.bold, fontSize: 32, textAlign: 'center', padding: spacing[2] },
  input: { backgroundColor: colors.background.input, borderRadius: radius.md, padding: spacing[3], fontFamily: typography.fonts.regular, fontSize: typography.sizes.base, color: colors.text.primary },
  error: { fontFamily: typography.fonts.regular, fontSize: typography.sizes.sm, color: colors.expense[600], textAlign: 'center' },
  goalCard: { backgroundColor: colors.background.card, borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[3] },
  goalHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing[3], marginBottom: spacing[3] },
  goalEmoji:  { fontSize: 32 },
  goalInfo:   { flex: 1, alignItems: 'flex-end', gap: 2 },
  goalName:   { fontFamily: typography.fonts.bold,    fontSize: typography.sizes.base, color: colors.text.primary,   textAlign: 'right' },
  goalAmounts:{ fontFamily: typography.fonts.regular, fontSize: typography.sizes.sm,   color: colors.text.secondary, textAlign: 'right' },
  goalPercent:{ fontFamily: typography.fonts.bold,    fontSize: typography.sizes.md,   color: colors.primary[600] },
  progressTrack: { height: 8, backgroundColor: colors.background.input, borderRadius: radius.full, overflow: 'hidden', marginBottom: spacing[3] },
  progressFill:  { height: 8, backgroundColor: colors.primary[600], borderRadius: radius.full },
  depositToggle: { alignSelf: 'flex-end' },
  depositToggleLabel: { fontFamily: typography.fonts.medium, fontSize: typography.sizes.sm, color: colors.primary[600] },
  depositRow: { flexDirection: 'row-reverse', gap: spacing[2], alignItems: 'center', marginTop: spacing[2] },
  depositInput: { flex: 1, backgroundColor: colors.background.input, borderRadius: radius.md, padding: spacing[3], fontFamily: typography.fonts.regular, fontSize: typography.sizes.base, color: colors.text.primary },
});
