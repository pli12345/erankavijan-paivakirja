import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { listCatches, listTrips } from '../../src/api';
import { formatTime } from '../../src/format';
import { speciesIcon } from '../../src/species';
import { spacing } from '../../src/theme';
import type { Catch, Trip } from '../../src/types';
import { Card, EmptyState } from '../../src/ui';
import { useTheme } from '../../src/useTheme';

LocaleConfig.locales.fi = {
  monthNames: [
    'Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu',
    'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu',
  ],
  monthNamesShort: ['Tammi', 'Helmi', 'Maalis', 'Huhti', 'Touko', 'Kesä', 'Heinä', 'Elo', 'Syys', 'Loka', 'Marras', 'Joulu'],
  dayNames: ['Sunnuntai', 'Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai', 'Lauantai'],
  dayNamesShort: ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La'],
  today: 'Tänään',
};
LocaleConfig.defaultLocale = 'fi';

const dayKey = (iso: string) => format(new Date(iso), 'yyyy-MM-dd');

export default function CalendarScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [catches, setCatches] = useState<Catch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(format(new Date(), 'yyyy-MM-dd'));

  const load = useCallback(async () => {
    try {
      const [tripRows, catchRows] = await Promise.all([listTrips(), listCatches()]);
      setTrips(tripRows);
      setCatches(catchRows);
    } catch {
      // virhe näkyy päiväkirjavälilehdellä
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const marked = useMemo(() => {
    const acc: Record<string, { dots: { key: string; color: string }[]; selected?: boolean; selectedColor?: string }> = {};
    for (const trip of trips) {
      const k = dayKey(trip.started_at);
      acc[k] = acc[k] ?? { dots: [] };
      if (!acc[k].dots.some((d) => d.key === 'trip')) acc[k].dots.push({ key: 'trip', color: t.primary });
    }
    for (const c of catches) {
      const k = dayKey(c.shot_at);
      acc[k] = acc[k] ?? { dots: [] };
      if (!acc[k].dots.some((d) => d.key === 'catch')) acc[k].dots.push({ key: 'catch', color: t.accent });
    }
    acc[selected] = { ...(acc[selected] ?? { dots: [] }), selected: true, selectedColor: t.primary };
    return acc;
  }, [trips, catches, selected, t]);

  const dayTrips = trips.filter((tr) => dayKey(tr.started_at) === selected);
  const dayCatches = catches.filter((c) => dayKey(c.shot_at) === selected);

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
      <Text style={{ fontSize: 30, fontWeight: '800', color: t.text }}>Kalenteri</Text>

      <Card style={{ padding: spacing.sm }}>
        <Calendar
          firstDay={1}
          markingType="multi-dot"
          markedDates={marked}
          onDayPress={(d) => setSelected(d.dateString)}
          theme={{
            calendarBackground: t.surface,
            dayTextColor: t.text,
            monthTextColor: t.text,
            textSectionTitleColor: t.textMuted,
            todayTextColor: t.accent,
            selectedDayTextColor: t.primaryText,
            selectedDayBackgroundColor: t.primary,
            arrowColor: t.primary,
            textDisabledColor: t.tabInactive,
          }}
        />
      </Card>

      <View style={{ gap: spacing.sm }}>
        {dayTrips.length === 0 && dayCatches.length === 0 ? (
          <EmptyState icon="calendar-outline" title="Ei merkintöjä" message="Valitse päivä, jolla on merkintöjä." />
        ) : (
          <>
            {dayTrips.map((trip) => (
              <Pressable key={trip.id} onPress={() => router.push(`/trip/${trip.id}`)}>
                <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <Ionicons name="footsteps-outline" size={22} color={t.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: t.text, fontWeight: '700' }}>
                      {trip.title || trip.area || 'Metsästysreissu'}
                    </Text>
                    <Text style={{ color: t.textMuted, fontSize: 13 }}>klo {formatTime(trip.started_at)}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={t.tabInactive} />
                </Card>
              </Pressable>
            ))}
            {dayCatches.map((c) => (
              <Pressable key={c.id} onPress={() => router.push(`/catch/${c.id}`)}>
                <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <Text style={{ fontSize: 22 }}>{speciesIcon(c.species)}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: t.text, fontWeight: '700' }}>{c.species}</Text>
                    <Text style={{ color: t.textMuted, fontSize: 13 }}>klo {formatTime(c.shot_at)}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={t.tabInactive} />
                </Card>
              </Pressable>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}
