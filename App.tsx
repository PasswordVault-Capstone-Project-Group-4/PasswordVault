import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import AppNavigator from './src/navigation/AppNavigator';
import {
  getPin,
  getThemeMode,
  isPinEnabled,
  isSetupCompleted,
  setSetupCompleted,
} from './src/storage/vaultStorage';
import { ThemeProvider } from './src/context/ThemeContext';
import { lightColors, type ThemeMode } from './src/utils/theme';
import type { StartupDestination } from './src/navigation/AppNavigator';

type StartupState = 'loading' | 'ready' | 'error';

SplashScreen.preventAutoHideAsync().catch((error: unknown) => {
  console.error('Could not keep the splash screen visible:', error);
});
SplashScreen.setOptions({ duration: 600, fade: true });

export default function App() {
  const [startupState, setStartupState] = useState<StartupState>('loading');
  const [initialDestination, setInitialDestination] = useState<StartupDestination>('Welcome');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  useEffect(() => {
    void checkStartup();
  }, []);

  useEffect(() => {
    if (startupState === 'loading') {
      return;
    }

    void SplashScreen.hideAsync().catch((error: unknown) => {
      console.error('Could not hide the splash screen:', error);
    });
  }, [startupState]);

  async function checkStartup() {
    setStartupState('loading');
    try {
      const [setupCompleted, pinEnabled, pin, savedThemeMode] = await Promise.all([
        isSetupCompleted(),
        isPinEnabled(),
        getPin(),
        getThemeMode(),
      ]);
      let hasCompletedSetup = setupCompleted;

      
      if (!hasCompletedSetup && pin !== null) {
        await setSetupCompleted(true);
        hasCompletedSetup = true;
      }

      setInitialDestination(
        !hasCompletedSetup || pin === null ? 'Welcome' : pinEnabled ? 'PinLock' : 'MainTabs',
      );
      setThemeMode(savedThemeMode);
      setStartupState('ready');
    } catch {
      setStartupState('error');
    }
  }

  return (
    <SafeAreaProvider>
      {startupState === 'ready' ? (
        <ThemeProvider initialMode={themeMode}>
          <AppNavigator initialDestination={initialDestination} />
        </ThemeProvider>
      ) : (
        <View style={styles.container}>
          {startupState === 'loading' ? (
            <ActivityIndicator color={lightColors.primary} size="large" />
          ) : (
            <>
              <Text style={styles.message}>Could not load the vault settings.</Text>
              <Text accessibilityRole="button" onPress={() => void checkStartup()} style={styles.retry}>
                Try again
              </Text>
            </>
          )}
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightColors.background,
    padding: 24,
  },
  message: {
    color: lightColors.text,
    fontSize: 16,
    textAlign: 'center',
  },
  retry: {
    marginTop: 16,
    color: lightColors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});
