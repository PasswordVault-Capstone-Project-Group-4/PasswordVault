import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BrandMark from '../components/BrandMark';
import { useAppTheme } from '../context/ThemeContext';
import type { WelcomeScreenProps } from '../navigation/AppNavigator';

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <BrandMark size={84} />
        <Text style={[styles.title, { color: colors.text }]}>Password Vault</Text>
        <Text style={[styles.description, { color: colors.secondaryText }]}>
          Keep your login details{'\n'}organized and accessible{'\n'}offline.
        </Text>
        <Text style={[styles.notice, { color: colors.secondaryText }]}>
          For learning only. Passwords are stored on this device without encryption.
        </Text>
      </View>
      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('CreatePin')}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.primary },
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
        <Text style={[styles.privacyNote, { color: colors.secondaryText }]}>
          Your data stays on this device.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 28, paddingVertical: 34 },
  content: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginTop: 24 },
  description: { fontSize: 17, lineHeight: 26, marginTop: 14, textAlign: 'center' },
  notice: { fontSize: 12, lineHeight: 18, marginTop: 20, maxWidth: 280, textAlign: 'center' },
  footer: { alignItems: 'center', width: '100%' },
  button: { alignItems: 'center', borderRadius: 15, minHeight: 54, justifyContent: 'center', width: '100%' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  privacyNote: { fontSize: 13, marginTop: 15 },
  pressed: { opacity: 0.82 },
});
