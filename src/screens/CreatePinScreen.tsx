import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BrandMark from '../components/BrandMark';
import PinKeypad from '../components/PinKeypad';
import { useAppTheme } from '../context/ThemeContext';
import type { CreatePinScreenProps } from '../navigation/AppNavigator';

export default function CreatePinScreen({ navigation }: CreatePinScreenProps) {
  const { colors } = useAppTheme();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  function updatePin(value: string) {
    setPin(value);
    setError('');
    if (value.length === 4) {
      navigation.navigate('ConfirmPin', { pin: value });
    }
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
        </Pressable>
        <BrandMark size={64} />
        <Text style={[styles.title, { color: colors.text }]}>Create your PIN</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          Use a 4-digit PIN to{'\n'}access your vault.
        </Text>
        <PinKeypad value={pin} onChange={updatePin} />
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { alignItems: 'center', flex: 1, paddingHorizontal: 24, paddingTop: 12 },
  backButton: { alignSelf: 'flex-start', minHeight: 40, justifyContent: 'center', paddingHorizontal: 4 },
  backText: { fontSize: 15, fontWeight: '600' },
  title: { fontSize: 25, fontWeight: '800', marginTop: 20 },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 8, textAlign: 'center' },
  error: { fontSize: 13, marginTop: 8, textAlign: 'center' },
});
