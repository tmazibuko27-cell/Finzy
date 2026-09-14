import React, { useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { EmptyState } from '@/components/ui/EmptyState';
import { useLocalStore } from '@/lib/localStore';
import { MOCK_FEED_CARDS } from '@/lib/mockFeed';

export default function SavedScreen() {
  const theme = useTheme();
  const savedIds = useLocalStore((s) => s.savedCardIds);
  const followed = useLocalStore((s) => s.followedTopicSlugs);

  const savedCards = useMemo(() => MOCK_FEED_CARDS.filter((c) => savedIds.has(c.id)), [savedIds]);
  const followedList = useMemo(() => Array.from(followed), [followed]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Saved</Text>
      </View>

      {savedCards.length === 0 && followedList.length === 0 ? (
        <EmptyState icon="bookmark-outline" title="Save anything you want to revisit" message="Tap the bookmark icon on any card in your feed." />
      ) : (
        <FlatList
          data={savedCards}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
          ListHeaderComponent={
            followedList.length > 0 ? (
              <View style={styles.followedSection}>
                <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Followed topics</Text>
                <View style={styles.chipRow}>
                  {followedList.map((slug) => (
                    <View key={slug} style={[styles.chip, { backgroundColor: theme.colors.cardBackground }]}>
                      <Text style={styles.chipText}>{slug}</Text>
                    </View>
                  ))}
                </View>
                <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary, marginTop: 20 }]}>
                  Saved cards
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => router.push(`/card/${item.id}` as never)}
              accessibilityRole="button"
            >
              <Text style={[styles.cardEyebrow, { color: theme.colors.action }]}>{item.eyebrow ?? item.type}</Text>
              <Text style={[styles.cardHook, { color: theme.colors.textPrimary }]}>{item.hook}</Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '700' },
  sectionLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  followedSection: { marginBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  chipText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  card: { borderRadius: 16, padding: 16, borderWidth: 1 },
  cardEyebrow: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  cardHook: { fontSize: 15, fontWeight: '600' },
});
