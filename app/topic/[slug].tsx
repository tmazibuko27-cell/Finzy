import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { EmptyState } from '@/components/ui/EmptyState';
import { MOCK_TOPICS } from '@/lib/mockEntities';
import { useLocalStore } from '@/lib/localStore';

export default function TopicDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const theme = useTheme();
  const topic = slug ? MOCK_TOPICS[slug] : undefined;

  const followed = useLocalStore((s) => s.followedTopicSlugs);
  const toggleFollow = useLocalStore((s) => s.toggleFollow);
  const isFollowing = topic ? followed.has(topic.slug) : false;

  if (!topic) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <EmptyState icon="pricetag-outline" title="Topic not available yet" message="This topic hasn't been published to Finzy yet." />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.category, { color: theme.colors.action }]}>{topic.category}</Text>
      <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{topic.name}</Text>
      <Text style={[styles.description, { color: theme.colors.textPrimary }]}>{topic.description}</Text>

      <Pressable
        style={[styles.followButton, { backgroundColor: isFollowing ? theme.colors.surface : theme.colors.action, borderColor: theme.colors.border }]}
        onPress={() => toggleFollow(topic.slug)}
        accessibilityRole="button"
      >
        <Text style={{ color: isFollowing ? theme.colors.textPrimary : '#fff', fontWeight: '700' }}>
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 10 },
  category: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { fontSize: 26, fontWeight: '800' },
  description: { fontSize: 15, lineHeight: 22 },
  followButton: { alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, borderWidth: 1, marginTop: 8 },
});
