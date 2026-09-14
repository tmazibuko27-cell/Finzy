import React, { useState, useMemo } from 'react';
import { View, TextInput, FlatList, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { LabDiscovery } from '@/components/labs/LabDiscovery';
import { EmptyState } from '@/components/ui/EmptyState';
import { searchLocalContent, type SearchResult } from '@/features/discover/search';

const COLLECTIONS = [
  { title: 'Companies & their business models', query: 'company' },
  { title: 'People who shaped finance', query: 'person' },
  { title: 'Concepts worth understanding', query: 'concept' },
  { title: 'Financial history', query: 'history' },
];

export default function DiscoverScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchLocalContent(query), [query]);

  const openResult = (result: SearchResult) => {
    if (result.kind === 'card' && result.cardId) {
      router.push(`/card/${result.cardId}` as never);
    } else if (result.slug) {
      router.push(`/${result.kind}/${result.slug}` as never);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Discover</Text>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search people, companies, topics"
            placeholderTextColor={theme.colors.textSecondary}
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            accessibilityLabel="Search"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {query.trim().length > 0 ? (
        results.length === 0 ? (
          <EmptyState icon="search-outline" title="No results" message="Try a broader search term." />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 4 }}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.resultRow, { borderColor: theme.colors.border }]}
                onPress={() => openResult(item)}
                accessibilityRole="button"
              >
                <Text style={[styles.resultTitle, { color: theme.colors.textPrimary }]}>{item.title}</Text>
                {item.subtitle ? (
                  <Text style={[styles.resultSubtitle, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text>
                ) : null}
              </Pressable>
            )}
          />
        )
      ) : (
        <FlatList
          data={COLLECTIONS}
          keyExtractor={(item) => item.title}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 10 }}
          ListHeaderComponent={
            <View style={{ gap: 16, marginBottom: 4 }}>
              <LabDiscovery />
              <Pressable
                style={styles.ripBanner}
                onPress={() => router.push('/rip')}
                accessibilityRole="button"
                accessibilityLabel="Collectibles — open a pack to collect a CEO or investor card"
              >
                <View style={styles.ripBannerIcon}>
                  <Ionicons name="sparkles" size={22} color="#FDE047" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.ripBannerTitle}>Collectibles</Text>
                  <Text style={styles.ripBannerSubtitle}>Open a pack, collect legendary CEOs & investors</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
              </Pressable>
              <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Collections</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable accessibilityRole="button" onPress={() => setQuery(item.query)} style={[styles.collectionCard, { backgroundColor: theme.colors.cardBackground }]}>
              <Text style={styles.collectionText}>{item.title}</Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 12 },
  title: { fontSize: 28, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15 },
  ripBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#172554',
    borderRadius: 18,
    padding: 16,
  },
  ripBannerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(253,224,71,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripBannerTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  ripBannerSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12.5, marginTop: 2 },
  sectionLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  collectionCard: { borderRadius: 16, padding: 18, minHeight: 64, justifyContent: 'center' },
  collectionText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resultRow: { paddingVertical: 14, borderBottomWidth: 1 },
  resultTitle: { fontSize: 15, fontWeight: '600' },
  resultSubtitle: { fontSize: 12, marginTop: 2, textTransform: 'capitalize' },
});
