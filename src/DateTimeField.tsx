import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { formatDate, formatTime } from './format';
import { radius, spacing } from './theme';
import { useTheme } from './useTheme';

export function DateTimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date;
  onChange: (d: Date) => void;
}) {
  const t = useTheme();
  const scheme = useColorScheme();
  const [picker, setPicker] = useState<'date' | 'time' | null>(null);

  function handleChange(event: { type: string }, selected?: Date) {
    if (Platform.OS === 'android') setPicker(null);
    if (event.type === 'dismissed' || !selected) return;
    onChange(selected);
  }

  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={{ color: t.textMuted, fontSize: 13, fontWeight: '600' }}>{label}</Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <PickerButton
          text={formatDate(value.toISOString())}
          icon="📅"
          onPress={() => setPicker(picker === 'date' ? null : 'date')}
          active={picker === 'date'}
        />
        <PickerButton
          text={formatTime(value.toISOString())}
          icon="🕐"
          onPress={() => setPicker(picker === 'time' ? null : 'time')}
          active={picker === 'time'}
        />
      </View>
      {picker && (
        <DateTimePicker
          value={value}
          mode={picker}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          maximumDate={new Date()}
          locale="fi-FI"
          themeVariant={scheme === 'dark' ? 'dark' : 'light'}
        />
      )}
    </View>
  );
}

function PickerButton({
  text,
  icon,
  onPress,
  active,
}: {
  text: string;
  icon: string;
  onPress: () => void;
  active: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: t.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: active ? t.primary : t.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
      }}>
      <Text>{icon}</Text>
      <Text style={{ color: t.text, fontSize: 16 }}>{text}</Text>
    </Pressable>
  );
}
