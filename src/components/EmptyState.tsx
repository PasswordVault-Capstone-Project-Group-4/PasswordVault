import { Pressable, StyleSheet, Text, View } from 'react-native';

import BrandMark from './BrandMark';
import { useAppTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../utils/theme';

interface EmptyStateProps {
  onAddPassword: () => void;
  searchActive?: boolean;
}

export default function EmptyState({ onAddPassword, searchActive = false }: EmptyStateProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  if (searchActive) {
    return (
      <View style={styles.searchEmpty}>
        <Text style={styles.title}>No passwords found</Text>
        <Text style={styles.subtitle}>Try another app name or username.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BrandMark size={64} />
      <Text style={styles.title}>No passwords saved yet</Text>
      <Text style={styles.subtitle}>
        Add your first login to start building{'\n'}your offline password reminder.
      </Text>
      <Pressable accessibilityRole="button" onPress={onAddPassword} style={styles.button}>
        <Text style={styles.buttonText}>＋ Add Password</Text>
      </Pressable>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 42 },
  searchEmpty: { alignItems: 'center', paddingVertical: 48 },
  title: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 18, textAlign: 'center' },
  subtitle: { color: colors.secondaryText, fontSize: 14, lineHeight: 22, marginTop: 8, textAlign: 'center' },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    marginTop: 22,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  buttonText: { color: colors.surface, fontSize: 15, fontWeight: '700' },
  });
}
