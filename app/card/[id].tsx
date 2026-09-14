import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { EmptyState } from '@/components/ui/EmptyState';
import { MOCK_FEED_CARDS } from '@/lib/mockFeed';

/** Demo source list keyed by card id — replace with card_sources join once live. */
const MOCK_SOURCES: Record<string, { title: string; url: string; publisher: string }[]> = {
  'mock-1': [{ title: 'Costco membership economics', url: 'https://example.com/costco', publisher: 'Demo Source' }],
  'mock-2': [{ title: 'Apple 1997 turnaround', url: 'https://example.com/apple-1997', publisher: 'Demo Source' }],
};

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const card = MOCK_FEED_CARDS.find((c) => c.id === id);
  const sources = id ? MOCK_SOURCES[id] ?? [] : [];

  if (!card) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <EmptyState icon="document-text-outline" title="Card not found" message="This card may have been removed or is not yet published." />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.hook, { color: theme.colors.textPrimary }]}>{card.hook}</Text>
      <Text style={[styles.body, { color: theme.colors.textPrimary }]}>{card.body}</Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Sources</Text>
      {sources.length === 0 ? (
        <Text style={{ color: theme.colors.textSecondary }}>No sources listed for this demo card yet.</Text>
      ) : (
        sources.map((s) => (
          <Pressable key={s.url} onPress={() => Linking.openURL(s.url)} accessibilityRole="link">
            <Text style={[styles.sourceLink, { color: theme.colors.action }]}>{s.title} — {s.publisher}</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 12 },
  hook: { fontSize: 22, fontWeight: '800', lineHeight: 28 },
  body: { fontSize: 16, lineHeight: 23 },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12 },
  sourceLink: { fontSize: 14, textDecorationLine: 'underline', marginTop: 4 },
});
