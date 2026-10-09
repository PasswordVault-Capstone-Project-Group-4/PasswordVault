import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../context/ThemeContext';
import {
  deleteAllPasswords,
  getPin,
  isPinEnabled,
  setPin,
  setPinEnabled,
  setSetupCompleted,
} from '../storage/vaultStorage';
import type { ThemeColors, ThemeMode } from '../utils/theme';
import { validatePin, validatePinMatch } from '../utils/validation';
import type { SettingsScreenProps } from '../navigation/AppNavigator';

type PinModalMode = 'startup' | 'view' | 'verify-enable' | null;

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { colors, mode, setMode } = useAppTheme();
  const styles = createStyles(colors);
  const [pinEnabled, setPinEnabledState] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [pinSettingError, setPinSettingError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState<PinModalMode>(null);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isSavingPin, setIsSavingPin] = useState(false);
  const [themeError, setThemeError] = useState('');
  const [isSavingTheme, setIsSavingTheme] = useState(false);

  const loadSetting = useCallback(async () => {
    setIsLoading(true);
    try {
      const [enabled, pin] = await Promise.all([isPinEnabled(), getPin()]);
      setPinEnabledState(enabled);
      setHasPin(pin !== null);
      setPinSettingError('');
    } catch {
      setPinSettingError('Could not load the PIN lock setting.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadSetting();
    }, [loadSetting]),
  );

  function openPinModal(mode: Exclude<PinModalMode, null>) {
    setNewPin('');
    setConfirmPin('');
    setPinError('');
    setModalMode(mode);
  }

  async function handleThemeChange(nextMode: ThemeMode) {
    setIsSavingTheme(true);
    try {
      await setMode(nextMode);
      setThemeError('');
    } catch {
      setThemeError('Could not save the appearance setting. Please try again.');
    } finally {
      setIsSavingTheme(false);
    }
  }

  async function verifyPinAndEnableLock() {
    if (newPin.length !== 4) {
      setPinError('Enter your current 4-digit PIN.');
      return;
    }

    setIsSavingPin(true);
    try {
      const savedPin = await getPin();
      if (newPin !== savedPin) {
        setPinError('That PIN is not correct. Try again.');
        setNewPin('');
        return;
      }
      await setPinEnabled(true);
      setPinEnabledState(true);
      setModalMode(null);
      setPinSettingError('');
    } catch {
      setPinError('Could not verify your PIN or enable the lock. Please try again.');
    } finally {
      setIsSavingPin(false);
    }
  }

  function handleTogglePin(enabled: boolean) {
    if (enabled) {
      if (!hasPin) {
        openPinModal('startup');
        return;
      }

      openPinModal('verify-enable');
      return;
    }

    Alert.alert('Disable PIN Lock?', 'The vault will open without a PIN the next time you launch it.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disable',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await setPinEnabled(false);
              setPinEnabledState(false);
              setPinSettingError('');
            } catch {
              setPinSettingError('Could not change the PIN lock setting. Please try again.');
            }
          })();
        },
      },
    ]);
  }

  async function savePin() {
    const formatError = validatePin(newPin);
    const matchError = validatePinMatch(newPin, confirmPin);
    if (formatError || matchError) {
      setPinError(formatError ?? matchError ?? 'Please check the PIN and try again.');
      return;
    }

    setIsSavingPin(true);
    try {
      await setPin(newPin);
      await setSetupCompleted(true);
      setHasPin(true);
      if (modalMode === 'startup') {
        await setPinEnabled(true);
        setPinEnabledState(true);
      }
      setModalMode(null);
      setPinError('');
    } catch {
      setPinError('Could not save the PIN. Please try again.');
    } finally {
      setIsSavingPin(false);
    }
  }

  function confirmDeleteAll() {
    Alert.alert('Delete All Passwords?', 'This will permanently remove every saved login from this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteAllPasswords();
              Alert.alert('Passwords deleted', 'All saved logins have been removed.');
            } catch {
              Alert.alert('Could not delete passwords', 'Please try again.');
            }
          })();
        },
      },
    ]);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your vault preferences.</Text>

        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.card}>
          <Text style={styles.rowTitle}>Color theme</Text>
          <Text style={styles.rowSubtitle}>Choose your preferred appearance.</Text>
          <View accessibilityRole="radiogroup" style={styles.themeOptions}>
            {(['light', 'dark', 'system'] as const).map((themeMode) => (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: mode === themeMode, disabled: isSavingTheme }}
                disabled={isSavingTheme}
                key={themeMode}
                onPress={() => void handleThemeChange(themeMode)}
                style={[
                  styles.themeOption,
                  mode === themeMode ? { backgroundColor: colors.primaryLight } : null,
                ]}
              >
                <Text
                  style={[
                    styles.themeOptionText,
                    { color: mode === themeMode ? colors.primary : colors.secondaryText },
                  ]}
                >
                  {themeMode === 'system' ? 'System' : themeMode === 'light' ? 'Light' : 'Dark'}
                </Text>
              </Pressable>
            ))}
          </View>
          {themeError ? <Text accessibilityRole="alert" style={styles.error}>{themeError}</Text> : null}
        </View>

        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingText}>
              <Text style={styles.rowTitle}>PIN Lock</Text>
              <Text style={styles.rowSubtitle}>Require a PIN when opening the app</Text>
            </View>
            <Switch
              accessibilityLabel="PIN Lock"
              disabled={isLoading}
              onValueChange={handleTogglePin}
              trackColor={{ false: colors.border, true: colors.primary }}
              value={pinEnabled}
            />
          </View>
          {pinSettingError ? <Text accessibilityRole="alert" style={styles.error}>{pinSettingError}</Text> : null}
          <View style={styles.separator} />
          <View style={styles.pinSettingRow}>
            <View style={styles.settingText}>
              <Text style={styles.rowTitle}>Password reveal PIN</Text>
              <Text style={styles.rowSubtitle}>
                Required each time you reveal a password on Home
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => hasPin ? navigation.navigate('ChangePin') : openPinModal('view')}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>{hasPin ? 'Change' : 'Set PIN'}</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Vault</Text>
        <View style={styles.card}>
          <Text style={styles.rowTitle}>Delete All Passwords</Text>
          <Text style={styles.rowSubtitle}>Remove all saved login details from this device.</Text>
          <Pressable accessibilityRole="button" onPress={confirmDeleteAll} style={styles.dangerButton}>
            <Text style={styles.dangerButtonText}>Delete All Passwords</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>⚠️ Educational Project</Text>
          <Text style={styles.aboutText}>
            This password vault stores passwords locally using AsyncStorage without encryption.{'\n\n'}
            It is intended for learning and personal experimentation only.{'\n'}
          </Text>
        </View>
        <Text style={styles.footer}>Your data stays on this device and is not encrypted.</Text>
      </ScrollView>

      <Modal animationType="slide" onRequestClose={() => setModalMode(null)} transparent visible={modalMode !== null}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {modalMode === 'startup'
                ? 'Set PIN Lock'
                : modalMode === 'verify-enable'
                  ? 'Verify your PIN'
                  : 'Set Password Reveal PIN'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {modalMode === 'startup'
                ? 'Choose a 4-digit PIN to unlock the vault when the app opens.'
                : modalMode === 'verify-enable'
                  ? 'Enter your current PIN to enable the app-start lock.'
                  : 'Choose a 4-digit PIN. You will need it each time you reveal a saved password.'}
            </Text>
            <TextInput
              accessibilityLabel={modalMode === 'verify-enable' ? 'Current 4 digit PIN' : 'New 4 digit PIN'}
              autoComplete="off"
              keyboardType="number-pad"
              maxLength={4}
              onChangeText={(value) => {
                setNewPin(value.replace(/\D/g, ''));
                setPinError('');
              }}
              placeholder={modalMode === 'verify-enable' ? 'Current 4-digit PIN' : 'New 4-digit PIN'}
              placeholderTextColor={colors.secondaryText}
              secureTextEntry
              style={styles.modalInput}
              value={newPin}
            />
            {modalMode !== 'verify-enable' ? (
              <TextInput
                accessibilityLabel="Confirm PIN"
                autoComplete="off"
                keyboardType="number-pad"
                maxLength={4}
                onChangeText={(value) => {
                  setConfirmPin(value.replace(/\D/g, ''));
                  setPinError('');
                }}
                placeholder="Confirm PIN"
                placeholderTextColor={colors.secondaryText}
                secureTextEntry
                style={styles.modalInput}
                value={confirmPin}
              />
            ) : null}
            {pinError ? <Text accessibilityRole="alert" style={styles.error}>{pinError}</Text> : null}
            <Pressable
              accessibilityRole="button"
              disabled={isSavingPin}
              onPress={() => void (modalMode === 'verify-enable' ? verifyPinAndEnableLock() : savePin())}
              style={[styles.primaryButton, isSavingPin ? styles.disabledButton : null]}
            >
              <Text style={styles.primaryButtonText}>
                {isSavingPin ? 'Saving…' : modalMode === 'verify-enable' ? 'Enable PIN Lock' : 'Save PIN'}
              </Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => setModalMode(null)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 20, paddingBottom: 144 },
  title: { color: colors.text, fontSize: 29, fontWeight: '800', marginTop: 8 },
  subtitle: { color: colors.secondaryText, fontSize: 14, marginTop: 5 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 10, marginTop: 26 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, padding: 16 },
  settingRow: { alignItems: 'center', flexDirection: 'row' },
  themeOptions: { backgroundColor: colors.background, borderRadius: 12, flexDirection: 'row', marginTop: 14, padding: 4 },
  themeOption: { alignItems: 'center', borderRadius: 9, flex: 1, justifyContent: 'center', minHeight: 40, paddingHorizontal: 4 },
  themeOptionText: { fontSize: 13, fontWeight: '700' },
  pinSettingRow: { alignItems: 'center', flexDirection: 'row', paddingTop: 14 },
  separator: { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth, marginTop: 16 },
  settingText: { flex: 1, paddingRight: 12 },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  rowSubtitle: { color: colors.secondaryText, fontSize: 13, lineHeight: 19, marginTop: 5 },
  secondaryButton: { alignSelf: 'flex-start', backgroundColor: colors.primaryLight, borderRadius: 11, marginTop: 16, paddingHorizontal: 15, paddingVertical: 11 },
  secondaryButtonText: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  dangerButton: { alignItems: 'center', backgroundColor: colors.background, borderRadius: 12, marginTop: 16, padding: 13 },
  dangerButtonText: { color: colors.danger, fontSize: 14, fontWeight: '700' },
  aboutCard: { backgroundColor: colors.warningSurface, borderColor: colors.warningBorder, borderRadius: 16, borderWidth: 1, padding: 16 },
  aboutTitle: { color: colors.warningText, fontSize: 15, fontWeight: '700' },
  aboutText: { color: colors.warningSecondaryText, fontSize: 13, lineHeight: 21, marginTop: 10 },
  footer: { color: colors.secondaryText, fontSize: 12, lineHeight: 18, marginTop: 20, textAlign: 'center' },
  error: { color: colors.danger, fontSize: 13, marginTop: 10 },
  modalBackdrop: { backgroundColor: 'rgba(0, 0, 0, 0.55)', flex: 1, justifyContent: 'center', padding: 22 },
  modalCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 22 },
  modalTitle: { color: colors.text, fontSize: 21, fontWeight: '800' },
  modalSubtitle: { color: colors.secondaryText, fontSize: 14, lineHeight: 20, marginBottom: 18, marginTop: 6 },
  modalInput: { backgroundColor: colors.background, borderColor: colors.border, borderRadius: 12, borderWidth: 1, color: colors.text, fontSize: 16, marginBottom: 12, minHeight: 50, paddingHorizontal: 14 },
  primaryButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 12, marginTop: 8, padding: 14 },
  disabledButton: { opacity: 0.6 },
  primaryButtonText: { color: colors.surface, fontSize: 15, fontWeight: '700' },
  cancelButton: { alignItems: 'center', padding: 13 },
  cancelButtonText: { color: colors.secondaryText, fontSize: 14, fontWeight: '600' },
  });
}
