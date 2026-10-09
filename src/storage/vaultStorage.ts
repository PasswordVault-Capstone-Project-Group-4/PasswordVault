import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PasswordEntry } from '../types/PasswordEntry';
import type { ThemeMode } from '../utils/theme';
import { validatePin } from '../utils/validation';

const VAULT_STORAGE_KEY = 'password_vault';
const PIN_STORAGE_KEY = 'vault_pin';
const PIN_ENABLED_KEY = 'pin_enabled';
const SETUP_COMPLETED_KEY = 'setup_completed';
const THEME_MODE_KEY = 'theme_mode';

function isPasswordEntry(value: unknown): value is PasswordEntry {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return (
    'id' in value &&
    typeof value.id === 'string' &&
    'appName' in value &&
    typeof value.appName === 'string' &&
    'username' in value &&
    typeof value.username === 'string' &&
    'password' in value &&
    typeof value.password === 'string'
  );
}

export async function getPasswords(): Promise<PasswordEntry[]> {
  try {
    const data = await AsyncStorage.getItem(VAULT_STORAGE_KEY);
    if (data === null) {
      return [];
    }

    const parsed: unknown = JSON.parse(data);
    if (!Array.isArray(parsed) || !parsed.every(isPasswordEntry)) {
      throw new Error('Saved password data has an unexpected format.');
    }
    return parsed;
  } catch (error) {
    console.error('Failed to load passwords:', error);
    throw error;
  }
}

export async function savePassword(entry: PasswordEntry): Promise<void> {
  try {
    const passwords = await getPasswords();
    await AsyncStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify([...passwords, entry]));
  } catch (error) {
    console.error('Failed to save password:', error);
    throw error;
  }
}

export async function updatePassword(id: string, entry: PasswordEntry): Promise<void> {
  try {
    const passwords = await getPasswords();
    await AsyncStorage.setItem(
      VAULT_STORAGE_KEY,
      JSON.stringify(passwords.map((password) => (password.id === id ? { ...entry, id } : password))),
    );
  } catch (error) {
    console.error('Failed to update password:', error);
    throw error;
  }
}

export async function deletePassword(id: string): Promise<void> {
  try {
    const passwords = await getPasswords();
    await AsyncStorage.setItem(
      VAULT_STORAGE_KEY,
      JSON.stringify(passwords.filter((password) => password.id !== id)),
    );
  } catch (error) {
    console.error('Failed to delete password:', error);
    throw error;
  }
}

export async function deleteAllPasswords(): Promise<void> {
  try {
    await AsyncStorage.removeItem(VAULT_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to delete all passwords:', error);
    throw error;
  }
}

export async function resetVaultData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      VAULT_STORAGE_KEY,
      PIN_STORAGE_KEY,
      PIN_ENABLED_KEY,
      SETUP_COMPLETED_KEY,
    ]);
  } catch (error) {
    console.error('Failed to reset vault data:', error);
    throw error;
  }
}

export async function getPin(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PIN_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to load PIN:', error);
    throw error;
  }
}

export async function setPin(pin: string): Promise<void> {
  const validationError = validatePin(pin);
  if (validationError) {
    throw new Error(validationError);
  }

  try {
    await AsyncStorage.setItem(PIN_STORAGE_KEY, pin);
  } catch (error) {
    console.error('Failed to save PIN:', error);
    throw error;
  }
}

export async function removePin(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PIN_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to remove PIN:', error);
    throw error;
  }
}

export async function isPinEnabled(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(PIN_ENABLED_KEY)) === 'true';
  } catch (error) {
    console.error('Failed to load PIN lock setting:', error);
    throw error;
  }
}

export async function setPinEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(PIN_ENABLED_KEY, String(enabled));
  } catch (error) {
    console.error('Failed to update PIN lock setting:', error);
    throw error;
  }
}

export async function isSetupCompleted(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(SETUP_COMPLETED_KEY)) === 'true';
  } catch (error) {
    console.error('Failed to load setup status:', error);
    throw error;
  }
}

export async function setSetupCompleted(completed: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(SETUP_COMPLETED_KEY, String(completed));
  } catch (error) {
    console.error('Failed to save setup status:', error);
    throw error;
  }
}

export async function completeInitialSetup(pin: string): Promise<void> {
  const validationError = validatePin(pin);
  if (validationError) {
    throw new Error(validationError);
  }

  try {
    await AsyncStorage.multiSet([
      [PIN_STORAGE_KEY, pin],
      [PIN_ENABLED_KEY, 'true'],
      [SETUP_COMPLETED_KEY, 'true'],
    ]);
  } catch (error) {
    console.error('Failed to complete initial setup:', error);
    throw error;
  }
}

export async function getThemeMode(): Promise<ThemeMode> {
  try {
    const mode = await AsyncStorage.getItem(THEME_MODE_KEY);
    return mode === 'dark' || mode === 'system' ? mode : 'light';
  } catch (error) {
    console.error('Failed to load theme mode:', error);
    throw error;
  }
}

export async function setThemeMode(mode: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_MODE_KEY, mode);
  } catch (error) {
    console.error('Failed to save theme mode:', error);
    throw error;
  }
}
