import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { createTrip } from '../../src/api';
import { DateTimeField } from '../../src/DateTimeField';
import { formatCoords, getCurrentCoords, type Coords } from '../../src/location';
import { spacing } from '../../src/theme';
import { Button, Card, Field } from '../../src/ui';
import { useTheme } from '../../src/useTheme';
import { fetchWeather, weatherDescription, weatherIcon, type Weather } from '../../src/weather';

export default function NewTripScreen() {
  const t = useTheme();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('');
  const [startedAt, setStartedAt] = useState(new Date());
  const [endedAt, setEndedAt] = useState<Date | null>(null);
  const [companions, setCompanions] = useState('');
  const [notes, setNotes] = useState('');
  const [coords, setCoords] = useState<Coords | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
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
      setWeather(await fetchWeather(c.latitude, c.longitude));
    } finally {
      setLocating(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const trip = await createTrip({
        title: title.trim() || null,
        area: area.trim() || null,
        started_at: startedAt.toISOString(),
        ended_at: endedAt ? endedAt.toISOString() : null,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        weather_temp: weather?.temperature ?? null,
        weather_code: weather?.code ?? null,
        wind_speed: weather?.windSpeed ?? null,
        companions: companions.trim() ? companions.split(',').map((s) => s.trim()).filter(Boolean) : null,
        notes: notes.trim() || null,
      });
      router.replace(`/trip/${trip.id}`);
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
        <Field label="Otsikko" placeholder="Aamupassi Kivikankaalla" value={title} onChangeText={setTitle} />
        <Field label="Alue" placeholder="Kivikangas, Ylistaro" value={area} onChangeText={setArea} />

        <DateTimeField label="Aloitus" value={startedAt} onChange={setStartedAt} />

        {endedAt ? (
          <View style={{ gap: spacing.xs }}>
            <DateTimeField label="Lopetus" value={endedAt} onChange={setEndedAt} />
            <Button title="Poista lopetusaika" variant="ghost" onPress={() => setEndedAt(null)} />
          </View>
        ) : (
          <Button
            title="Lisää lopetusaika"
            variant="secondary"
            icon="time-outline"
            onPress={() => setEndedAt(new Date())}
          />
        )}

        <Card style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name="location-outline" size={18} color={t.primary} />
            <Text style={{ color: t.text, fontWeight: '700' }}>Sijainti ja sää</Text>
          </View>
          {coords ? (
            <View style={{ gap: spacing.xs }}>
              <Text style={{ color: t.textMuted, fontSize: 13 }}>{formatCoords(coords)}</Text>
              {weather && (
                <Text style={{ color: t.text }}>
                  {weatherIcon(weather.code)} {weatherDescription(weather.code)} ·{' '}
                  {Math.round(weather.temperature)} °C · tuuli {Math.round(weather.windSpeed)} m/s
                </Text>
              )}
            </View>
          ) : (
            <Text style={{ color: t.textMuted, fontSize: 13 }}>
              Hae sijainti, niin sää tallentuu automaattisesti reissun tietoihin.
            </Text>
          )}
          <Button
            title={coords ? 'Päivitä sijainti' : 'Hae sijainti'}
            variant="secondary"
            icon="navigate-outline"
            loading={locating}
            onPress={pickLocation}
          />
        </Card>

        <Field
          label="Seuruekaverit"
          placeholder="Jari, Timo, Anne"
          hint="Erota nimet pilkulla"
          value={companions}
          onChangeText={setCompanions}
        />

        <Field
          label="Muistiinpanot"
          placeholder="Sää, tuuli, koiran työskentely, havainnot…"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <Button title="Tallenna reissu" icon="checkmark" onPress={save} loading={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
