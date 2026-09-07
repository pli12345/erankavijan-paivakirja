import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SPECIES, SPECIES_GROUPS, type SpeciesGroup } from './species';
import { radius, spacing } from './theme';
import { useTheme } from './useTheme';

export function SpeciesPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (name: string) => void;
}) {
  const t = useTheme();
  const [group, setGroup] = useState<SpeciesGroup | null>(null);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const visible = SPECIES.filter(
    (s) => (!group || s.group === group) && (!q || s.name.toLowerCase().includes(q))
  );

  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={{ color: t.textMuted, fontSize: 13, fontWeight: '600' }}>Laji</Text>

      <TextInput
        placeholder="Hae lajia…"
        placeholderTextColor={t.textMuted}
        value={query}
        onChangeText={setQuery}
        style={{
          backgroundColor: t.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: t.border,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
          paddingVertical: 10,
          color: t.text,
          fontSize: 15,
        }}
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
        <GroupChip label="Kaikki" active={group === null} onPress={() => setGroup(null)} />
        {SPECIES_GROUPS.map((g) => (
          <GroupChip key={g} label={g} active={group === g} onPress={() => setGroup(g)} />
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
        {visible.map((s) => {
          const selected = value === s.name;
          return (
            <Pressable
              key={s.name}
              onPress={() => onChange(s.name)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                borderRadius: radius.pill,
                backgroundColor: selected ? t.primary : t.surface,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: selected ? t.primary : t.border,
              }}>
              <Text>{s.icon}</Text>
              <Text style={{ color: selected ? t.primaryText : t.text, fontWeight: selected ? '700' : '500' }}>
                {s.name}
              </Text>
            </Pressable>
          );
        })}
        {visible.length === 0 && (
          <Text style={{ color: t.textMuted, fontSize: 13 }}>Ei osumia haulla “{query}”.</Text>
        )}
      </View>
    </View>
  );
}

function GroupChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 6,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        backgroundColor: active ? t.surfaceAlt : 'transparent',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: active ? t.primary : t.border,
      }}>
      <Text style={{ color: active ? t.text : t.textMuted, fontSize: 13, fontWeight: active ? '700' : '500' }}>
        {label}
      </Text>
    </Pressable>
  );
}
