import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../context/ThemeContext';

interface PinKeypadProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function PinKeypad({ value, onChange, disabled = false }: PinKeypadProps) {
  const { colors } = useAppTheme();

  function pressDigit(digit: string) {
    if (!disabled && value.length < 4) {
      onChange(`${value}${digit}`);
    }
  }

  function removeDigit() {
    if (!disabled) {
      onChange(value.slice(0, -1));
    }
  }

  function renderDigit(digit: string) {
    return (
      <Pressable
        accessibilityLabel={`Digit ${digit}`}
        accessibilityRole="button"
        disabled={disabled}
        key={digit}
        onPress={() => pressDigit(digit)}
        style={({ pressed }) => [
          styles.key,
          { backgroundColor: colors.surface },
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        <Text style={[styles.digit, { color: colors.text }]}>{digit}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <View accessibilityLabel={`${value.length} of 4 PIN digits entered`} style={styles.dots}>
        {Array.from({ length: 4 }, (_, index) => (
          <View
            accessibilityLabel={index < value.length ? 'Digit entered' : 'Empty digit'}
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index < value.length ? colors.primary : 'transparent',
                borderColor: index < value.length ? colors.primary : colors.border,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.grid}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(renderDigit)}
        <View key="empty-left" style={styles.keyPlaceholder} />
        {renderDigit('0')}
        <Pressable
          accessibilityLabel="Delete last digit"
          accessibilityRole="button"
          disabled={disabled || value.length === 0}
          onPress={removeDigit}
          style={({ pressed }) => [styles.key, pressed && styles.pressed]}
        >
          <SymbolView
            name={{ ios: 'delete.left', android: 'backspace', web: 'backspace' }}
            size={23}
            tintColor={value.length > 0 ? colors.text : colors.secondaryText}
            style={styles.backspace}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: '100%' },
  dots: { alignItems: 'center', flexDirection: 'row', gap: 16, justifyContent: 'center', marginBottom: 26, marginTop: 28 },
  dot: { borderRadius: 8, borderWidth: 1.5, height: 16, width: 16 },
  grid: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 300 },
  key: { alignItems: 'center', borderRadius: 32, height: 64, justifyContent: 'center', margin: 6, width: 76 },
  keyPlaceholder: { height: 64, margin: 6, width: 76 },
  digit: { fontSize: 25, fontWeight: '500' },
  backspace: { height: 25, width: 25 },
  pressed: { opacity: 0.65, transform: [{ scale: 0.96 }] },
  disabled: { opacity: 0.5 },
});
