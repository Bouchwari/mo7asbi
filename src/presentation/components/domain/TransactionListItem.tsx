import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { ar as arLocale } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

import { Transaction } from '@domain/transaction/entities/Transaction';
import { TransactionType } from '@domain/transaction/value-objects/Category';
import { theme } from '@presentation/theme';

const { colors, typography, spacing, radius, animations } = theme;

interface Props {
  transaction: Transaction;
  index:       number;
  onPress?:    (tx: Transaction) => void;
}

export function TransactionListItem({ transaction: tx, index, onPress }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const isIncome = tx.type === TransactionType.INCOME;
  const amountColor = isIncome ? colors.income[600] : colors.expense[600];
  const amountSign  = isIncome ? '+' : '-';
  const categoryColor = tx.category.meta.color;
  const dateLabel = format(tx.date, 'd MMM', { locale: arLocale });

  const handlePress = (): void => {
    void Haptics.selectionAsync();
    onPress?.(tx);
  };

  return (
    <MotiView
      from={{ opacity: 0, translateX: 16 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'spring', ...animations.spring.gentle, delay: index * 40 }}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.88 }]}
      >
        {/* Category icon bubble */}
        <View style={[styles.iconBubble, { backgroundColor: `${categoryColor}20` }]}>
          <Text style={styles.iconEmoji}>{tx.category.meta.icon}</Text>
        </View>

        {/* Label + date */}
        <View style={styles.info}>
          <Text style={styles.categoryLabel} numberOfLines={1}>
            {t(`categories.${tx.category.meta.id}`)}
          </Text>
          {tx.note ? (
            <Text style={styles.note} numberOfLines={1}>{tx.note}</Text>
          ) : null}
          <Text style={styles.date}>{dateLabel}</Text>
        </View>

        {/* Amount */}
        <Text style={[styles.amount, { color: amountColor }]}>
          {amountSign}{tx.amount.format()}
        </Text>
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection:  'row-reverse',
    alignItems:     'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.background.card,
    borderRadius:    radius.md,
    marginBottom:    spacing[2],
    gap:             spacing[3],
  },
  iconBubble: {
    width: 44, height: 44,
    borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  iconEmoji: { fontSize: 20 },
  info: { flex: 1, alignItems: 'flex-end', gap: 2 },
  categoryLabel: {
    fontFamily: typography.fonts.medium,
    fontSize:   typography.sizes.base,
    color:      colors.text.primary,
    textAlign:  'right',
  },
  note: {
    fontFamily: typography.fonts.regular,
    fontSize:   typography.sizes.sm,
    color:      colors.text.secondary,
    textAlign:  'right',
  },
  date: {
    fontFamily: typography.fonts.regular,
    fontSize:   typography.sizes.xs,
    color:      colors.text.tertiary,
    textAlign:  'right',
  },
  amount: {
    fontFamily: typography.fonts.bold,
    fontSize:   typography.sizes.base,
    textAlign:  'left',
  },
});
