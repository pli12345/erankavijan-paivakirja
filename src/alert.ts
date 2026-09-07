import { Alert, Platform } from 'react-native';

/**
 * react-native-webin Alert.alert on tyhjä funktio, joten natiivi Alert
 * kadottaisi kaikki ilmoitukset selaimessa. Ohjataan web omiin dialogeihinsa.
 */
export function showAlert(title: string, message?: string) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

export function showConfirm({
  title,
  message,
  confirmLabel,
  destructive,
  onConfirm,
}: {
  title: string;
  message?: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  if (Platform.OS === 'web') {
    if (window.confirm(message ? `${title}\n\n${message}` : title)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Peruuta', style: 'cancel' },
    { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}

/** Supabasen virheviestit ovat englanniksi — käännetään yleisimmät. */
export function authErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const map: Record<string, string> = {
    'Invalid login credentials': 'Väärä sähköposti tai salasana.',
    'Email not confirmed': 'Sähköpostia ei ole vahvistettu. Tarkista postilaatikkosi vahvistuslinkin varalta.',
    'User already registered': 'Tälle sähköpostille on jo tunnus. Kirjaudu sisään sen sijaan.',
    'Password should be at least 6 characters.': 'Salasanassa on oltava vähintään 6 merkkiä.',
    'Unable to validate email address: invalid format': 'Sähköpostiosoite ei kelpaa.',
    'Signup requires a valid password': 'Anna salasana.',
    'Email rate limit exceeded': 'Liian monta yritystä. Odota hetki ja yritä uudelleen.',
  };
  if (map[raw]) return map[raw];
  if (raw.toLowerCase().includes('failed to fetch') || raw.toLowerCase().includes('network')) {
    return 'Palvelimeen ei saada yhteyttä. Tarkista verkkoyhteys.';
  }
  return raw;
}
