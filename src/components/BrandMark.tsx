import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../utils/theme';

interface BrandMarkProps {
  size: number;
}

export default function BrandMark({ size }: BrandMarkProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View
      accessibilityLabel="Password Vault logo"
      accessibilityRole="image"
      style={[
        styles.container,
        {
          borderRadius: size * 0.27,
          height: size,
          width: size,
        },
      ]}
    >
      <View
        style={[
          styles.shackle,
          {
            borderTopLeftRadius: size * 0.18,
            borderTopRightRadius: size * 0.18,
            borderWidth: size * 0.075,
            height: size * 0.43,
            top: size * 0.15,
            width: size * 0.44,
          },
        ]}
      />
      <View
        style={[
          styles.lockBody,
          {
            borderRadius: size * 0.12,
            height: size * 0.42,
            top: size * 0.43,
            width: size * 0.58,
          },
        ]}
      >
        <View
          style={[
            styles.keyhole,
            {
              borderRadius: size * 0.075,
              height: size * 0.15,
              width: size * 0.15,
            },
          ]}
        >
          <View
            style={[
              styles.keyholeStem,
              {
                borderRadius: size * 0.03,
                height: size * 0.12,
                top: size * 0.1,
                width: size * 0.055,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  shackle: {
    borderBottomWidth: 0,
    borderColor: colors.surface,
    position: 'absolute',
  },
  lockBody: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    justifyContent: 'center',
    position: 'absolute',
  },
  keyhole: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    position: 'relative',
  },
  keyholeStem: {
    backgroundColor: colors.primary,
    position: 'absolute',
  },
  });
}
