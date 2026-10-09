export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  primaryLight: string;
  text: string;
  secondaryText: string;
  border: string;
  danger: string;
  success: string;
  warningSurface: string;
  warningBorder: string;
  warningText: string;
  warningSecondaryText: string;
}

export const lightColors: ThemeColors = {
  background: '#F5F7FB',
  surface: '#FFFFFF',
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  text: '#172033',
  secondaryText: '#667085',
  border: '#E4E7EC',
  danger: '#D92D20',
  success: '#039855',
  warningSurface: '#FFFAEB',
  warningBorder: '#FDE68A',
  warningText: '#92400E',
  warningSecondaryText: '#7C5B2D',
};

export const darkColors: ThemeColors = {
  background: '#11131A',
  surface: '#1B1E29',
  primary: '#8B83FF',
  primaryLight: '#292642',
  text: '#F2F3F8',
  secondaryText: '#A5A9B8',
  border: '#303442',
  danger: '#FF7369',
  success: '#32D583',
  warningSurface: '#30291C',
  warningBorder: '#5D4826',
  warningText: '#F5CA76',
  warningSecondaryText: '#D7BE8C',
};
