import { Pressable, ScrollView, Text, View } from 'react-native';
import { spacing } from './theme';
import { useTheme } from './useTheme';

export type MapMarker = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  subtitle?: string;
  color: string;
};

/** Kartta toimii vain iOS- ja Android-sovelluksessa; webissä näytetään lista. */
export function CatchMapView({
  markers,
  onPressMarker,
}: {
  markers: MapMarker[];
  initialRegion: unknown;
  onPressMarker: (id: string) => void;
}) {
  const t = useTheme();
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}>
      <Text style={{ color: t.textMuted, fontSize: 13 }}>
        Kartta näkyy vain iOS- ja Android-sovelluksessa. Alla merkinnät koordinaatteineen.
      </Text>
      {markers.map((m) => (
        <Pressable
          key={m.id}
          onPress={() => onPressMarker(m.id)}
          style={{ paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: t.border }}>
          <Text style={{ color: t.text, fontWeight: '700' }}>{m.title}</Text>
          <Text style={{ color: t.textMuted, fontSize: 13 }}>
            {m.subtitle ? `${m.subtitle} · ` : ''}
            {m.latitude.toFixed(5)}, {m.longitude.toFixed(5)}
          </Text>
        </Pressable>
      ))}
      {markers.length === 0 && <Text style={{ color: t.textMuted }}>Ei sijaintitietoja.</Text>}
    </ScrollView>
  );
}
