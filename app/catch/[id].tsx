import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { showAlert, showConfirm } from '../../src/alert';
import { deleteCatch, getCatch } from '../../src/api';
import { formatDateTime } from '../../src/format';
import { formatCoords } from '../../src/location';
import { speciesIcon } from '../../src/species';
import { radius, spacing } from '../../src/theme';
import type { Catch } from '../../src/types';
import { Button, Card } from '../../src/ui';
import { useTheme } from '../../src/useTheme';

export default function CatchDetailScreen() {
  const t = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<Catch | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setItem(await getCatch(id));
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
      title: 'Poista saalis',
      message: 'Haluatko varmasti poistaa tämän saalismerkinnän?',
      confirmLabel: 'Poista',
      destructive: true,
      onConfirm: async () => {
        try {
          await deleteCatch(id);
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

  if (!item) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg }}>
        <Text style={{ color: t.textMuted }}>Saalista ei löytynyt.</Text>
      </View>
    );
  }

  const details: [string, string][] = [];
  if (item.sex) details.push(['Sukupuoli', item.sex]);
  if (item.age_class) details.push(['Ikäluokka', item.age_class]);
  if (item.weight_kg !== null) details.push(['Paino', `${item.weight_kg} kg`]);
  if (item.antler_points !== null) details.push(['Sarvipiikkejä', String(item.antler_points)]);
  if (item.latitude !== null && item.longitude !== null)
    details.push(['Kaatopaikka', formatCoords({ latitude: item.latitude, longitude: item.longitude })]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl }}>
      {item.photo_url && (
        <Image
          source={{ uri: item.photo_url }}
          style={{ width: '100%', height: 240, borderRadius: radius.lg }}
          contentFit="cover"
        />
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Text style={{ fontSize: 40 }}>{speciesIcon(item.species)}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: t.text }}>{item.species}</Text>
          <Text style={{ color: t.textMuted }}>{formatDateTime(item.shot_at)}</Text>
        </View>
      </View>

      {details.length > 0 && (
        <Card style={{ gap: spacing.md }}>
          {details.map(([label, value]) => (
            <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
              <Text style={{ color: t.textMuted }}>{label}</Text>
              <Text style={{ color: t.text, fontWeight: '600', flexShrink: 1, textAlign: 'right' }}>{value}</Text>
            </View>
          ))}
        </Card>
      )}

      {item.notes && (
        <Card style={{ gap: spacing.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name="document-text-outline" size={16} color={t.primary} />
            <Text style={{ color: t.textMuted, fontSize: 12, fontWeight: '700' }}>MUISTIINPANOT</Text>
          </View>
          <Text style={{ color: t.text }}>{item.notes}</Text>
        </Card>
      )}

      {item.trip_id && (
        <Button
          title="Avaa reissu"
          variant="secondary"
          icon="footsteps-outline"
          onPress={() => router.push(`/trip/${item.trip_id}`)}
        />
      )}

      <Button title="Poista saalis" variant="ghost" icon="trash-outline" onPress={confirmDelete} />
    </ScrollView>
  );
}
