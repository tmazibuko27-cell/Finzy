import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions, Share } from 'react-native';
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
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowRule} />
            <Text style={styles.eyebrow}>{card.eyebrow ?? TYPE_LABEL[card.type]}</Text>
          </View>
          <Text style={styles.difficulty}>{DIFFICULTY_LABEL[card.difficulty]} · {card.estimatedSeconds}s</Text>
        </View>

        {card.storySequence && card.storyTotal ? (
          <Text style={styles.progress}>
            {card.storySequence}/{card.storyTotal}
          </Text>
        ) : null}

        <Text style={styles.typeLabel}>{TYPE_LABEL[card.type]}</Text>
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
  container: { width: '100%', backgroundColor: '#102A43' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 92, paddingRight: 92, justifyContent: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyebrowRule: { width: 20, height: 2, backgroundColor: '#8BE0C2' },
  eyebrow: { color: '#B7F0D8', fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  difficulty: { color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: '600' },
  progress: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4, fontWeight: '600' },
  typeLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 32 },
  hook: { color: '#fff', fontSize: 31, fontWeight: '800', lineHeight: 37, marginTop: 10, maxWidth: 580 },
  image: { width: '100%', height: 160, borderRadius: 8, marginTop: 16 },
  body: { color: 'rgba(255,255,255,0.78)', fontSize: 16, lineHeight: 25, marginTop: 18, maxWidth: 560 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  chip: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  chipText: { color: '#D8F8E9', fontSize: 12, fontWeight: '700' },
  sourcesRow: { marginTop: 20 },
  sourcesText: { color: '#B7F0D8', fontSize: 13, fontWeight: '700' },
});
