import React from 'react';
import { Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { theme } from '@presentation/theme';

const { colors, typography, spacing, radius, animations } = theme;

// ─── AnimatedCard ─────────────────────────────────────────────────────────────

interface AnimatedCardProps {
  children:   React.ReactNode;
  delay?:     number;
  onPress?:   () => void;
  style?:     object;
}

export function AnimatedCard({ children, delay = 0, onPress, style }: AnimatedCardProps): React.JSX.Element {
  const card = (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', ...animations.spring.gentle, delay }}
      style={[styles.card, style]}
    >
      {children}
    </MotiView>
  );

  if (!onPress) return card;
  return (
    <Pressable
      onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
    >
      {card}
    </Pressable>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps {
  label:      string;
  onPress:    () => void;
  variant?:   'primary' | 'secondary' | 'danger';
  loading?:   boolean;
  disabled?:  boolean;
}

export function Button({ label, onPress, variant = 'primary', loading, disabled }: ButtonProps): React.JSX.Element {
  const handlePress = (): void => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled ?? loading}
      style={({ pressed }) => [
        styles.button,
        styles[`button_${variant}`],
        (disabled ?? loading) && styles.button_disabled,
        pressed && { opacity: 0.88 },
      ]}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? colors.white : colors.primary[600]} size="small" />
        : <Text style={[styles.buttonLabel, styles[`buttonLabel_${variant}`]]}>{label}</Text>
      }
    </Pressable>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  emoji:    string;
  title:    string;
  subtitle: string;
}

export function EmptyState({ emoji, title, subtitle }: EmptyStateProps): React.JSX.Element {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', ...animations.spring.gentle }}
      style={styles.emptyState}
    >
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </MotiView>
  );
}

// ─── ScreenWrapper ────────────────────────────────────────────────────────────

export function ScreenWrapper({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <View style={styles.screen}>{children}</View>;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius:    radius.lg,
    padding:         spacing[4],
    marginBottom:    spacing[3],
  },
  button: {
    borderRadius:    radius.md,
    paddingVertical: spacing[3],
    alignItems:      'center',
    justifyContent:  'center',
  },
  button_primary:   { backgroundColor: colors.primary[600] },
  button_secondary: { backgroundColor: colors.background.input },
  button_danger:    { backgroundColor: colors.expense[600] },
  button_disabled:  { opacity: 0.5 },
  buttonLabel: {
    fontFamily: typography.fonts.bold,
    fontSize:   typography.sizes.base,
  },
  buttonLabel_primary:   { color: colors.white },
  buttonLabel_secondary: { color: colors.text.primary },
  buttonLabel_danger:    { color: colors.white },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[12],
    gap: spacing[2],
  },
  emptyEmoji:    { fontSize: 48 },
  emptyTitle:    { fontFamily: typography.fonts.bold,    fontSize: typography.sizes.md, color: colors.text.primary,   textAlign: 'center' },
  emptySubtitle: { fontFamily: typography.fonts.regular, fontSize: typography.sizes.sm, color: colors.text.secondary, textAlign: 'center' },
  screen: { flex: 1, backgroundColor: colors.background.app },
});
