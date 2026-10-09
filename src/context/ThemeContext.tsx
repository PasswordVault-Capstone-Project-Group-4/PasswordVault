import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { setThemeMode as saveThemeMode } from '../storage/vaultStorage';
import { darkColors, lightColors, type ThemeColors, type ThemeMode } from '../utils/theme';

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  initialMode: ThemeMode;
  children: ReactNode;
}

export function ThemeProvider({ initialMode, children }: ThemeProviderProps) {
  const [mode, setCurrentMode] = useState(initialMode);
  const systemColorScheme = useColorScheme();

  const setMode = useCallback(async (nextMode: ThemeMode) => {
    await saveThemeMode(nextMode);
    setCurrentMode(nextMode);
  }, []);

  const resolvedMode = mode === 'system' ? (systemColorScheme === 'dark' ? 'dark' : 'light') : mode;

  const value = useMemo(
    () => ({
      mode,
      resolvedMode,
      colors: resolvedMode === 'dark' ? darkColors : lightColors,
      setMode,
    }),
    [mode, resolvedMode, setMode],
  );

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar style={resolvedMode === 'dark' ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useAppTheme must be used inside ThemeProvider.');
  }
  return value;
}
