import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { listCatches, listObservations, listTrips } from '../../src/api';
import { CatchMapView, type MapMarker } from '../../src/CatchMapView';
import { DEFAULT_LAYER, hasMapKey, MAP_LAYERS, type MapLayerId } from '../../src/mapTiles';
import { formatDate } from '../../src/format';
import { radius, spacing } from '../../src/theme';
import type { Catch, Observation, Trip } from '../../src/types';
import { EmptyState, LoadErrorState } from '../../src/ui';
import { useTheme } from '../../src/useTheme';

type Layer = 'catches' | 'observations' | 'trips';

const FINLAND = { latitude: 62.5, longitude: 25.7, latitudeDelta: 8, longitudeDelta: 8 };

export default function MapScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [catches, setCatches] = useState<Catch[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [layers, setLayers] = useState<Layer[]>(['catches', 'observations', 'trips']);
  const [baseLayer, setBaseLayer] = useState<MapLayerId>(DEFAULT_LAYER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [c, o, tr] = await Promise.all([listCatches(), listObservations(), listTrips()]);
      setCatches(c);
      setObservations(o);
      setTrips(tr);
      setError(null);
    } catch (e) {
      // Virhettä ei saa niellä: ilman tätä epäonnistunut haku näyttäisi
      // tyhjältä kartalta, eli käyttäjälle valehdeltaisiin ettei merkintöjä ole.
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

  const markers = useMemo<MapMarker[]>(() => {
    const out: MapMarker[] = [];
    if (layers.includes('catches')) {
      for (const c of catches) {
        if (c.latitude === null || c.longitude === null) continue;
        out.push({
          id: `catch:${c.id}`,
          latitude: c.latitude,
          longitude: c.longitude,
          title: c.species,
          subtitle: formatDate(c.shot_at),
          color: 'red',
        });
      }
    }
    if (layers.includes('observations')) {
      for (const o of observations) {
        if (o.latitude === null || o.longitude === null) continue;
        out.push({
          id: `obs:${o.id}`,
          latitude: o.latitude,
          longitude: o.longitude,
          title: `${o.species} × ${o.count}`,
          subtitle: formatDate(o.seen_at),
          color: 'orange',
        });
      }
    }
    if (layers.includes('trips')) {
      for (const tr of trips) {
        if (tr.latitude === null || tr.longitude === null) continue;
        out.push({
          id: `trip:${tr.id}`,
          latitude: tr.latitude,
          longitude: tr.longitude,
          title: tr.title || tr.area || 'Metsästysreissu',
          subtitle: formatDate(tr.started_at),
          color: 'green',
        });
      }
    }
    return out;
  }, [catches, observations, trips, layers]);

  const region = useMemo(() => {
    if (markers.length === 0) return FINLAND;
    const lats = markers.map((m) => m.latitude);
    const lngs = markers.map((m) => m.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(0.05, (maxLat - minLat) * 1.5),
      longitudeDelta: Math.max(0.05, (maxLng - minLng) * 1.5),
    };
  }, [markers]);

  function openMarker(id: string) {
    const [kind, rowId] = id.split(':');
    if (kind === 'catch') router.push(`/catch/${rowId}`);
    else if (kind === 'trip') router.push(`/trip/${rowId}`);
  }

  function toggle(layer: Layer) {
    setLayers((prev) => (prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer]));
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg }}>
        <ActivityIndicator color={t.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {error ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <LoadErrorState message={error} onRetry={retry} />
        </View>
      ) : markers.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            icon="map-outline"
            title="Ei sijaintimerkintöjä"
            message="Kun tallennat saaliin tai reissun sijainnin, se ilmestyy kartalle."
          />
        </View>
      ) : (
        <CatchMapView
          markers={markers}
          initialRegion={region}
          onPressMarker={openMarker}
          layerId={baseLayer}
        />
      )}

      <View
        style={{
          position: 'absolute',
          top: insets.top + spacing.sm,
          left: spacing.lg,
          right: spacing.lg,
          flexDirection: 'row',
          gap: spacing.xs,
        }}>
        <LayerChip label="Saaliit" active={layers.includes('catches')} onPress={() => toggle('catches')} />
        <LayerChip label="Havainnot" active={layers.includes('observations')} onPress={() => toggle('observations')} />
        <LayerChip label="Reissut" active={layers.includes('trips')} onPress={() => toggle('trips')} />
      </View>

      {hasMapKey() && markers.length > 0 && (
        <View
          style={{
            position: 'absolute',
            bottom: insets.bottom + spacing.xl,
            left: spacing.lg,
            flexDirection: 'row',
            gap: spacing.xs,
          }}>
          {MAP_LAYERS.map((l) => (
            <LayerChip
              key={l.id}
              label={l.label}
              active={baseLayer === l.id}
              onPress={() => setBaseLayer(l.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function LayerChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        backgroundColor: active ? t.primary : t.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: active ? t.primary : t.border,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
      }}>
      <Text style={{ color: active ? t.primaryText : t.text, fontWeight: '600', fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}
