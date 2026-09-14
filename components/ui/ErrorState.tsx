import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/ThemeProvider';

type Props = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({ title = 'Something went wrong', message = 'Please try again.', onRetry }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={40} color={theme.colors.error} />
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={[styles.button, { backgroundColor: theme.colors.action }]}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <Text style={styles.buttonText}>Retry</Text>
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
