import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../utils/theme';

type TabName = 'Home' | 'Add' | 'Settings';

interface TabActionProps {
  color: string;
  focused: boolean;
  label: string;
  onPress: () => void;
  onLongPress: () => void;
  tabName: TabName;
}

function TabAction({
  color,
  focused,
  label,
  onPress,
  onLongPress,
  tabName,
}: TabActionProps) {
  const [scale] = useState(() => new Animated.Value(1));
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  function animateTo(value: number) {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 35,
      bounciness: 4,
    }).start();
  }

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      onLongPress={onLongPress}
      onPress={onPress}
      onPressIn={() => animateTo(0.94)}
      onPressOut={() => animateTo(1)}
      style={styles.tabAction}
    >
      <Animated.View
        style={[
          styles.tabContent,
          focused && styles.tabContentActive,
          { transform: [{ scale }] },
        ]}
      >
        <View style={styles.iconPill}>
          <SymbolView
            name={
              tabName === 'Home'
                ? { ios: 'lock.fill', android: 'lock', web: 'lock' }
                : { ios: 'gearshape.fill', android: 'settings', web: 'settings' }
            }
            size={20}
            tintColor={color}
            style={styles.symbol}
          />
        </View>
        <Text style={[styles.label, focused ? styles.labelActive : styles.labelInactive]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function AddTabAction({
  focused,
  onPress,
  onLongPress,
}: {
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const [scale] = useState(() => new Animated.Value(1));
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  function animateTo(value: number) {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 35,
      bounciness: 5,
    }).start();
  }

  return (
    <Pressable
      accessibilityLabel="Add password"
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      onLongPress={onLongPress}
      onPress={onPress}
      onPressIn={() => animateTo(0.92)}
      onPressOut={() => animateTo(1)}
      style={styles.addAction}
    >
      <Animated.View
        style={[
          styles.addContent,
          focused && styles.addContentActive,
          { transform: [{ scale }] },
        ]}
      >
        <View style={[styles.addButton, focused ? styles.addButtonActive : styles.addButtonInactive]}>
          <SymbolView
            name={{ ios: 'plus', android: 'add', web: 'add' }}
            size={26}
            tintColor={focused ? colors.surface : colors.primary}
            style={styles.addSymbol}
          />
        </View>
        <Text style={[styles.label, focused ? styles.labelActive : styles.labelInactive]}>
          Add
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.bar,
        {
          bottom: Math.max(insets.bottom, 6) + 2,
          left: 24,
          right: 24,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        function handlePress() {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        }

        function handleLongPress() {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        }

        if (route.name === 'Add') {
          return (
            <AddTabAction
              focused={focused}
              key={route.key}
              onLongPress={handleLongPress}
              onPress={handlePress}
            />
          );
        }

        if (route.name === 'Home') {
          return (
            <TabAction
              color={focused ? colors.primary : colors.secondaryText}
              focused={focused}
              key={route.key}
              label="Vault"
              onLongPress={handleLongPress}
              onPress={handlePress}
              tabName="Home"
            />
          );
        }

        return (
          <TabAction
            color={focused ? colors.primary : colors.secondaryText}
            focused={focused}
            key={route.key}
            label="Settings"
            onLongPress={handleLongPress}
            onPress={handlePress}
            tabName="Settings"
          />
        );
      })}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  bar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    height: 68,
    justifyContent: 'space-around',
    overflow: 'visible',
    paddingHorizontal: 10,
    position: 'absolute',
  },
  tabAction: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    borderRadius: 16,
    justifyContent: 'center',
    minWidth: 76,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tabContentActive: {
    backgroundColor: colors.primaryLight,
  },
  iconPill: {
    alignItems: 'center',
    height: 26,
    justifyContent: 'center',
    width: 48,
  },
  symbol: {
    height: 21,
    width: 21,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  labelActive: {
    color: colors.primary,
  },
  labelInactive: {
    color: colors.secondaryText,
  },
  addAction: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-start',
  },
  addContent: {
    alignItems: 'center',
    marginTop: -18,
    paddingHorizontal: 10,
    paddingBottom: 3,
    borderRadius: 20,
  },
  addContentActive: {
    backgroundColor: colors.primaryLight,
  },
  addButton: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 4,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  addButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.surface,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 9,
  },
  addButtonInactive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.surface,
  },
  addSymbol: {
    height: 27,
    width: 27,
  },
  });
}
