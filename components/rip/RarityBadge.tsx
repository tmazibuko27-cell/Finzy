import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { CardRarity } from '@/types/content';

const RARITY_STYLE: Record<CardRarity, { label: string; bg: string; fg: string }> = {
  common: { label: 'Common', bg: '#334155', fg: '#E2E8F0' },
  rare: { label: 'Rare', bg: '#1D4ED8', fg: '#DBEAFE' },
  epic: { label: 'Epic', bg: '#7C3AED', fg: '#EDE9FE' },
  legendary: { label: 'Legendary', bg: '#B45309', fg: '#FEF3C7' },
};

export function RarityBadge({ rarity, size = 'md' }: { rarity: CardRarity; size?: 'sm' | 'md' }) {
  const style = RARITY_STYLE[rarity];
  const small = size === 'sm';
  return (
    <View style={[styles.badge, { backgroundColor: style.bg, paddingHorizontal: small ? 8 : 11, paddingVertical: small ? 3 : 5 }]}>
      <Text style={[styles.text, { color: style.fg, fontSize: small ? 10 : 12 }]}>{style.label}</Text>
    </View>
  );
}

export function rarityColor(rarity: CardRarity): string {
  return RARITY_STYLE[rarity].bg;
}

const styles = StyleSheet.create({
  badge: { borderRadius: 999, alignSelf: 'flex-start' },
  text: { fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
});
