import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { createCatch, uploadCatchPhoto } from '../../src/api';
import { DateTimeField } from '../../src/DateTimeField';
import { formatCoords, getCurrentCoords, type Coords } from '../../src/location';
import { hasAntlers } from '../../src/species';
import { SpeciesPicker } from '../../src/SpeciesPicker';
import { radius, spacing } from '../../src/theme';
import type { AgeClass, Sex } from '../../src/types';
import { Button, Card, Chip, Field } from '../../src/ui';
import { useTheme } from '../../src/useTheme';

const SEXES: Sex[] = ['uros', 'naaras', 'tuntematon'];
const AGES: AgeClass[] = ['aikuinen', 'nuori', 'vasa', 'tuntematon'];

export default function NewCatchScreen() {
  const t = useTheme();
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();

  const [species, setSpecies] = useState<string | null>(null);
  const [sex, setSex] = useState<Sex | null>(null);
  const [ageClass, setAgeClass] = useState<AgeClass | null>(null);
  const [weight, setWeight] = useState('');
  const [antlers, setAntlers] = useState('');
  const [shotAt, setShotAt] = useState(new Date());
  const [coords, setCoords] = useState<Coords | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  async function pickLocation() {
    setLocating(true);
    try {
      const c = await getCurrentCoords();
      if (!c) {
        Alert.alert('Sijainti ei käytettävissä', 'Anna sovellukselle sijaintilupa laitteen asetuksista.');
        return;
      }
      setCoords(c);
    } finally {
      setLocating(false);
    }
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Kameralupa puuttuu', 'Anna sovellukselle kameralupa laitteen asetuksista.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!res.canceled) setPhotoUri(res.assets[0].uri);
  }

  async function pickPhoto() {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.6, mediaTypes: ['images'] });
    if (!res.canceled) setPhotoUri(res.assets[0].uri);
  }

  async function save() {
    if (!species) {
      Alert.alert('Valitse laji', 'Saaliille pitää valita laji.');
      return;
    }
    setSaving(true);
    try {
      let photo_url: string | null = null;
      if (photoUri) photo_url = await uploadCatchPhoto(photoUri);

      const created = await createCatch({
        trip_id: tripId ?? null,
        species,
        sex,
        age_class: ageClass,
        weight_kg: weight.trim() ? Number(weight.replace(',', '.')) : null,
        antler_points: antlers.trim() ? Number(antlers) : null,
        shot_at: shotAt.toISOString(),
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        photo_url,
        notes: notes.trim() || null,
      });
      router.replace(`/catch/${created.id}`);
    } catch (e) {
      Alert.alert('Tallennus epäonnistui', e instanceof Error ? e.message : 'Tuntematon virhe');
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
          <Text style={{ color: t.textMuted, fontSize: 13, fontWeight: '600' }}>Sukupuoli</Text>
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {SEXES.map((s) => (
              <Chip key={s} label={s} selected={sex === s} onPress={() => setSex(sex === s ? null : s)} />
            ))}
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: t.textMuted, fontSize: 13, fontWeight: '600' }}>Ikäluokka</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {AGES.map((a) => (
              <Chip
                key={a}
                label={a}
                selected={ageClass === a}
                onPress={() => setAgeClass(ageClass === a ? null : a)}
              />
            ))}
          </View>
        </View>

        <Field
          label="Paino (kg)"
          placeholder="esim. 4,2"
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
        />

        {species && hasAntlers(species) && (
          <Field
            label="Sarvipiikkejä"
            placeholder="esim. 12"
            value={antlers}
            onChangeText={setAntlers}
            keyboardType="number-pad"
          />
        )}

        <DateTimeField label="Kaatoaika" value={shotAt} onChange={setShotAt} />

        <Card style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name="camera-outline" size={18} color={t.primary} />
            <Text style={{ color: t.text, fontWeight: '700' }}>Kuva</Text>
          </View>
          {photoUri && (
            <View>
              <Image
                source={{ uri: photoUri }}
                style={{ width: '100%', height: 200, borderRadius: radius.md }}
                contentFit="cover"
              />
              <Pressable
                onPress={() => setPhotoUri(null)}
                style={{
                  position: 'absolute',
                  top: spacing.sm,
                  right: spacing.sm,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: radius.pill,
                  padding: 6,
                }}>
                <Ionicons name="close" size={16} color="#fff" />
              </Pressable>
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Button title="Kamera" variant="secondary" icon="camera" onPress={takePhoto} style={{ flex: 1 }} />
            <Button title="Galleria" variant="secondary" icon="images" onPress={pickPhoto} style={{ flex: 1 }} />
          </View>
        </Card>

        <Card style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name="location-outline" size={18} color={t.primary} />
            <Text style={{ color: t.text, fontWeight: '700' }}>Kaatopaikka</Text>
          </View>
          <Text style={{ color: t.textMuted, fontSize: 13 }}>
            {coords ? formatCoords(coords) : 'Ei sijaintia — saalis ei näy kartalla ilman koordinaatteja.'}
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
          placeholder="Ampumaetäisyys, koiran työ, muuta muistettavaa…"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <Button title="Tallenna saalis" icon="checkmark" onPress={save} loading={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
