import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import HomeScreen            from '@presentation/screens/home/HomeScreen';
import StatisticsScreen      from '@presentation/screens/statistics/StatisticsScreen';
import GoalsScreen           from '@presentation/screens/goals/GoalsScreen';
import SettingsScreen        from '@presentation/screens/settings/SettingsScreen';
import AddTransactionScreen  from '@presentation/screens/add-transaction/AddTransactionScreen';
import TransactionsScreen    from '@presentation/screens/transactions/TransactionsScreen';
import { theme }             from '@presentation/theme';

// ─── Param lists ──────────────────────────────────────────────────────────────

export type RootTabParamList = {
  Home:       undefined;
  Statistics: undefined;
  Goals:      undefined;
  Settings:   undefined;
};

export type RootStackParamList = {
  MainTabs:       undefined;
  AddTransaction: undefined;
  Transactions:   undefined;
};

// ─── Navigators ───────────────────────────────────────────────────────────────

const Tab   = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const { colors, typography, spacing } = theme;

// ─── Tab icon ─────────────────────────────────────────────────────────────────

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }): React.JSX.Element {
  return (
    <View style={styles.iconWrap}>
      <Text style={[styles.iconEmoji, focused && styles.iconEmojiFocused]}>{emoji}</Text>
    </View>
  );
}

// ─── Tab navigator ────────────────────────────────────────────────────────────

function MainTabs(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor:   colors.primary[600],
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarLabelStyle: {
          fontFamily: typography.fonts.medium,
          fontSize:   typography.sizes.xs,
          marginBottom: spacing[1],
        },
      }}
      screenListeners={{ tabPress: () => { void Haptics.selectionAsync(); } }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'الرئيسية', tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} /> }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{ title: 'الإحصاء', tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} /> }}
      />
      <Tab.Screen
        name="Goals"
        component={GoalsScreen}
        options={{ title: 'الأهداف', tabBarIcon: ({ focused }) => <TabIcon emoji="🎯" focused={focused} /> }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'الإعدادات', tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

// ─── Root stack (tabs + modals) ───────────────────────────────────────────────

export function RootNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{
          presentation: 'modal',
          animation:    'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor:  colors.border.default,
    borderTopWidth:  0.5,
    height:          theme.layout.bottomNavHeight + spacing[2],
    paddingTop:      spacing[1],
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 20,
    opacity: 0.5,
  },
  iconEmojiFocused: {
    opacity: 1,
  },
});
