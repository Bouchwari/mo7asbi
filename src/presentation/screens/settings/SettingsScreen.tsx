import React, { useEffect, useState } from 'react';
import {
  FlatList, Pressable, ScrollView, StyleSheet,
  Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import { theme } from '@presentation/theme';
import { ScreenWrapper } from '@presentation/components/ui';
import { useSettingsStore } from '@presentation/store/settingsStore';

const { colors, typography, spacing, radius, animations } = theme;

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

// ─── Setting row ──────────────────────────────────────────────────────────────

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
        {onPress && <Text style={styles.chevron}>‹</Text>}
        {value ? <Text style={styles.settingValue} numberOfLines={1}>{value}</Text> : null}
        <Text style={styles.settingLabel}>{label}</Text>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <Text style={styles.iconEmoji}>{icon}</Text>
        </View>
      </Pressable>
      {!last && <View style={styles.divider} />}
    </MotiView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

type EditingField = 'salary' | 'payday' | null;

export default function SettingsScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const { settings, loadSettings, updateSalary, updatePayday } = useSettingsStore();

  const [editingField, setEditingField] = useState<EditingField>(null);
  const [salaryInput,  setSalaryInput]  = useState('');
  const [saveError,    setSaveError]    = useState<string | null>(null);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  // ── Salary edit ─────────────────────────────────────────────────────────────

  const openSalaryEdit = (): void => {
    setSalaryInput(settings.hasSalary ? settings.monthlySalary.toFixed(0) : '');
    setSaveError(null);
    setEditingField(f => f === 'salary' ? null : 'salary');
  };

  const handleSaveSalary = async (): Promise<void> => {
    const parsed = parseFloat(salaryInput.replace(',', '.'));
    if (isNaN(parsed) || parsed < 0) {
      setSaveError(t('errors.invalidAmount'));
      return;
    }
    const result = await updateSalary(parsed);
    if (result.success) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEditingField(null);
      setSaveError(null);
    } else {
      setSaveError(result.error ?? t('errors.generic'));
    }
  };

  // ── Payday edit ─────────────────────────────────────────────────────────────

  const openPaydayEdit = (): void => {
    setSaveError(null);
    setEditingField(f => f === 'payday' ? null : 'payday');
  };

  const handleSelectDay = async (day: number): Promise<void> => {
    void Haptics.selectionAsync();
    const result = await updatePayday(day);
    if (result.success) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEditingField(null);
    }
  };

  // ── Display values ───────────────────────────────────────────────────────────

  const salaryDisplay = settings.hasSalary
    ? `${settings.monthlySalary.toFixed(0)} د.م`
    : t('salary.notSet');

  const paydayDisplay = settings.hasPayday
    ? `${t('salary.day')} ${settings.payday}`
    : t('salary.notSet');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenWrapper>

        {/* ─── Header ──────────────────────────────────────────────────── */}
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', ...animations.spring.gentle }}
          style={styles.header}
        >
          <Text style={styles.title}>{t('settings.title')}</Text>
        </MotiView>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ─── App identity card ─────────────────────────────────────── */}
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

          {/* ─── Salary section ────────────────────────────────────────── */}
          <Text style={styles.sectionTitle}>{t('salary.sectionTitle')}</Text>
          <View style={styles.card}>

            {/* Monthly salary row */}
            <SettingRow
              index={0}
              icon="💰"
              iconBg={colors.income[600]}
              label={t('salary.monthlySalary')}
              value={salaryDisplay}
              onPress={openSalaryEdit}
            />

            {/* Salary input expansion */}
            {editingField === 'salary' && (
              <MotiView
                from={{ opacity: 0, translateY: -6 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', ...animations.spring.snappy }}
                style={styles.editPanel}
              >
                <TextInput
                  value={salaryInput}
                  onChangeText={setSalaryInput}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={colors.text.tertiary}
                  textAlign="right"
                  style={styles.editInput}
                  autoFocus
                />
                <Text style={styles.editCurrency}>د.م</Text>
                <Pressable
                  onPress={() => { void handleSaveSalary(); }}
                  style={({ pressed }) => [styles.editSaveBtn, pressed && { opacity: 0.82 }]}
                >
                  <Text style={styles.editSaveBtnText}>{t('salary.save')}</Text>
                </Pressable>
              </MotiView>
            )}

            <View style={styles.divider} />

            {/* Payday row */}
            <SettingRow
              index={1}
              icon="📅"
              iconBg={colors.primary[600]}
              label={t('salary.payday')}
              value={paydayDisplay}
              onPress={openPaydayEdit}
              last
            />

            {/* Payday day picker */}
            {editingField === 'payday' && (
              <MotiView
                from={{ opacity: 0, translateY: -6 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', ...animations.spring.snappy }}
              >
                <FlatList
                  data={DAYS}
                  horizontal
                  inverted
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(d) => d.toString()}
                  contentContainerStyle={styles.dayList}
                  renderItem={({ item: day }) => {
                    const isSelected = settings.payday === day;
                    return (
                      <Pressable
                        onPress={() => { void handleSelectDay(day); }}
                        style={[styles.dayChip, isSelected && styles.dayChipActive]}
                      >
                        <Text style={[styles.dayChipText, isSelected && styles.dayChipTextActive]}>
                          {day}
                        </Text>
                      </Pressable>
                    );
                  }}
                />
              </MotiView>
            )}

            {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
          </View>

          {/* ─── General section ───────────────────────────────────────── */}
          <Text style={styles.sectionTitle}>{t('settings.general')}</Text>
          <View style={styles.card}>
            <SettingRow
              index={2}
              icon="💵"
              iconBg={colors.income[600]}
              label={t('settings.currency')}
              value="MAD — درهم"
            />
            <SettingRow
              index={3}
              icon="🌐"
              iconBg={colors.primary[600]}
              label={t('settings.language')}
              value="العربية"
              last
            />
          </View>

          {/* ─── About section ─────────────────────────────────────────── */}
          <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
          <View style={styles.card}>
            <SettingRow
              index={4}
              icon="👨‍💻"
              iconBg={colors.expense[600]}
              label={t('settings.madeWith')}
              value="عبدالله بوشواري"
            />
            <SettingRow
              index={5}
              icon="📱"
              iconBg={colors.amber[600]}
              label={t('settings.platform')}
              value="Expo 52 · RN 0.76"
            />
            <SettingRow
              index={6}
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
    paddingVertical:   spacing[4],
    backgroundColor:   colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border.default,
  },
  title:  { fontFamily: typography.fonts.bold, fontSize: typography.sizes.md, color: colors.text.primary, textAlign: 'right' },
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },

  identityCard: {
    backgroundColor: colors.background.card,
    borderRadius:    radius.xl,
    padding:         spacing[6],
    alignItems:      'center',
    gap:             spacing[2],
    marginBottom:    spacing[5],
  },
  appLogoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.primary[600],
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing[2],
  },
  appLogoEmoji: { fontSize: 32 },
  appName:      { fontFamily: typography.fonts.bold,    fontSize: typography.sizes.xl,   color: colors.primary[600] },
  appTagline:   { fontFamily: typography.fonts.regular, fontSize: typography.sizes.base, color: colors.text.secondary, textAlign: 'center' },

  sectionTitle: {
    fontFamily:       typography.fonts.bold,
    fontSize:         typography.sizes.sm,
    color:            colors.text.tertiary,
    textAlign:        'right',
    marginBottom:     spacing[2],
    marginTop:        spacing[1],
    paddingHorizontal: spacing[1],
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius:    radius.lg,
    marginBottom:    spacing[4],
    overflow:        'hidden',
  },

  settingRow: {
    flexDirection:    'row-reverse',
    alignItems:       'center',
    paddingVertical:  spacing[3],
    paddingHorizontal: spacing[4],
    gap:              spacing[3],
  },
  iconBox: {
    width: 36, height: 36,
    borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  iconEmoji:    { fontSize: 18 },
  settingLabel: { flex: 1, fontFamily: typography.fonts.medium, fontSize: typography.sizes.base, color: colors.text.primary, textAlign: 'right' },
  settingValue: { fontFamily: typography.fonts.regular, fontSize: typography.sizes.sm, color: colors.text.tertiary },
  chevron:      { fontFamily: typography.fonts.regular, fontSize: typography.sizes.lg, color: colors.text.tertiary },
  divider:      { height: 0.5, backgroundColor: colors.border.default, marginHorizontal: spacing[4] },

  editPanel: {
    flexDirection:    'row-reverse',
    alignItems:       'center',
    paddingHorizontal: spacing[4],
    paddingVertical:  spacing[3],
    gap:              spacing[3],
    borderTopWidth:   0.5,
    borderTopColor:   colors.border.default,
    backgroundColor:  colors.background.app,
  },
  editInput: {
    flex:             1,
    fontFamily:       typography.fonts.bold,
    fontSize:         typography.sizes.xl,
    color:            colors.text.primary,
    padding:          0,
  },
  editCurrency: {
    fontFamily: typography.fonts.medium,
    fontSize:   typography.sizes.base,
    color:      colors.text.tertiary,
  },
  editSaveBtn: {
    backgroundColor: colors.income[600],
    borderRadius:    radius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  editSaveBtnText: {
    fontFamily: typography.fonts.bold,
    fontSize:   typography.sizes.sm,
    color:      colors.white,
  },

  dayList: { paddingHorizontal: spacing[3], paddingVertical: spacing[3], gap: spacing[2] },
  dayChip: {
    width: 40, height: 40,
    borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.background.app,
  },
  dayChipActive:     { backgroundColor: colors.primary[600] },
  dayChipText:       { fontFamily: typography.fonts.medium, fontSize: typography.sizes.sm, color: colors.text.secondary },
  dayChipTextActive: { fontFamily: typography.fonts.bold,   fontSize: typography.sizes.sm, color: colors.white },

  errorText: {
    fontFamily:  typography.fonts.regular,
    fontSize:    typography.sizes.xs,
    color:       colors.expense[600],
    textAlign:   'right',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[2],
  },
});
