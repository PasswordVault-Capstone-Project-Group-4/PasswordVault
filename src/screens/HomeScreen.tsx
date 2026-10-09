import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import BrandMark from '../components/BrandMark';
import PasswordCard from '../components/PasswordCard';
import SearchBar from '../components/SearchBar';
import { useAppTheme } from '../context/ThemeContext';
import type { PasswordEntry } from '../types/PasswordEntry';
import { deletePassword, getPasswords } from '../storage/vaultStorage';
import type { ThemeColors } from '../utils/theme';
import type { HomeScreenProps } from '../navigation/AppNavigator';

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadPasswords = useCallback(async () => {
    setIsLoading(true);
    try {
      setPasswords(await getPasswords());
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadPasswords();
    }, [loadPasswords]),
  );

  const filteredPasswords = useMemo(() => {
    const query = searchText.trim().toLocaleLowerCase();
    if (!query) {
      return passwords;
    }
    return passwords.filter(
      (entry) =>
        entry.appName.toLocaleLowerCase().includes(query) ||
        entry.username.toLocaleLowerCase().includes(query),
    );
  }, [passwords, searchText]);

  async function handleDelete(id: string) {
    try {
      await deletePassword(id);
      setPasswords((current) => current.filter((entry) => entry.id !== id));
    } catch {
      Alert.alert('Could not delete password', 'Please try again.');
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.brandRow}>
            {/* <BrandMark size={42} /> */}
            <View style={styles.brandCopy}>
              <Text style={styles.title}>Password Vault</Text>
              <Text style={styles.subtitle}>Your offline password reminder</Text>
            </View>
          </View>
          <View style={styles.accountSummary}>
            <View style={styles.accountIcon}>
              <SymbolView
                name={{ ios: 'person.2.fill', android: 'group', web: 'group' }}
                size={22}
                tintColor={colors.primary}
                style={styles.accountSymbol}
              />
            </View>
            <View style={styles.accountCopy}>
              <Text style={styles.accountNumber}>{passwords.length}</Text>
              <Text style={styles.accountLabel}>
                saved {passwords.length === 1 ? 'account' : 'accounts'}
              </Text>
            </View>
          </View>
        </View>

        <SearchBar onChangeText={setSearchText} value={searchText} />

        {isLoading ? (
          <ActivityIndicator color={colors.primary} size="large" style={styles.loader} />
        ) : loadError ? (
          <View style={styles.messageBox}>
            <Text style={styles.message}>Could not load your saved passwords.</Text>
            <Text accessibilityRole="button" onPress={() => void loadPasswords()} style={styles.retry}>
              Try again
            </Text>
          </View>
        ) : filteredPasswords.length === 0 ? (
          <EmptyState
            onAddPassword={() => navigation.navigate('Add')}
            searchActive={passwords.length > 0 || Boolean(searchText.trim())}
          />
        ) : (
          filteredPasswords.map((entry) => (
            <PasswordCard
              entry={entry}
              key={entry.id}
              onDelete={(id) => void handleDelete(id)}
              onEdit={(password) => navigation.navigate('EditPassword', { passwordId: password.id })}
              onSetPin={() => navigation.navigate('Settings')}
            />
          ))
        )}
        <Text style={styles.disclaimer}>For learning only · Passwords are stored without encryption</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 20, paddingBottom: 144 },
  header: { marginBottom: 22, marginTop: 8 },
  brandRow: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  brandCopy: { flex: 1 },
  title: { color: colors.text, fontSize: 27, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: colors.secondaryText, fontSize: 14, marginTop: 5},
  accountSummary: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 18,
    flexDirection: 'row',
    marginTop: 14,
    minHeight: 68,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  accountIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 14,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  accountSymbol: { height: 30, width: 30 },
  accountCopy: { flex: 1, marginLeft: 12 },
  accountNumber: { color: colors.text, fontSize: 22, fontWeight: '800', lineHeight: 26 },
  accountLabel: { color: colors.secondaryText, fontSize: 13, fontWeight: '600', marginTop: 1 },
  loader: { marginTop: 38 },
  messageBox: { alignItems: 'center', paddingVertical: 40 },
  message: { color: colors.text, fontSize: 15, textAlign: 'center' },
  retry: { color: colors.primary, fontSize: 15, fontWeight: '700', marginTop: 14 },
  disclaimer: { color: colors.secondaryText, fontSize: 11, marginTop: 18, textAlign: 'center' },
  });
}
