import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PasswordInput from '../components/PasswordInput';
import { useAppTheme } from '../context/ThemeContext';
import { getPasswords, updatePassword } from '../storage/vaultStorage';
import type { PasswordEntry } from '../types/PasswordEntry';
import type { ThemeColors } from '../utils/theme';
import { validatePasswordEntry, type PasswordEntryErrors } from '../utils/validation';
import type { EditPasswordScreenProps } from '../navigation/AppNavigator';

export default function EditPasswordScreen({ navigation, route }: EditPasswordScreenProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [entry, setEntry] = useState<PasswordEntry | null>(null);
  const [appName, setAppName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<PasswordEntryErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadEntry() {
      try {
        const found = (await getPasswords()).find((item) => item.id === route.params.passwordId);
        if (!isMounted) {
          return;
        }
        if (!found) {
          Alert.alert('Password not found', 'This login may have already been deleted.', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
          return;
        }
        setEntry(found);
        setAppName(found.appName);
        setUsername(found.username);
        setPassword(found.password);
        setLoadError(false);
      } catch {
        if (isMounted) {
          setLoadError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    void loadEntry();
    return () => {
      isMounted = false;
    };
  }, [navigation, route.params.passwordId]);

  async function handleSave() {
    if (!entry) {
      return;
    }
    const validation = validatePasswordEntry(appName, username, password);
    setErrors(validation.errors);
    if (!validation.isValid) {
      return;
    }

    setIsSaving(true);
    try {
      await updatePassword(entry.id, {
        ...entry,
        appName: appName.trim(),
        username: username.trim(),
        password,
      });
      navigation.goBack();
    } catch {
      Alert.alert('Could not save changes', 'Your entry was not updated. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (loadError || !entry) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.loadError}>Could not load this password entry.</Text>
        <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>Go back</Text></Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Edit Password</Text>
          <Text style={styles.subtitle}>Update the details for {entry.appName}.</Text>

          <Text style={styles.label}>App Name</Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={(value) => {
              setAppName(value);
              setErrors((current) => ({ ...current, appName: undefined }));
            }}
            placeholder="App or website"
            placeholderTextColor={colors.secondaryText}
            style={[styles.input, errors.appName ? styles.inputError : null]}
            value={appName}
          />
          {errors.appName ? <Text style={styles.error}>{errors.appName}</Text> : null}

          <Text style={styles.label}>Username / Email</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={(value) => {
              setUsername(value);
              setErrors((current) => ({ ...current, username: undefined }));
            }}
            placeholder="Username or email"
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
            value={password}
          />

          <Pressable accessibilityRole="button" disabled={isSaving} onPress={() => void handleSave()} style={styles.button}>
            <Text style={styles.buttonText}>{isSaving ? 'Saving…' : 'Save Changes'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  flex: { flex: 1 },
  centered: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center', padding: 24 },
  content: { padding: 22, paddingBottom: 36 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: 8 },
  subtitle: { color: colors.secondaryText, fontSize: 14, marginBottom: 26, marginTop: 6 },
  label: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 14, borderWidth: 1,
    color: colors.text, fontSize: 16, marginBottom: 7, minHeight: 54, paddingHorizontal: 14,
  },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 13, marginBottom: 13 },
  button: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 14, marginTop: 8, padding: 16 },
  buttonText: { color: colors.surface, fontSize: 16, fontWeight: '700' },
  loadError: { color: colors.text, fontSize: 15, textAlign: 'center' },
  back: { color: colors.primary, fontSize: 15, fontWeight: '700', marginTop: 16 },
  });
}
