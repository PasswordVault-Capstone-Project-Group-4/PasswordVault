import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import BrandMark from '../components/BrandMark';
import { useAppTheme } from '../context/ThemeContext';
import type { SplashScreenProps, StartupDestination } from '../navigation/AppNavigator';

const SPLASH_DURATION_MS = 1700;

export default function SplashScreen({ navigation, route }: SplashScreenProps) {
  const { colors } = useAppTheme();
  const [opacity] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(0.94));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, speed: 14, bounciness: 3, useNativeDriver: true }),
    ]).start();

    const timeout = setTimeout(() => {
      const destination: StartupDestination = route.params.destination;
      navigation.reset({ index: 0, routes: [{ name: destination }] });
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timeout);
  }, [navigation, opacity, route.params.destination, scale]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.brand, { opacity, transform: [{ scale }] }]}>
        <BrandMark size={96} />
        <Text style={[styles.title, { color: colors.text }]}>Password Vault</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>Your passwords, Offline.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 28 },
  brand: { alignItems: 'center' },
  title: { fontSize: 27, fontWeight: '800', letterSpacing: -0.5, marginTop: 24 },
  subtitle: { fontSize: 15, marginTop: 8 },
});
