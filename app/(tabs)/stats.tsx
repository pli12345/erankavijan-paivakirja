import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { listCatches, listObservations, listTrips } from '../../src/api';
import { huntingSeason } from '../../src/format';
import { speciesIcon } from '../../src/species';
import { radius, spacing } from '../../src/theme';
import type { Catch, Observation, Trip } from '../../src/types';
import { Card, Chip, EmptyState, LoadErrorState, SectionTitle } from '../../src/ui';
import { useTheme } from '../../src/useTheme';

const MONTH_LABELS = ['Elo', 'Syys', 'Loka', 'Marras', 'Joulu', 'Tammi', 'Helmi', 'Maalis', 'Huhti', 'Touko', 'Kesä', 'Heinä'];

export default function StatsScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [catches, setCatches] = useState<Catch[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seasonOffset, setSeasonOffset] = useState(0);

  const load = useCallback(async () => {
    try {
      const [tr, c, o] = await Promise.all([listTrips(), listCatches(), listObservations()]);
      setTrips(tr);
      setCatches(c);
      setObservations(o);
      setError(null);
    } catch (e) {
      // Virhettä ei saa niellä: muuten epäonnistunut haku näyttää tilastoilta,
      // joissa kaikki luvut ovat nollia.
      setError(e instanceof Error ? e.message : 'Tuntematon virhe');
    } finally {
      setLoading(false);
    }
  }, []);

  const retry = useCallback(() => {
    setLoading(true);
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const season = useMemo(() => {
    const base = huntingSeason();
    if (seasonOffset === 0) return base;
    const start = new Date(base.start.getFullYear() + seasonOffset, 7, 1);
    return {
      start,
      end: new Date(start.getFullYear() + 1, 6, 31, 23, 59, 59),
      label: `${start.getFullYear()}–${String(start.getFullYear() + 1).slice(2)}`,
    };
  }, [seasonOffset]);

  const inSeason = <T,>(rows: T[], dateOf: (r: T) => string) =>
    rows.filter((r) => {
      const d = new Date(dateOf(r));
      return d >= season.start && d <= season.end;
    });

  const seasonTrips = inSeason(trips, (r) => r.started_at);
  const seasonCatches = inSeason(catches, (r) => r.shot_at);
  const seasonObs = inSeason(observations, (r) => r.seen_at);

  const bySpecies = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of seasonCatches) counts.set(c.species, (counts.get(c.species) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [seasonCatches]);

  const byMonth = useMemo(() => {
    const counts = new Array(12).fill(0);
    for (const c of seasonCatches) {
      const m = new Date(c.shot_at).getMonth();
      counts[(m + 5) % 12] += 1;
    }
    return counts;
  }, [seasonCatches]);

  const hours = seasonTrips.reduce((sum, tr) => {
    if (!tr.ended_at) return sum;
    return sum + (new Date(tr.ended_at).getTime() - new Date(tr.started_at).getTime()) / 3.6e6;
  }, 0);

  const totalWeight = seasonCatches.reduce((sum, c) => sum + (c.weight_kg ?? 0), 0);
  const maxSpecies = bySpecies[0]?.[1] ?? 1;
  const maxMonth = Math.max(...byMonth, 1);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg }}>
        <ActivityIndicator color={t.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: t.bg }}>
        <LoadErrorState message={error} onRetry={retry} />
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
      <Text style={{ fontSize: 30, fontWeight: '800', color: t.text }}>Tilastot</Text>

      <View style={{ flexDirection: 'row', gap: spacing.xs }}>
        {[-2, -1, 0].map((off) => {
          const y = huntingSeason().start.getFullYear() + off;
          return (
            <Chip
              key={off}
              label={`${y}–${String(y + 1).slice(2)}`}
              selected={seasonOffset === off}
              onPress={() => setSeasonOffset(off)}
            />
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Metric label="Reissua" value={String(seasonTrips.length)} />
        <Metric label="Saalista" value={String(seasonCatches.length)} />
        <Metric label="Havaintoa" value={String(seasonObs.length)} />
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Metric label="Tuntia maastossa" value={String(Math.round(hours))} />
        <Metric label="Saalista yhteensä" value={`${totalWeight.toFixed(1)} kg`} />
        <Metric
          label="Saalista / reissu"
          value={seasonTrips.length ? (seasonCatches.length / seasonTrips.length).toFixed(1) : '0'}
        />
      </View>

      {seasonCatches.length === 0 ? (
        <EmptyState
          icon="stats-chart-outline"
          title="Ei saaliita kaudella"
          message={`Kaudella ${season.label} ei ole vielä saalismerkintöjä.`}
        />
      ) : (
        <>
          <View style={{ gap: spacing.sm }}>
            <SectionTitle>Saaliit lajeittain</SectionTitle>
            <Card style={{ gap: spacing.md }}>
              {bySpecies.map(([name, count]) => (
                <View key={name} style={{ gap: 4 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: t.text, fontWeight: '600' }}>
                      {speciesIcon(name)} {name}
                    </Text>
                    <Text style={{ color: t.textMuted, fontWeight: '700' }}>{count}</Text>
                  </View>
                  <View style={{ height: 8, backgroundColor: t.surfaceAlt, borderRadius: radius.pill }}>
                    <View
                      style={{
                        height: 8,
                        width: `${(count / maxSpecies) * 100}%`,
                        backgroundColor: t.primary,
                        borderRadius: radius.pill,
                      }}
                    />
                  </View>
                </View>
              ))}
            </Card>
          </View>

          <View style={{ gap: spacing.sm }}>
            <SectionTitle>Saaliit kuukausittain</SectionTitle>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 140, gap: 4 }}>
                {byMonth.map((count, i) => (
                  <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                    <Text style={{ color: t.textMuted, fontSize: 10 }}>{count > 0 ? count : ''}</Text>
                    <View
                      style={{
                        width: '100%',
                        height: Math.max(2, (count / maxMonth) * 100),
                        backgroundColor: count > 0 ? t.primary : t.surfaceAlt,
                        borderRadius: 4,
                      }}
                    />
                    <Text style={{ color: t.textMuted, fontSize: 9 }}>{MONTH_LABELS[i]}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  return (
    <Card style={{ flex: 1, padding: spacing.md, gap: 2 }}>
      <Text style={{ color: t.text, fontSize: 22, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: t.textMuted, fontSize: 11 }}>{label}</Text>
    </Card>
  );
}
