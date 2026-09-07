import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth';
import { isSupabaseConfigured } from '../../src/supabase';
import { radius, spacing } from '../../src/theme';
import { Button, Card, Field } from '../../src/ui';
import { useTheme } from '../../src/useTheme';

type Mode = 'login' | 'register';

export default function LoginScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!email.trim() || !password) {
      Alert.alert('Puuttuvia tietoja', 'Täytä sähköposti ja salasana.');
      return;
    }
    if (mode === 'register' && password.length < 6) {
      Alert.alert('Liian lyhyt salasana', 'Salasanassa on oltava vähintään 6 merkkiä.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        const { needsConfirmation } = await signUp(email, password, displayName || email.split('@')[0]);
        if (needsConfirmation) {
          Alert.alert(
            'Vahvista sähköposti',
            'Lähetimme vahvistuslinkin sähköpostiisi. Vahvista tili ja kirjaudu sitten sisään.'
          );
          setMode('login');
        }
      }
    } catch (e) {
      Alert.alert('Kirjautuminen epäonnistui', e instanceof Error ? e.message : 'Tuntematon virhe');
    } finally {
      setBusy(false);
    }
  }

  async function forgot() {
    if (!email.trim()) {
      Alert.alert('Anna sähköposti', 'Kirjoita ensin sähköpostiosoitteesi kenttään.');
      return;
    }
    try {
      await resetPassword(email);
      Alert.alert('Tarkista sähköpostisi', 'Lähetimme salasanan palautuslinkin.');
    } catch (e) {
      Alert.alert('Virhe', e instanceof Error ? e.message : 'Tuntematon virhe');
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: spacing.xl,
          paddingTop: insets.top + spacing.xl,
          gap: spacing.xl,
        }}
        keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: radius.lg,
              backgroundColor: t.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Ionicons name="leaf" size={38} color={t.primary} />
          </View>
          <Text style={{ fontSize: 28, fontWeight: '800', color: t.text, textAlign: 'center' }}>
            Eränkävijän päiväkirja
          </Text>
          <Text style={{ color: t.textMuted, textAlign: 'center' }}>
            Tallenna reissut, saaliit ja havainnot
          </Text>
        </View>

        {!isSupabaseConfigured && (
          <Card style={{ borderColor: t.accent, gap: spacing.xs }}>
            <Text style={{ color: t.text, fontWeight: '700' }}>Supabase-yhteyttä ei ole määritetty</Text>
            <Text style={{ color: t.textMuted, fontSize: 13 }}>
              Lisää projektin juureen .env-tiedosto, jossa on EXPO_PUBLIC_SUPABASE_URL ja
              EXPO_PUBLIC_SUPABASE_ANON_KEY, ja käynnistä sovellus uudelleen.
            </Text>
          </Card>
        )}

        <Card style={{ gap: spacing.lg }}>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: t.surfaceAlt,
              borderRadius: radius.md,
              padding: 4,
            }}>
            {(['login', 'register'] as Mode[]).map((m) => (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: radius.sm,
                  alignItems: 'center',
                  backgroundColor: mode === m ? t.surface : 'transparent',
                  borderWidth: mode === m ? StyleSheet.hairlineWidth : 0,
                  borderColor: t.border,
                }}>
                <Text style={{ color: mode === m ? t.text : t.textMuted, fontWeight: '700' }}>
                  {m === 'login' ? 'Kirjaudu' : 'Rekisteröidy'}
                </Text>
              </Pressable>
            ))}
          </View>

          {mode === 'register' && (
            <Field
              label="Nimi"
              placeholder="Matti Metsästäjä"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
            />
          )}

          <Field
            label="Sähköposti"
            placeholder="metsastaja@esimerkki.fi"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Field
            label="Salasana"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          {mode === 'login' && (
            <Pressable onPress={forgot}>
              <Text style={{ color: t.textMuted, fontSize: 13 }}>Unohditko salasanasi?</Text>
            </Pressable>
          )}

          <Button
            title={mode === 'login' ? 'Kirjaudu sisään' : 'Luo tili'}
            icon={mode === 'login' ? 'log-in-outline' : 'person-add-outline'}
            onPress={submit}
            loading={busy}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
