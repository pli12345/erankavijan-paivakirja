import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { radius, spacing } from './theme';
import { useTheme } from './useTheme';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.surface,
          borderRadius: radius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: t.border,
          padding: spacing.lg,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const bg =
    variant === 'primary' ? t.primary : variant === 'danger' ? t.danger : variant === 'secondary' ? t.surfaceAlt : 'transparent';
  const fg = variant === 'primary' || variant === 'danger' ? t.primaryText : t.text;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderRadius: radius.md,
          paddingVertical: 14,
          paddingHorizontal: spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          borderWidth: variant === 'ghost' ? StyleSheet.hairlineWidth : 0,
          borderColor: t.border,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={fg} />}
          <Text style={{ color: fg, fontSize: 16, fontWeight: '600' }}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  hint,
  ...props
}: TextInputProps & { label: string; hint?: string }) {
  const t = useTheme();
  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={{ color: t.textMuted, fontSize: 13, fontWeight: '600' }}>{label}</Text>
      <TextInput
        placeholderTextColor={t.textMuted}
        {...props}
        style={[
          {
            backgroundColor: t.surface,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: t.border,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: 12,
            fontSize: 16,
            color: t.text,
          },
          props.multiline && { minHeight: 96, textAlignVertical: 'top' },
          props.style,
        ]}
      />
      {hint && <Text style={{ color: t.textMuted, fontSize: 12 }}>{hint}</Text>}
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        backgroundColor: selected ? t.primary : t.surfaceAlt,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: selected ? t.primary : t.border,
      }}>
      <Text style={{ color: selected ? t.primaryText : t.text, fontWeight: selected ? '700' : '500' }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function EmptyState({
  icon = 'leaf-outline',
  title,
  message,
  tone = 'neutral',
  action,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  /** 'danger' merkitsee, ettei data puutu vaan sen haku epäonnistui. */
  tone?: 'neutral' | 'danger';
  action?: { label: string; onPress: () => void };
}) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.xxl * 1.5, gap: spacing.sm }}>
      <Ionicons name={icon} size={44} color={tone === 'danger' ? t.danger : t.tabInactive} />
      <Text style={{ color: t.text, fontSize: 17, fontWeight: '700' }}>{title}</Text>
      {message && (
        <Text style={{ color: t.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl }}>
          {message}
        </Text>
      )}
      {action && (
        <View style={{ marginTop: spacing.md }}>
          <Button title={action.label} variant="secondary" icon="refresh" onPress={action.onPress} />
        </View>
      )}
    </View>
  );
}

/**
 * Latausvirhe. Erillinen komponentti, koska tyhjä tila ja epäonnistunut haku
 * eivät saa näyttää samalta: "ei merkintöjä" on valhe, jos haku kaatui.
 */
export function LoadErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      tone="danger"
      title="Tietojen haku epäonnistui"
      message={message}
      action={{ label: 'Yritä uudelleen', onPress: onRetry }}
    />
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <Text
      style={{
        color: t.textMuted,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
      }}>
      {children}
    </Text>
  );
}
