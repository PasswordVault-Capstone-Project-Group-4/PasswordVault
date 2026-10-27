import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PasswordInput from '../components/PasswordInput';
import { useAppTheme } from '../context/ThemeContext';
import { savePassword } from '../storage/vaultStorage';
import { validatePasswordEntry, type PasswordEntryErrors } from '../utils/validation';
import type { ThemeColors } from '../utils/theme';
import type { AddPasswordScreenProps } from '../navigation/AppNavigator';

export default function AddPasswordScreen({ navigation }: AddPasswordScreenProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [appName, setAppName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<PasswordEntryErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    const validation = validatePasswordEntry(appName, username, password);
    setErrors(validation.errors);
    if (!validation.isValid) {
      return;
    }

    setIsSaving(true);
    try {
      await savePassword({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        appName: appName.trim(),
        username: username.trim(),
        password,
      });
      setAppName('');
      setUsername('');
      setPassword('');
      setErrors({});
      navigation.navigate('Home');
    } catch {
      Alert.alert('Could not save password', 'Your entry was not saved. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Add Password</Text>
          <Text style={styles.subtitle}>Save a login for your own offline reminder.</Text>

          <Text style={styles.label}>App Name</Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={(value) => {
              setAppName(value);
              setErrors((current) => ({ ...current, appName: undefined }));
            }}
            placeholder="Instagram"
            placeholderTextColor={colors.secondaryText}
            style={[styles.input, errors.appName ? styles.inputError : null]}
            value={appName}
          />
          {errors.appName ? <Text style={styles.error}>{errors.appName}</Text> : null}

          <Text style={styles.label}>Username / Email</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={(value) => {
              setUsername(value);
              setErrors((current) => ({ ...current, username: undefined }));
            }}
            placeholder="example@gmail.com"
            placeholderTextColor={colors.secondaryText}
            style={[styles.input, errors.username ? styles.inputError : null]}
            value={username}
          />
          {errors.username ? <Text style={styles.error}>{errors.username}</Text> : null}

          <PasswordInput
            error={errors.password}
            label="Password"
            onChangeText={(value) => {
              setPassword(value);
              setErrors((current) => ({ ...current, password: undefined }));
            }}
            placeholder="Enter Your Respective Passwords"
            value={password}
          />

          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            onPress={() => void handleSave()}
            style={[styles.button, isSaving ? styles.disabledButton : null]}
          >
            <Text style={styles.buttonText}>{isSaving ? 'Saving…' : 'Save Password'}</Text>
          </Pressable>
          <Text style={styles.disclaimer}>Stored on this device using AsyncStorage without encryption.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  flex: { flex: 1 },
  content: { padding: 22, paddingBottom: 144 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: 8 },
  subtitle: { color: colors.secondaryText, fontSize: 14, lineHeight: 21, marginBottom: 26, marginTop: 6 },
  label: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    marginBottom: 7,
    minHeight: 54,
    paddingHorizontal: 14,
  },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 13, marginBottom: 13 },
  button: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 14, marginTop: 8, padding: 16 },
  disabledButton: { opacity: 0.6 },
  buttonText: { color: colors.surface, fontSize: 16, fontWeight: '700' },
  disclaimer: { color: colors.secondaryText, fontSize: 12, lineHeight: 18, marginTop: 16, textAlign: 'center' },
  });
}
