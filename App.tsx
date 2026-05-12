import React from 'react';
import { I18nManager, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
} from '@expo-google-fonts/tajawal';

// Initialize i18n before anything renders
import './src/i18n';

import { RootNavigator } from './src/presentation/navigation/RootNavigator';
import { theme } from './src/presentation/theme';

// Force RTL for Arabic
I18nManager.forceRTL(true);

// Keep the splash screen visible while fonts load
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App(): React.JSX.Element | null {
  const [fontsLoaded, fontError] = useFonts({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
  });

  const isReady = fontsLoaded || fontError !== null;

  // Hide splash once fonts are ready (or failed — fallback font will be used)
  React.useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady]);

  if (!isReady) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="dark" backgroundColor={theme.colors.white} />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
