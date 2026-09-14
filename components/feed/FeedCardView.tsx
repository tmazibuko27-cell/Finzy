import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { FeedCard } from '@/types/content';
import { ActionRail } from './ActionRail';
import { QuizBlock } from '@/components/quiz/QuizBlock';
import { useLocalStore } from '@/lib/localStore';

const TYPE_LABEL: Record<FeedCard['type'], string> = {
  fact: 'Fast fact',
  story: 'Story',
  person: 'People',
  company: 'Company',
  concept: 'Concept',
  history: 'History',
  quiz: 'Quiz',
  comparison: 'Compare',
};

const DIFFICULTY_LABEL = ['', 'Easy', 'Medium', 'Advanced'];

export function FeedCardView({ card, onReport }: { card: FeedCard; onReport: (cardId: string) => void }) {
  const { height } = useWindowDimensions();
  const [expanded, setExpanded] = useState(false);

  const savedIds = useLocalStore((s) => s.savedCardIds);
  const followed = useLocalStore((s) => s.followedTopicSlugs);
  const toggleSaved = useLocalStore((s) => s.toggleSaved);
  const toggleFollow = useLocalStore((s) => s.toggleFollow);

  const isSaved = savedIds.has(card.id);
  const primaryTopic = card.entities.find((e) => e.type === 'topic') ?? card.entities[0];
  const isFollowing = primaryTopic ? followed.has(primaryTopic.slug) : false;

  const handleShare = () => {
    Share.share({
      message: `${card.hook}\n\nLearn more on Finzy: finzy://card/${card.id}`,
    }).catch(() => {});
  };

  const openEntity = (entity: FeedCard['entities'][number]) => {
    router.push(`/${entity.type}/${entity.slug}` as never);
  };

  return (
    <View style={[styles.container, { height }]}>
      <LinearGradient colors={['#0B1220', '#172554', '#1E3A8A']} style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.eyebrow}>{card.eyebrow ?? TYPE_LABEL[card.type]}</Text>
          <Text style={styles.difficulty}>{DIFFICULTY_LABEL[card.difficulty]}</Text>
        </View>

        {card.storySequence && card.storyTotal ? (
          <Text style={styles.progress}>
            {card.storySequence}/{card.storyTotal}
          </Text>
        ) : null}

        <Text style={styles.hook}>{card.hook}</Text>

        {card.imageUrl ? (
          <Image source={{ uri: card.imageUrl }} style={styles.image} contentFit="cover" transition={150} />
        ) : null}

        <Pressable onPress={() => setExpanded((v) => !v)} accessibilityRole="button">
          <Text style={styles.body} numberOfLines={expanded ? undefined : 6}>
            {card.body}
          </Text>
        </Pressable>

        {card.entities.length > 0 ? (
          <View style={styles.chipRow}>
            {card.entities.map((entity) => (
              <Pressable
                key={`${entity.type}-${entity.slug}`}
                style={styles.chip}
                onPress={() => openEntity(entity)}
                accessibilityRole="button"
                accessibilityLabel={entity.name}
              >
                <Text style={styles.chipText}>{entity.name}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {card.quiz ? <QuizBlock quiz={card.quiz} /> : null}

        {card.sourceCount > 0 ? (
          <Pressable
            style={styles.sourcesRow}
            onPress={() => router.push(`/card/${card.id}` as never)}
            accessibilityRole="button"
          >
            <Text style={styles.sourcesText}>
              Sources ({card.sourceCount})
            </Text>
          </Pressable>
        ) : null}
      </View>

      <ActionRail
        isSaved={isSaved}
        isFollowing={isFollowing}
        onToggleSave={() => toggleSaved(card.id)}
        onToggleFollow={() => primaryTopic && toggleFollow(primaryTopic.slug)}
        onShare={handleShare}
        onNotInterested={() => {}}
        onReport={() => onReport(card.id)}
        onViewSources={() => router.push(`/card/${card.id}` as never)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 90, paddingRight: 90 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { color: '#93C5FD', fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  difficulty: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600' },
  progress: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4, fontWeight: '600' },
  hook: { color: '#fff', fontSize: 24, fontWeight: '700', lineHeight: 30, marginTop: 14 },
  image: { width: '100%', height: 160, borderRadius: 16, marginTop: 16 },
  body: { color: 'rgba(255,255,255,0.9)', fontSize: 16, lineHeight: 23, marginTop: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)' },
  chipText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  sourcesRow: { marginTop: 20 },
  sourcesText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, textDecorationLine: 'underline' },
});
