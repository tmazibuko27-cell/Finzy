import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/ThemeProvider';

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon = 'sparkles-outline', title, message, actionLabel, onAction }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={40} color={theme.colors.textSecondary} />
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
      {message ? <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={[styles.button, { backgroundColor: theme.colors.action }]}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  title: { fontSize: 17, fontWeight: '600', textAlign: 'center' },
  message: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  button: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
