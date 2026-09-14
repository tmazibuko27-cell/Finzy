import React, { useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useLocalStore } from '@/lib/localStore';
import { MOCK_PEOPLE } from '@/lib/mockEntities';
import { RarityBadge, rarityColor } from '@/components/rip/RarityBadge';

export default function CollectionScreen() {
  const theme = useTheme();
  const collection = useLocalStore((s) => s.collection);

  const roster = useMemo(() => Object.values(MOCK_PEOPLE), []);
  const collectedCount = useMemo(() => roster.filter((p) => collection[p.slug]).length, [roster, collection]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={[styles.progress, { color: theme.colors.textSecondary }]}>
          {collectedCount} / {roster.length} collected
        </Text>
      </View>

      <FlatList
        data={roster}
        keyExtractor={(item) => item.slug}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const owned = collection[item.slug];
          return (
            <Pressable
              style={[
                styles.card,
                {
                  backgroundColor: owned ? theme.colors.cardBackground : theme.colors.surface,
                  borderColor: owned ? rarityColor(item.rarity) : theme.colors.border,
                },
              ]}
              disabled={!owned}
              onPress={() => owned && router.push(`/person/${item.slug}`)}
              accessibilityRole="button"
              accessibilityLabel={owned ? item.name : 'Locked card'}
            >
              {owned && (item.portraitAsset || item.portraitUrl) ? (
                <Image
                  source={item.portraitAsset ?? { uri: item.portraitUrl ?? undefined }}
                  style={styles.portrait}
                  contentFit="cover"
                />
              ) : (
                <Ionicons
                  name={owned ? 'person-circle' : 'help-circle-outline'}
                  size={48}
                  color={owned ? '#93C5FD' : theme.colors.textSecondary}
                />
              )}
              <Text style={[styles.name, { color: owned ? '#fff' : theme.colors.textSecondary }]} numberOfLines={1}>
                {owned ? item.name : '???'}
              </Text>
              {owned ? (
                <>
                  <RarityBadge rarity={item.rarity} size="sm" />
                  {owned.count > 1 ? <Text style={styles.dupCount}>×{owned.count}</Text> : null}
                </>
              ) : (
                <Text style={[styles.lockedText, { color: theme.colors.textSecondary }]}>Locked</Text>
              )}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  progress: { fontSize: 13, fontWeight: '600' },
  grid: { padding: 20, gap: 12 },
  card: { flex: 1, borderRadius: 18, borderWidth: 1.5, padding: 16, alignItems: 'center', gap: 6, minHeight: 150, justifyContent: 'center' },
  portrait: { width: 58, height: 58, borderRadius: 29, borderWidth: 1.5, borderColor: '#93C5FD' },
  name: { fontSize: 13.5, fontWeight: '700', maxWidth: '100%' },
  dupCount: { color: '#93C5FD', fontSize: 11, fontWeight: '700', marginTop: 2 },
  lockedText: { fontSize: 11, fontWeight: '600' },
});
