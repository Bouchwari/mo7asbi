import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import { theme } from '@presentation/theme';
import { AnimatedCard, ScreenWrapper } from '@presentation/components/ui';

const { colors, typography, spacing, animations } = theme;

interface SettingRowProps {
  label:    string;
  value?:   string;
  onPress?: () => void;
  index:    number;
}

function SettingRow({ label, value, onPress, index }: SettingRowProps): React.JSX.Element {
  return (
    <MotiView
      from={{ opacity: 0, translateX: 12 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'spring', ...animations.spring.gentle, delay: index * 50 }}
    >
      <Pressable
        onPress={() => { void Haptics.selectionAsync(); onPress?.(); }}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.88 }]}
        disabled={!onPress}
      >
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        <Text style={styles.rowLabel}>{label}</Text>
      </Pressable>
    </MotiView>
  );
}

export default function SettingsScreen(): React.JSX.Element {
  const { t } = useTranslation();

  const appVersion = '1.0.0';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenWrapper>
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', ...animations.spring.gentle }}
          style={styles.header}
        >
          <Text style={styles.title}>{t('settings.title')}</Text>
        </MotiView>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* ─── App info ─── */}
          <AnimatedCard delay={60} style={styles.infoCard}>
            <Text style={styles.appName}>حسابي</Text>
            <Text style={styles.appVersion}>{t('settings.version')} {appVersion}</Text>
            <Text style={styles.appTagline}>{t('settings.tagline')}</Text>
          </AnimatedCard>

          {/* ─── General ─── */}
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 250, delay: 120 }}>
            <Text style={styles.sectionTitle}>{t('settings.general')}</Text>
          </MotiView>

          <AnimatedCard delay={160}>
            <SettingRow index={0} label={t('settings.currency')} value="MAD — درهم مغربي" />
            <View style={styles.divider} />
            <SettingRow index={1} label={t('settings.language')} value="العربية" />
          </AnimatedCard>

          {/* ─── About ─── */}
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 250, delay: 220 }}>
            <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
          </MotiView>

          <AnimatedCard delay={260}>
            <SettingRow index={0} label={t('settings.madeWith')} value="Claude + DDD ❤️" />
            <View style={styles.divider} />
            <SettingRow index={1} label={t('settings.platform')} value="Expo SDK 52 · React Native 0.76" />
          </AnimatedCard>
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
  sectionTitle: { fontFamily: typography.fonts.bold, fontSize: typography.sizes.sm, color: colors.text.tertiary, textAlign: 'right', marginBottom: spacing[2], marginTop: spacing[2] },
  infoCard: { alignItems: 'center', gap: spacing[1], marginBottom: spacing[3] },
  appName:    { fontFamily: typography.fonts.bold,    fontSize: typography.sizes.xl,   color: colors.primary[600] },
  appVersion: { fontFamily: typography.fonts.regular, fontSize: typography.sizes.sm,   color: colors.text.tertiary },
  appTagline: { fontFamily: typography.fonts.regular, fontSize: typography.sizes.base, color: colors.text.secondary, textAlign: 'center' },
  row: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing[3] },
  rowLabel: { fontFamily: typography.fonts.medium, fontSize: typography.sizes.base, color: colors.text.primary },
  rowValue: { fontFamily: typography.fonts.regular, fontSize: typography.sizes.sm, color: colors.text.secondary },
  divider: { height: 0.5, backgroundColor: colors.border.default },
});
