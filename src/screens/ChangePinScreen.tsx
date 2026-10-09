import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BrandMark from '../components/BrandMark';
import PinKeypad from '../components/PinKeypad';
import { useAppTheme } from '../context/ThemeContext';
import { getPin, setPin as savePin } from '../storage/vaultStorage';
import type { ChangePinScreenProps } from '../navigation/AppNavigator';

type PinStep = 'current' | 'new' | 'confirm';

const STEP_TITLE: Record<PinStep, string> = {
  current: 'Enter current PIN',
  new: 'Create a new PIN',
  confirm: 'Confirm new PIN',
};

export default function ChangePinScreen({ navigation }: ChangePinScreenProps) {
  const { colors } = useAppTheme();
  const [step, setStep] = useState<PinStep>('current');
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  async function handlePinChange(value: string) {
    setPin(value);
    setError('');
    if (value.length !== 4 || isChecking) {
      return;
    }

    setIsChecking(true);
    try {
      if (step === 'current') {
        const savedPin = await getPin();
        if (savedPin === null || value !== savedPin) {
          setError('That PIN is not correct. Try again.');
          setPin('');
          return;
        }
        setStep('new');
        setPin('');
        return;
      }

      if (step === 'new') {
        const savedPin = await getPin();
        if (value === savedPin) {
          setError('Choose a PIN different from your current PIN.');
          setPin('');
          return;
        }
        setNewPin(value);
        setStep('confirm');
        setPin('');
        return;
      }

      if (value !== newPin) {
        setError("PINs don't match. Try again.");
        setPin('');
        return;
      }

      await savePin(value);
      Alert.alert('PIN changed', 'Your PIN has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      setError('Could not verify or save your PIN. Please try again.');
      setPin('');
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>Cancel</Text>
        </Pressable>
        <BrandMark size={64} />
        <Text style={[styles.title, { color: colors.text }]}>{STEP_TITLE[step]}</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          {step === 'current' ? 'Verify your identity to continue.' : 'Enter 4 digits on the keypad.'}
        </Text>
        {isChecking ? (
          <ActivityIndicator color={colors.primary} size="large" style={styles.loading} />
        ) : (
          <PinKeypad value={pin} onChange={(value) => void handlePinChange(value)} />
        )}
        {error ? <Text accessibilityRole="alert" style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { alignItems: 'center', flex: 1, paddingHorizontal: 24, paddingTop: 12 },
  backButton: { alignSelf: 'flex-start', minHeight: 40, justifyContent: 'center', paddingHorizontal: 4 },
  backText: { fontSize: 15, fontWeight: '600' },
  title: { fontSize: 23, fontWeight: '800', marginTop: 20, textAlign: 'center' },
  subtitle: { fontSize: 14, marginTop: 8 },
  loading: { marginTop: 40 },
  error: { fontSize: 14, marginTop: 10, textAlign: 'center' },
});
