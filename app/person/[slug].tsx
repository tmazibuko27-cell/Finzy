import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { EmptyState } from '@/components/ui/EmptyState';
import { MOCK_PEOPLE } from '@/lib/mockEntities';
import { useLocalStore } from '@/lib/localStore';
import { RarityBadge } from '@/components/rip/RarityBadge';

export default function PersonDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const theme = useTheme();
  const person = slug ? MOCK_PEOPLE[slug] : undefined;

  const followed = useLocalStore((s) => s.followedTopicSlugs);
  const toggleFollow = useLocalStore((s) => s.toggleFollow);
  const isFollowing = person ? followed.has(person.slug) : false;

  if (!person) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <EmptyState icon="person-outline" title="Profile not available yet" message="This person hasn't been published to Finzy yet." />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{person.name}</Text>
      <Text style={[styles.descriptor, { color: theme.colors.textSecondary }]}>{person.descriptor}</Text>
      <RarityBadge rarity={person.rarity} />

      <View style={styles.roleRow}>
        {person.roles.map((role) => (
          <View key={role} style={[styles.roleChip, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={styles.roleText}>{role}</Text>
          </View>
        ))}
      </View>

      <Pressable
        style={[styles.followButton, { backgroundColor: isFollowing ? theme.colors.surface : theme.colors.action, borderColor: theme.colors.border }]}
        onPress={() => toggleFollow(person.slug)}
        accessibilityRole="button"
      >
        <Text style={{ color: isFollowing ? theme.colors.textPrimary : '#fff', fontWeight: '700' }}>
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      </Pressable>

      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Timeline</Text>
      {person.timeline.map((item, i) => (
        <View key={i} style={styles.timelineRow}>
          <Text style={[styles.timelineYear, { color: theme.colors.action }]}>{item.year}</Text>
          <Text style={[styles.timelineText, { color: theme.colors.textPrimary }]}>{item.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 12 },
  name: { fontSize: 26, fontWeight: '800' },
  descriptor: { fontSize: 15 },
  roleRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 4 },
  roleChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  roleText: { color: '#fff', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  followButton: { alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, borderWidth: 1, marginTop: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 16 },
  timelineRow: { flexDirection: 'row', gap: 12 },
  timelineYear: { fontWeight: '700', width: 48 },
  timelineText: { flex: 1, lineHeight: 20 },
});
