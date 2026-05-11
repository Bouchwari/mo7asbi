import React, { Suspense } from 'react';
import { View, ActivityIndicator, I18nManager } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Initialize i18n before anything renders
import './src/i18n';

import { RootNavigator } from './src/presentation/navigation/RootNavigator';
import { theme } from './src/presentation/theme';

// Force RTL for Arabic
I18nManager.forceRTL(true);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="dark" backgroundColor={theme.colors.white} />
          <Suspense fallback={<LoadingFallback />}>
            <RootNavigator />
          </Suspense>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function LoadingFallback() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.white }}>
      <ActivityIndicator size="large" color={theme.colors.primary[600]} />
    </View>
  );
}
