import React, { useCallback, useMemo } from 'react';
import { View, FlatList, StyleSheet, Text, useWindowDimensions, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ViewToken } from 'react-native';
import { useFeed } from '@/features/feed/useFeed';
import { FeedCardView } from '@/components/feed/FeedCardView';
import { CardSkeleton } from '@/components/feed/CardSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useTheme } from '@/components/ThemeProvider';
import type { FeedCard } from '@/types/content';
import { useLocalStore } from '@/lib/localStore';

const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 80 };

export default function ForYouScreen() {
  const { height } = useWindowDimensions();
  const theme = useTheme();
  const markCardSeen = useLocalStore((s) => s.markCardSeen);
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed();

  const cards = useMemo<FeedCard[]>(() => data?.pages.flatMap((p) => p.cards) ?? [], [data]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    viewableItems.forEach(({ item }) => {
      const card = item as FeedCard;
      if (card?.id) markCardSeen(card.id);
    });
  }, [markCardSeen]);

  const handleReport = useCallback((cardId: string) => {
    Alert.alert('Report this card', 'What is the issue?', [
      { text: 'Factually incorrect', onPress: () => {} },
      { text: 'Outdated', onPress: () => {} },
      { text: 'Inappropriate', onPress: () => {} },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.cardBackground }}>
        <CardSkeleton />
      </View>
    );
  }

  if (isError && cards.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ErrorState
          title="Feed unavailable"
          message="We couldn't load new cards. Check your connection and try again."
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0B1220' }}>
      <View pointerEvents="none" style={styles.topOverlay}>
        <Text style={styles.wordmark}>Finzy</Text>
      </View>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedCardView card={item} onReport={handleReport} />}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
        viewabilityConfig={VIEWABILITY_CONFIG}
        onViewableItemsChanged={onViewableItemsChanged}
        onEndReachedThreshold={0.6}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ marginVertical: 24 }} color="#fff" /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topOverlay: { position: 'absolute', top: 56, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  wordmark: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});
