import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { useAppTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../utils/theme';

interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export default function PasswordInput({
  label,
  value,
  onChangeText,
  error,
  placeholder = 'Enter password',
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, error ? styles.inputError : null]}>
        <TextInput
          accessibilityLabel={label}
          autoCapitalize="none"
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.secondaryText}
          secureTextEntry={!isVisible}
          style={styles.input}
          value={value}
        />
        <Pressable
          accessibilityLabel={isVisible ? 'Hide password' : 'Show password'}
          accessibilityRole="button"
          onPress={() => setIsVisible(!isVisible)}
          style={styles.toggle}
        >
          <SymbolView
            name={
              isVisible
                ? { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' }
                : { ios: 'eye', android: 'visibility', web: 'visibility' }
            }
            size={21}
            tintColor={colors.primary}
            style={styles.eye}
          />
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  group: { marginBottom: 18 },
  label: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 54,
    paddingLeft: 14,
    paddingRight: 12,
  },
  inputError: { borderColor: colors.danger },
  input: { color: colors.text, flex: 1, fontSize: 16, paddingVertical: 13 },
  toggle: { paddingHorizontal: 6, paddingVertical: 8 },
  eye: { height: 22, width: 22 },
  error: { color: colors.danger, fontSize: 13, marginTop: 6 },
  });
}
