import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { listCatches, listTrips } from '../../src/api';
import { formatDay, formatDuration, formatTime, huntingSeason } from '../../src/format';
import { speciesIcon } from '../../src/species';
import { radius, spacing } from '../../src/theme';
import type { Catch, Trip } from '../../src/types';
import { Card, EmptyState } from '../../src/ui';
import { useTheme } from '../../src/useTheme';
import { weatherIcon } from '../../src/weather';

export default function DiaryScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [catches, setCatches] = useState<Catch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [tripRows, catchRows] = await Promise.all([listTrips(), listCatches()]);
      setTrips(tripRows);
      setCatches(catchRows);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Tietojen haku epäonnistui');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const season = huntingSeason();
  const seasonTrips = trips.filter((tr) => new Date(tr.started_at) >= season.start);
  const seasonCatches = catches.filter((c) => new Date(c.shot_at) >= season.start);
  const catchesByTrip = new Map<string, Catch[]>();
  for (const c of catches) {
    if (!c.trip_id) continue;
    const arr = catchesByTrip.get(c.trip_id) ?? [];
    arr.push(c);
    catchesByTrip.set(c.trip_id, arr);
  }
  const looseCatches = catches.filter((c) => !c.trip_id);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg }}>
        <ActivityIndicator color={t.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: spacing.lg,
          paddingTop: insets.top + spacing.md,
          paddingBottom: insets.bottom + 96,
          gap: spacing.md,
        }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={t.primary} />}
        ListHeaderComponent={
          <View style={{ gap: spacing.lg, marginBottom: spacing.xs }}>
            <View>
              <Text style={{ fontSize: 30, fontWeight: '800', color: t.text }}>Päiväkirja</Text>
              <Text style={{ color: t.textMuted }}>Metsästyskausi {season.label}</Text>
            </View>

            {error && (
              <Card style={{ borderColor: t.danger }}>
                <Text style={{ color: t.danger, fontWeight: '700' }}>Virhe</Text>
                <Text style={{ color: t.textMuted, fontSize: 13 }}>{error}</Text>
              </Card>
            )}

            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <StatTile label="Reissua" value={seasonTrips.length} icon="footsteps-outline" />
              <StatTile label="Saalista" value={seasonCatches.length} icon="trophy-outline" />
              <StatTile
                label="Tuntia maastossa"
                value={Math.round(
                  seasonTrips.reduce((sum, tr) => {
                    if (!tr.ended_at) return sum;
                    return sum + (new Date(tr.ended_at).getTime() - new Date(tr.started_at).getTime()) / 3.6e6;
                  }, 0)
                )}
                icon="time-outline"
              />
            </View>

            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <QuickAction
                label="Uusi reissu"
                icon="add-circle-outline"
                onPress={() => router.push('/trip/new')}
              />
              <QuickAction
                label="Kirjaa saalis"
                icon="trophy-outline"
                onPress={() => router.push('/catch/new')}
              />
            </View>

            {looseCatches.length > 0 && (
              <View style={{ gap: spacing.sm }}>
                <Text style={{ color: t.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.8 }}>
                  SAALIIT ILMAN REISSUA
                </Text>
                {looseCatches.slice(0, 5).map((c) => (
                  <Pressable key={c.id} onPress={() => router.push(`/catch/${c.id}`)}>
                    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md }}>
                      <Text style={{ fontSize: 24 }}>{speciesIcon(c.species)}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: t.text, fontWeight: '700' }}>{c.species}</Text>
                        <Text style={{ color: t.textMuted, fontSize: 13 }}>
                          {formatDay(c.shot_at)} klo {formatTime(c.shot_at)}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={t.tabInactive} />
                    </Card>
                  </Pressable>
                ))}
              </View>
            )}

            {trips.length > 0 && (
              <Text style={{ color: t.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.8 }}>
                REISSUT
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="footsteps-outline"
            title="Ei vielä reissuja"
            message="Aloita kirjaamalla ensimmäinen metsästysreissusi."
          />
        }
        renderItem={({ item }) => (
          <TripRow trip={item} catches={catchesByTrip.get(item.id) ?? []} onPress={() => router.push(`/trip/${item.id}`)} />
        )}
      />

      <Pressable
        onPress={() => router.push('/trip/new')}
        style={({ pressed }) => ({
          position: 'absolute',
          right: spacing.lg,
          bottom: insets.bottom + spacing.lg,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: t.primary,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.85 : 1,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        })}>
        <Ionicons name="add" size={30} color={t.primaryText} />
      </Pressable>
    </View>
  );
}

function StatTile({ label, value, icon }: { label: string; value: number; icon: keyof typeof Ionicons.glyphMap }) {
  const t = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: t.surface,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: t.border,
        padding: spacing.md,
        gap: 2,
      }}>
      <Ionicons name={icon} size={18} color={t.primary} />
      <Text style={{ color: t.text, fontSize: 24, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: t.textMuted, fontSize: 11 }}>{label}</Text>
    </View>
  );
}

function QuickAction({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: t.surfaceAlt,
        borderRadius: radius.md,
        paddingVertical: 14,
        opacity: pressed ? 0.85 : 1,
      })}>
      <Ionicons name={icon} size={18} color={t.primary} />
      <Text style={{ color: t.text, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

function TripRow({ trip, catches, onPress }: { trip: Trip; catches: Catch[]; onPress: () => void }) {
  const t = useTheme();
  const duration = formatDuration(trip.started_at, trip.ended_at);
  return (
    <Pressable onPress={onPress}>
      <Card style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: t.text, fontSize: 17, fontWeight: '700' }}>
              {trip.title || trip.area || 'Metsästysreissu'}
            </Text>
            <Text style={{ color: t.textMuted, fontSize: 13 }}>
              {formatDay(trip.started_at)} klo {formatTime(trip.started_at)}
              {duration ? ` · ${duration}` : ''}
            </Text>
          </View>
          {trip.weather_code !== null && (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 20 }}>{weatherIcon(trip.weather_code)}</Text>
              {trip.weather_temp !== null && (
                <Text style={{ color: t.textMuted, fontSize: 12 }}>
                  {Math.round(trip.weather_temp)}°C
                </Text>
              )}
            </View>
          )}
        </View>

        {trip.area && trip.title ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="location-outline" size={14} color={t.textMuted} />
            <Text style={{ color: t.textMuted, fontSize: 13 }}>{trip.area}</Text>
          </View>
        ) : null}

        {catches.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {catches.map((c) => (
              <View
                key={c.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: t.surfaceAlt,
                  borderRadius: radius.pill,
                  paddingVertical: 4,
                  paddingHorizontal: spacing.sm,
                }}>
                <Text>{speciesIcon(c.species)}</Text>
                <Text style={{ color: t.text, fontSize: 12, fontWeight: '600' }}>{c.species}</Text>
              </View>
            ))}
          </View>
        )}

        {trip.companions && trip.companions.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="people-outline" size={14} color={t.textMuted} />
            <Text style={{ color: t.textMuted, fontSize: 13 }}>{trip.companions.join(', ')}</Text>
          </View>
        )}
      </Card>
    </Pressable>
  );
}
