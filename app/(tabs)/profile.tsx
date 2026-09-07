import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProfile, updateProfile } from '../../src/api';
import { useAuth } from '../../src/auth';
import { spacing } from '../../src/theme';
import { Button, Card, Field } from '../../src/ui';
import { useTheme } from '../../src/useTheme';

export default function ProfileScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { session, signOut } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [club, setClub] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const profile = await getProfile();
      setDisplayName(profile?.display_name ?? '');
      setClub(profile?.hunting_club ?? '');
    } catch {
      // profiilia ei ole vielä luotu
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function save() {
    setSaving(true);
    try {
      await updateProfile({ display_name: displayName.trim() || null, hunting_club: club.trim() || null });
      Alert.alert('Tallennettu', 'Profiilitiedot päivitettiin.');
    } catch (e) {
      Alert.alert('Tallennus epäonnistui', e instanceof Error ? e.message : 'Tuntematon virhe');
    } finally {
      setSaving(false);
    }
  }

  function confirmSignOut() {
    Alert.alert('Kirjaudu ulos', 'Haluatko kirjautua ulos?', [
      { text: 'Peruuta', style: 'cancel' },
      { text: 'Kirjaudu ulos', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg }}>
        <ActivityIndicator color={t.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingTop: insets.top + spacing.md,
        paddingBottom: insets.bottom + spacing.xxl,
        gap: spacing.lg,
      }}>
      <Text style={{ fontSize: 30, fontWeight: '800', color: t.text }}>Profiili</Text>

      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Ionicons name="person-circle-outline" size={44} color={t.primary} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.text, fontWeight: '700' }}>{displayName || 'Metsästäjä'}</Text>
          <Text style={{ color: t.textMuted, fontSize: 13 }}>{session?.user.email}</Text>
        </View>
      </Card>

      <Field label="Nimi" placeholder="Matti Metsästäjä" value={displayName} onChangeText={setDisplayName} />
      <Field label="Metsästysseura" placeholder="Kivikankaan Erä ry" value={club} onChangeText={setClub} />

      <Button title="Tallenna tiedot" icon="checkmark" onPress={save} loading={saving} />
      <Button title="Kirjaudu ulos" variant="ghost" icon="log-out-outline" onPress={confirmSignOut} />
    </ScrollView>
  );
}
