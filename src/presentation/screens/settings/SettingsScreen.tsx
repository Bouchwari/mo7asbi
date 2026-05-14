import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import { theme } from '@presentation/theme';
import { ScreenWrapper } from '@presentation/components/ui';

const { colors, typography, spacing, radius, animations } = theme;

// ─── Setting row component ────────────────────────────────────────────────────

interface SettingRowProps {
  icon:     string;
  iconBg:   string;
  label:    string;
  value?:   string;
  onPress?: () => void;
  index:    number;
  last?:    boolean;
}

function SettingRow({ icon, iconBg, label, value, onPress, index, last }: SettingRowProps): React.JSX.Element {
  return (
    <MotiView
      from={{ opacity: 0, translateX: 12 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'spring', ...animations.spring.gentle, delay: index * 40 }}
    >
      <Pressable
        onPress={() => { void Haptics.selectionAsync(); onPress?.(); }}
        disabled={!onPress}
        style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.82 }]}
      >
        {/* Chevron (RTL: left side = end) */}
        {onPress && <Text style={styles.chevron}>‹</Text>}

        {/* Value */}
        {value ? <Text style={styles.settingValue} numberOfLines={1}>{value}</Text> : null}

        {/* Label */}
        <Text style={styles.settingLabel}>{label}</Text>

        {/* Icon box (RTL: right side = start) */}
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <Text style={styles.iconEmoji}>{icon}</Text>
        </View>
      </Pressable>
      {!last && <View style={styles.divider} />}
    </MotiView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SettingsScreen(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenWrapper>

        {/* ─── Header ─── */}
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', ...animations.spring.gentle }}
          style={styles.header}
        >
          <Text style={styles.title}>{t('settings.title')}</Text>
        </MotiView>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ─── App identity card ─── */}
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', ...animations.spring.gentle, delay: 60 }}
            style={styles.identityCard}
          >
            <View style={styles.appLogoCircle}>
              <Text style={styles.appLogoEmoji}>💰</Text>
            </View>
            <Text style={styles.appName}>حسابي</Text>
            <Text style={styles.appTagline}>{t('settings.tagline')}</Text>
          </MotiView>

          {/* ─── General section ─── */}
          <Text style={styles.sectionTitle}>{t('settings.general')}</Text>
          <View style={styles.card}>
            <SettingRow
              index={0}
              icon="💵"
              iconBg={colors.income[600]}
              label={t('settings.currency')}
              value="MAD — درهم"
            />
            <SettingRow
              index={1}
              icon="🌐"
              iconBg={colors.primary[600]}
              label={t('settings.language')}
              value="العربية"
              last
            />
          </View>

          {/* ─── About section ─── */}
          <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
          <View style={styles.card}>
            <SettingRow
              index={2}
              icon="👨‍💻"
              iconBg={colors.expense[600]}
              label={t('settings.madeWith')}
              value="عبدالله بوشواري"
            />
            <SettingRow
              index={3}
              icon="📱"
              iconBg={colors.amber[600]}
              label={t('settings.platform')}
              value="Expo 52 · RN 0.76"
            />
            <SettingRow
              index={4}
              icon="🏷️"
              iconBg={colors.gray[600]}
              label={t('settings.version')}
              value="1.0.0"
              last
            />
          </View>

        </ScrollView>
      </ScreenWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background.app },
  header: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    backgroundColor: colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border.default,
  },
  title: { fontFamily: typography.fonts.bold, fontSize: typography.sizes.md, color: colors.text.primary, textAlign: 'right' },
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },

  identityCard: {
    backgroundColor: colors.background.card,
    borderRadius: radius.xl,
    padding: spacing[6],
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[5],
  },
  appLogoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  appLogoEmoji: { fontSize: 32 },
  appName:      { fontFamily: typography.fonts.bold,    fontSize: typography.sizes.xl,   color: colors.primary[600] },
  appTagline:   { fontFamily: typography.fonts.regular, fontSize: typography.sizes.base, color: colors.text.secondary, textAlign: 'center' },

  sectionTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    textAlign: 'right',
    marginBottom: spacing[2],
    marginTop: spacing[1],
    paddingHorizontal: spacing[1],
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: radius.lg,
    marginBottom: spacing[4],
    overflow: 'hidden',
  },

  settingRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconEmoji:    { fontSize: 18 },
  settingLabel: { flex: 1, fontFamily: typography.fonts.medium, fontSize: typography.sizes.base, color: colors.text.primary, textAlign: 'right' },
  settingValue: { fontFamily: typography.fonts.regular, fontSize: typography.sizes.sm, color: colors.text.tertiary },
  chevron:      { fontFamily: typography.fonts.regular, fontSize: typography.sizes.lg, color: colors.text.tertiary },
  divider:      { height: 0.5, backgroundColor: colors.border.default, marginHorizontal: spacing[4] },
});
