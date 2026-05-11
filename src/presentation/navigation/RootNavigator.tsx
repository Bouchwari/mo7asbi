import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import HomeScreen        from '@presentation/screens/home/HomeScreen';
import StatisticsScreen  from '@presentation/screens/statistics/StatisticsScreen';
import GoalsScreen       from '@presentation/screens/goals/GoalsScreen';
import SettingsScreen    from '@presentation/screens/settings/SettingsScreen';
import { theme }         from '@presentation/theme';

export type RootTabParamList = {
  Home:       undefined;
  Statistics: undefined;
  Goals:      undefined;
  Settings:   undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const { colors, typography, spacing } = theme;

export function RootNavigator(): React.JSX.Element {
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
      <Tab.Screen name="Home"       component={HomeScreen}       options={{ title: 'الرئيسية', tabBarIcon: ({ color }) => <TabIcon label="🏠" color={color} /> }} />
      <Tab.Screen name="Statistics" component={StatisticsScreen} options={{ title: 'الإحصاء',  tabBarIcon: ({ color }) => <TabIcon label="📊" color={color} /> }} />
      <Tab.Screen name="Goals"      component={GoalsScreen}      options={{ title: 'الأهداف',  tabBarIcon: ({ color }) => <TabIcon label="🎯" color={color} /> }} />
      <Tab.Screen name="Settings"   component={SettingsScreen}   options={{ title: 'الإعدادات', tabBarIcon: ({ color }) => <TabIcon label="⚙️" color={color} /> }} />
    </Tab.Navigator>
  );
}

function TabIcon({ label, color }: { label: string; color: string }): React.JSX.Element {
  return <View style={[styles.icon, { borderColor: color }]}><React.Fragment>{label}</React.Fragment></View>;
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor:  colors.border.default,
    borderTopWidth:  0.5,
    height:          theme.layout.bottomNavHeight + spacing[2],
    paddingTop:      spacing[1],
  },
  icon: {
    width: 24, height: 24,
    alignItems: 'center', justifyContent: 'center',
  },
});
