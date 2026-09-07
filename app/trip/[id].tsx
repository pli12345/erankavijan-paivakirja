import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { showAlert, showConfirm } from '../../src/alert';
import { deleteTrip, getTrip, listCatches, listObservations } from '../../src/api';
import { formatCoords } from '../../src/location';
import { formatDateTime, formatDuration, formatTime } from '../../src/format';
import { speciesIcon } from '../../src/species';
import { spacing } from '../../src/theme';
import type { Catch, Observation, Trip } from '../../src/types';
import { Button, Card, SectionTitle } from '../../src/ui';
import { useTheme } from '../../src/useTheme';
import { weatherDescription, weatherIcon } from '../../src/weather';

export default function TripDetailScreen() {
  const t = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [catches, setCatches] = useState<Catch[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [tripRow, catchRows, obsRows] = await Promise.all([
        getTrip(id),
        listCatches(id),
        listObservations(id),
      ]);
      setTrip(tripRow);
      setCatches(catchRows);
      setObservations(obsRows);
    } catch (e) {
      showAlert('Virhe', e instanceof Error ? e.message : 'Tietojen haku epäonnistui');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function confirmDelete() {
    showConfirm({
      title: 'Poista reissu',
      message: 'Haluatko varmasti poistaa tämän reissun? Saaliit jäävät päiväkirjaan.',
      confirmLabel: 'Poista',
      destructive: true,
      onConfirm: async () => {
        try {
          await deleteTrip(id);
          router.back();
        } catch (e) {
          showAlert('Poisto epäonnistui', e instanceof Error ? e.message : 'Tuntematon virhe');
        }
      },
    });
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg }}>
        <ActivityIndicator color={t.primary} size="large" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg }}>
        <Text style={{ color: t.textMuted }}>Reissua ei löytynyt.</Text>
      </View>
    );
  }

  const duration = formatDuration(trip.started_at, trip.ended_at);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl }}>
      <View>
        <Text style={{ fontSize: 26, fontWeight: '800', color: t.text }}>
          {trip.title || trip.area || 'Metsästysreissu'}
        </Text>
        <Text style={{ color: t.textMuted }}>
          {formatDateTime(trip.started_at)}
          {trip.ended_at ? ` – ${formatTime(trip.ended_at)}` : ''}
          {duration ? ` · ${duration}` : ''}
        </Text>
      </View>

      <Card style={{ gap: spacing.md }}>
        {trip.area && <InfoRow icon="location-outline" label="Alue" value={trip.area} />}
        {trip.weather_code !== null && (
          <InfoRow
            icon="partly-sunny-outline"
            label="Sää"
            value={`${weatherIcon(trip.weather_code)} ${weatherDescription(trip.weather_code)}${
              trip.weather_temp !== null ? ` · ${Math.round(trip.weather_temp)} °C` : ''
            }${trip.wind_speed !== null ? ` · tuuli ${Math.round(trip.wind_speed)} m/s` : ''}`}
          />
        )}
        {trip.companions && trip.companions.length > 0 && (
          <InfoRow icon="people-outline" label="Seurue" value={trip.companions.join(', ')} />
        )}
        {trip.latitude !== null && trip.longitude !== null && (
          <InfoRow
            icon="navigate-outline"
            label="Koordinaatit"
            value={formatCoords({ latitude: trip.latitude, longitude: trip.longitude })}
          />
        )}
        {trip.notes && <InfoRow icon="document-text-outline" label="Muistiinpanot" value={trip.notes} />}
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Button
          title="Lisää saalis"
          icon="trophy-outline"
          onPress={() => router.push(`/catch/new?tripId=${trip.id}`)}
          style={{ flex: 1 }}
        />
        <Button
          title="Lisää havainto"
          variant="secondary"
          icon="eye-outline"
          onPress={() => router.push(`/observation/new?tripId=${trip.id}`)}
          style={{ flex: 1 }}
        />
      </View>

      <View style={{ gap: spacing.sm }}>
        <SectionTitle>Saaliit ({catches.length})</SectionTitle>
        {catches.length === 0 ? (
          <Text style={{ color: t.textMuted, fontSize: 13 }}>Ei saaliita tällä reissulla.</Text>
        ) : (
          catches.map((c) => (
            <Pressable key={c.id} onPress={() => router.push(`/catch/${c.id}`)}>
              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md }}>
                <Text style={{ fontSize: 24 }}>{speciesIcon(c.species)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: t.text, fontWeight: '700' }}>{c.species}</Text>
                  <Text style={{ color: t.textMuted, fontSize: 13 }}>
                    klo {formatTime(c.shot_at)}
                    {c.weight_kg !== null ? ` · ${c.weight_kg} kg` : ''}
                    {c.sex ? ` · ${c.sex}` : ''}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={t.tabInactive} />
              </Card>
            </Pressable>
          ))
        )}
      </View>

      <View style={{ gap: spacing.sm }}>
        <SectionTitle>Havainnot ({observations.length})</SectionTitle>
        {observations.length === 0 ? (
          <Text style={{ color: t.textMuted, fontSize: 13 }}>Ei havaintoja tällä reissulla.</Text>
        ) : (
          observations.map((o) => (
            <Card key={o.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md }}>
              <Text style={{ fontSize: 24 }}>{speciesIcon(o.species)}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontWeight: '700' }}>
                  {o.species} × {o.count}
                </Text>
                <Text style={{ color: t.textMuted, fontSize: 13 }}>
                  klo {formatTime(o.seen_at)}
                  {o.notes ? ` · ${o.notes}` : ''}
                </Text>
              </View>
            </Card>
          ))
        )}
      </View>

      <Button title="Poista reissu" variant="ghost" icon="trash-outline" onPress={confirmDelete} />
    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: spacing.md }}>
      <Ionicons name={icon} size={18} color={t.primary} style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: t.textMuted, fontSize: 12, fontWeight: '600' }}>{label}</Text>
        <Text style={{ color: t.text }}>{value}</Text>
      </View>
    </View>
  );
}
