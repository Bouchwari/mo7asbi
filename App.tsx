import React from 'react';
import { StyleSheet } from 'react-native';
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

import './src/i18n';

import { RootNavigator } from './src/presentation/navigation/RootNavigator';
import { theme } from './src/presentation/theme';

// RTL is handled entirely via explicit styles (flexDirection: 'row-reverse',
// textAlign: 'right') — no need for I18nManager.forceRTL which triggers
// Activity.recreate() on Android and can cause an infinite restart loop.

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App(): React.JSX.Element | null {
  const [fontsLoaded, fontError] = useFonts({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
  });

  // Safety valve: if useFonts hangs with no error, unblock after 4 s
  const [timedOut, setTimedOut] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const isReady = fontsLoaded || fontError !== null || timedOut;

  React.useEffect(() => {
    if (isReady) SplashScreen.hideAsync().catch(() => {});
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
