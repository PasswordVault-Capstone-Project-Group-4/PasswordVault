import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BrandMark from '../components/BrandMark';
import PinKeypad from '../components/PinKeypad';
import { useAppTheme } from '../context/ThemeContext';
import { completeInitialSetup } from '../storage/vaultStorage';
import type { ConfirmPinScreenProps } from '../navigation/AppNavigator';

export default function ConfirmPinScreen({ navigation, route }: ConfirmPinScreenProps) {
  const { colors } = useAppTheme();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (completionTimer.current) {
        clearTimeout(completionTimer.current);
      }
    },
    [],
  );

  async function confirmPin(value: string) {
    setPin(value);
    setError('');

    if (value.length !== 4 || isSaving) {
      return;
    }
    if (value !== route.params.pin) {
      setError("PINs don't match. Try again.");
      setPin('');
      return;
    }

    setIsSaving(true);
    try {
      await completeInitialSetup(value);
      setIsComplete(true);
      completionTimer.current = setTimeout(() => {
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      }, 750);
    } catch {
      setError('Could not save your PIN. Please try again.');
      setPin('');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <BrandMark size={64} />
        <Text style={[styles.title, { color: colors.text }]}>
          {isComplete ? 'PIN created successfully' : 'Confirm your PIN'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          {isComplete ? 'Opening your vault…' : 'Enter your PIN again'}
        </Text>
        {isSaving || isComplete ? (
          <ActivityIndicator color={colors.primary} size="large" style={styles.loading} />
        ) : (
          <PinKeypad disabled={isSaving} value={pin} onChange={(value) => void confirmPin(value)} />
        )}
        {error ? <Text accessibilityRole="alert" style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 20, textAlign: 'center' },
  subtitle: { fontSize: 15, marginTop: 8 },
  loading: { marginTop: 38 },
  error: { fontSize: 14, marginTop: 12, textAlign: 'center' },
});
