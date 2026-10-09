import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SymbolView } from 'expo-symbols';

import type { PasswordEntry } from '../types/PasswordEntry';
import { getPin } from '../storage/vaultStorage';
import { useAppTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../utils/theme';
import { validateCorrectPin, validatePin } from '../utils/validation';

interface PasswordCardProps {
  entry: PasswordEntry;
  onEdit: (entry: PasswordEntry) => void;
  onDelete: (id: string) => void;
  onSetPin: () => void;
}

export default function PasswordCard({ entry, onEdit, onDelete, onSetPin }: PasswordCardProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [isVisible, setIsVisible] = useState(false);
  const [isPinPromptVisible, setIsPinPromptVisible] = useState(false);
  const [savedPin, setSavedPin] = useState<string | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  async function requestPasswordReveal() {
    if (isVisible) {
      setIsVisible(false);
      return;
    }

    setIsVerifyingPin(true);
    try {
      const pin = await getPin();
      if (!pin) {
        Alert.alert(
          'Set up a PIN first',
          'A PIN is required every time you reveal a saved password. Set one in Settings to continue.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: onSetPin },
          ],
        );
        return;
      }

      setSavedPin(pin);
      setEnteredPin('');
      setPinError('');
      setIsPinPromptVisible(true);
    } catch {
      Alert.alert('Could not check PIN', 'Please try again.');
    } finally {
      setIsVerifyingPin(false);
    }
  }

  function closePinPrompt() {
    setIsPinPromptVisible(false);
    setEnteredPin('');
    setPinError('');
    setSavedPin(null);
  }

  function verifyPin(value: string) {
    const formatError = validatePin(value);
    if (formatError) {
      setPinError(formatError);
      return;
    }

    if (!savedPin) {
      setPinError('Could not verify your PIN. Close this prompt and try again.');
      return;
    }

    const verificationError = validateCorrectPin(value, savedPin);
    if (verificationError) {
      setPinError(verificationError);
      setEnteredPin('');
      return;
    }

    setIsVisible(true);
    closePinPrompt();
  }

  function confirmDelete() {
    Alert.alert('Delete Password?', 'Are you sure you want to delete this login?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(entry.id) },
    ]);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.appName}>{entry.appName}</Text>
      <Text numberOfLines={1} style={styles.username}>{entry.username}</Text>
      <Text style={styles.passwordLabel}>Password</Text>
      <View style={styles.passwordRow}>
        <TextInput
          accessibilityLabel={isVisible ? 'Password, visible' : 'Password, hidden'}
          editable={false}
          secureTextEntry={!isVisible}
          style={styles.password}
          value={entry.password}
        />
        <Pressable
          accessibilityLabel={isVisible ? 'Hide password' : 'Verify PIN to show password'}
          accessibilityRole="button"
          disabled={isVerifyingPin}
          onPress={() => void requestPasswordReveal()}
          style={styles.eyeButton}
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
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" onPress={() => onEdit(entry)} style={styles.actionButton}>
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={confirmDelete} style={[styles.actionButton, styles.deleteButton]}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={closePinPrompt}
        transparent
        visible={isPinPromptVisible}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Verify your PIN</Text>
            <Text style={styles.modalSubtitle}>Enter your 4-digit PIN to reveal this password.</Text>
            <TextInput
              accessibilityLabel="Enter PIN to reveal password"
              autoComplete="off"
              autoFocus
              keyboardType="number-pad"
              maxLength={4}
              onChangeText={(value) => {
                const digits = value.replace(/\D/g, '').slice(0, 4);
                setEnteredPin(digits);
                setPinError('');
                if (digits.length === 4) {
                  verifyPin(digits);
                }
              }}
              placeholder="4-digit PIN"
              placeholderTextColor={colors.secondaryText}
              secureTextEntry
              style={styles.pinInput}
              value={enteredPin}
            />
            {pinError ? <Text accessibilityRole="alert" style={styles.pinError}>{pinError}</Text> : null}
            <Pressable accessibilityRole="button" onPress={closePinPrompt} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    padding: 18,
  },
  appName: { color: colors.text, fontSize: 17, fontWeight: '700' },
  username: { color: colors.secondaryText, fontSize: 14, marginTop: 5 },
  passwordLabel: { color: colors.secondaryText, fontSize: 12, fontWeight: '600', marginTop: 18 },
  passwordRow: { alignItems: 'center', flexDirection: 'row', marginTop: 2 },
  password: { color: colors.text, flex: 1, fontSize: 16, paddingVertical: 7 },
  eyeButton: { paddingHorizontal: 8, paddingVertical: 8 },
  eye: { height: 22, width: 22 },
  actions: { borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', marginTop: 10, paddingTop: 12 },
  actionButton: { alignItems: 'center', flex: 1, paddingVertical: 5 },
  deleteButton: { borderLeftColor: colors.border, borderLeftWidth: 1 },
  editText: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  deleteText: { color: colors.danger, fontSize: 14, fontWeight: '700' },
  modalBackdrop: { backgroundColor: 'rgba(0, 0, 0, 0.55)', flex: 1, justifyContent: 'center', padding: 22 },
  modalCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 22 },
  modalTitle: { color: colors.text, fontSize: 21, fontWeight: '800' },
  modalSubtitle: { color: colors.secondaryText, fontSize: 14, lineHeight: 20, marginBottom: 18, marginTop: 6 },
  pinInput: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.text,
    fontSize: 18,
    minHeight: 52,
    paddingHorizontal: 14,
    textAlign: 'center',
  },
  pinError: { color: colors.danger, fontSize: 13, marginTop: 10 },
  cancelButton: { alignItems: 'center', padding: 13 },
  cancelButtonText: { color: colors.secondaryText, fontSize: 14, fontWeight: '600' },
  });
}
