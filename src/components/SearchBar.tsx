import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../utils/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
}

export default function SearchBar({ value, onChangeText }: SearchBarProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⌕</Text>
      <TextInput
        accessibilityLabel="Search passwords"
        autoCapitalize="none"
        onChangeText={onChangeText}
        placeholder="Search passwords..."
        placeholderTextColor={colors.secondaryText}
        returnKeyType="search"
        style={styles.input}
        value={value}
      />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 20,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  icon: { color: colors.secondaryText, fontSize: 23, marginRight: 10 },
  input: { color: colors.text, flex: 1, fontSize: 15, letterSpacing: 0, paddingVertical: 10 },
  });
}
