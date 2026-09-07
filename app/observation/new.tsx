import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { showAlert } from '../../src/alert';
import { createObservation } from '../../src/api';
import { DateTimeField } from '../../src/DateTimeField';
import { formatCoords, getCurrentCoords, type Coords } from '../../src/location';
import { SpeciesPicker } from '../../src/SpeciesPicker';
import { radius, spacing } from '../../src/theme';
import { Button, Card, Field } from '../../src/ui';
import { useTheme } from '../../src/useTheme';

export default function NewObservationScreen() {
  const t = useTheme();
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();

  const [species, setSpecies] = useState<string | null>(null);
  const [count, setCount] = useState(1);
  const [seenAt, setSeenAt] = useState(new Date());
  const [coords, setCoords] = useState<Coords | null>(null);
  const [notes, setNotes] = useState('');
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  async function pickLocation() {
    setLocating(true);
    try {
      const c = await getCurrentCoords();
      if (!c) {
        showAlert('Sijainti ei käytettävissä', 'Anna sovellukselle sijaintilupa laitteen asetuksista.');
        return;
      }
      setCoords(c);
    } finally {
      setLocating(false);
    }
  }

  async function save() {
    if (!species) {
      showAlert('Valitse laji', 'Havainnolle pitää valita laji.');
      return;
    }
    setSaving(true);
    try {
      await createObservation({
        trip_id: tripId ?? null,
        species,
        count,
        seen_at: seenAt.toISOString(),
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        notes: notes.trim() || null,
      });
      router.back();
    } catch (e) {
      showAlert('Tallennus epäonnistui', e instanceof Error ? e.message : 'Tuntematon virhe');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl }}>
        <SpeciesPicker value={species} onChange={setSpecies} />

        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: t.textMuted, fontSize: 13, fontWeight: '600' }}>Yksilöitä</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
            <StepButton icon="remove" onPress={() => setCount((c) => Math.max(1, c - 1))} />
            <Text style={{ color: t.text, fontSize: 24, fontWeight: '800', minWidth: 40, textAlign: 'center' }}>
              {count}
            </Text>
            <StepButton icon="add" onPress={() => setCount((c) => c + 1)} />
          </View>
        </View>

        <DateTimeField label="Havaintoaika" value={seenAt} onChange={setSeenAt} />

        <Card style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name="location-outline" size={18} color={t.primary} />
            <Text style={{ color: t.text, fontWeight: '700' }}>Havaintopaikka</Text>
          </View>
          <Text style={{ color: t.textMuted, fontSize: 13 }}>
            {coords ? formatCoords(coords) : 'Ei sijaintia.'}
          </Text>
          <Button
            title={coords ? 'Päivitä sijainti' : 'Hae sijainti'}
            variant="secondary"
            icon="navigate-outline"
            loading={locating}
            onPress={pickLocation}
          />
        </Card>

        <Field
          label="Muistiinpanot"
          placeholder="Suunta, etäisyys, käyttäytyminen…"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <Button title="Tallenna havainto" icon="checkmark" onPress={save} loading={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function StepButton({ icon, onPress }: { icon: 'add' | 'remove'; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: 48,
        height: 48,
        borderRadius: radius.md,
        backgroundColor: t.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.8 : 1,
      })}>
      <Ionicons name={icon} size={24} color={t.text} />
    </Pressable>
  );
}
