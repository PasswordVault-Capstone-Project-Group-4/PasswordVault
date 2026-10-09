export interface PasswordEntryErrors {
  appName?: string;
  username?: string;
  password?: string;
}

export interface PasswordEntryValidation {
  isValid: boolean;
  errors: PasswordEntryErrors;
}

export function validatePasswordEntry(
  appName: string,
  username: string,
  password: string,
): PasswordEntryValidation {
  const errors: PasswordEntryErrors = {};

  if (!appName.trim()) {
    errors.appName = 'Enter an app or website name.';
  }
  if (!username.trim()) {
    errors.username = 'Enter a username or email.';
  }
  if (!password.trim()) {
    errors.password = 'Enter a password.';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validatePin(pin: string): string | null {
  return /^\d{4}$/.test(pin) ? null : 'PIN must contain exactly 4 digits.';
}

export function validatePinMatch(pin: string, confirmation: string): string | null {
  return pin === confirmation ? null : 'The PINs do not match.';
}

export function validateCorrectPin(pin: string, savedPin: string): string | null {
  return pin === savedPin ? null : 'Incorrect PIN. Please try again.';
}
