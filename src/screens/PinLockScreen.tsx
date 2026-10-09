import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BrandMark from '../components/BrandMark';
import PinKeypad from '../components/PinKeypad';
import { useAppTheme } from '../context/ThemeContext';
import { getPin, resetVaultData } from '../storage/vaultStorage';
import type { PinLockScreenProps } from '../navigation/AppNavigator';

export default function PinLockScreen({ navigation }: PinLockScreenProps) {
  const { colors } = useAppTheme();
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    void getPin()
      .then((storedPin) => {
        if (isMounted) {
          setSavedPin(storedPin);
          if (storedPin === null) {
            setError('No PIN is saved. Reset the vault to start over.');
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Could not load your PIN. Please try again.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function handleUnlock(enteredPin: string) {
    if (enteredPin.length !== 4 || isUnlocking) {
      return;
    }
    if (!savedPin) {
      setError('No PIN is saved. Reset the vault to start over.');
      return;
    }

    setIsUnlocking(true);
    if (enteredPin !== savedPin) {
      setError('That PIN is not correct. Try again.');
      setPin('');
      setIsUnlocking(false);
      return;
    }

    setError('');
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    setIsUnlocking(false);
  }

  function confirmVaultReset() {
    Alert.alert(
      'Forgot PIN?',
      'There is no PIN recovery. To continue without your PIN, all saved passwords and PIN settings on this device must be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete all vault data?',
              'This permanently deletes every saved login and resets the app setup. This cannot be undone.',
              [
                { text: 'Keep my data', style: 'cancel' },
                {
                  text: 'Delete Everything',
                  style: 'destructive',
                  onPress: () => void performVaultReset(),
                },
              ],
            );
          },
        },
      ],
    );
  }

  async function performVaultReset() {
    try {
      await resetVaultData();
      navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    } catch {
      Alert.alert('Could not reset the vault', 'Your data was not reset. Please try again.');
    }
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <BrandMark size={78} />
        <Text style={[styles.title, { color: colors.text }]}>Password Vault</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>Enter your PIN</Text>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} size="large" style={styles.loading} />
        ) : (
          <>
            {isUnlocking ? (
              <ActivityIndicator color={colors.primary} size="large" style={styles.loading} />
            ) : (
              <PinKeypad
                disabled={!savedPin}
                onChange={(value) => {
                  setPin(value);
                  setError('');
                  if (value.length === 4) {
                    handleUnlock(value);
                  }
                }}
                value={pin}
              />
            )}
            {error ? <Text accessibilityRole="alert" style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
            <Pressable accessibilityRole="button" onPress={confirmVaultReset} style={styles.forgotButton}>
              <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot PIN?</Text>
            </Pressable>
            <Text style={[styles.disclaimer, { color: colors.secondaryText }]}>
              This PIN is a simple reminder lock, not secure authentication.
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 27, fontWeight: '800', marginTop: 18 },
  subtitle: { fontSize: 15, marginTop: 7 },
  loading: { marginTop: 38 },
  error: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  forgotButton: { marginTop: 18, padding: 8 },
  forgotText: { fontSize: 15, fontWeight: '700' },
  disclaimer: { fontSize: 12, lineHeight: 18, marginTop: 14, textAlign: 'center' },
});
