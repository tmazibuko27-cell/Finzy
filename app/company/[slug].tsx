import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { EmptyState } from '@/components/ui/EmptyState';
import { MOCK_COMPANIES } from '@/lib/mockEntities';
import { useLocalStore } from '@/lib/localStore';

export default function CompanyDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const theme = useTheme();
  const company = slug ? MOCK_COMPANIES[slug] : undefined;

  const followed = useLocalStore((s) => s.followedTopicSlugs);
  const toggleFollow = useLocalStore((s) => s.toggleFollow);
  const isFollowing = company ? followed.has(company.slug) : false;

  if (!company) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <EmptyState icon="business-outline" title="Company not available yet" message="This company hasn't been published to Finzy yet." />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{company.name}</Text>
        {company.ticker ? <Text style={[styles.ticker, { color: theme.colors.action }]}>{company.ticker}</Text> : null}
      </View>
      <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
        {company.industry} · Founded {company.foundingYear} · {company.headquarters}
      </Text>
      <Text style={[styles.description, { color: theme.colors.textPrimary }]}>{company.description}</Text>

      <Pressable
        style={[styles.followButton, { backgroundColor: isFollowing ? theme.colors.surface : theme.colors.action, borderColor: theme.colors.border }]}
        onPress={() => toggleFollow(company.slug)}
        accessibilityRole="button"
      >
        <Text style={{ color: isFollowing ? theme.colors.textPrimary : '#fff', fontWeight: '700' }}>
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      </Pressable>

      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>How it makes money</Text>
      <Text style={[styles.description, { color: theme.colors.textPrimary }]}>{company.howItMakesMoney}</Text>

      {company.timeline.length > 0 ? (
        <>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Timeline</Text>
          {company.timeline.map((item, i) => (
            <View key={i} style={styles.timelineRow}>
              <Text style={[styles.timelineYear, { color: theme.colors.action }]}>{item.year}</Text>
              <Text style={[styles.timelineText, { color: theme.colors.textPrimary }]}>{item.text}</Text>
            </View>
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { fontSize: 26, fontWeight: '800' },
  ticker: { fontSize: 15, fontWeight: '700' },
  meta: { fontSize: 13 },
  description: { fontSize: 15, lineHeight: 22 },
  followButton: { alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, borderWidth: 1, marginTop: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12 },
  timelineRow: { flexDirection: 'row', gap: 12 },
  timelineYear: { fontWeight: '700', width: 48 },
  timelineText: { flex: 1, lineHeight: 20 },
});
