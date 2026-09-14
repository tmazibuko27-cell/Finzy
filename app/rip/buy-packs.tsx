import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/ThemeProvider';
import { PACK_ODDS } from '@/features/pack/api';
import { PACK_BUNDLE_PRODUCT_IDS, purchasePackBundle, isPurchasesConfigured } from '@/lib/purchases';
import { RarityBadge } from '@/components/rip/RarityBadge';
import type { CardRarity } from '@/types/content';

const BUNDLES = [
  { productId: PACK_BUNDLE_PRODUCT_IDS.packs_1, label: '1 Pack', price: '$1.99' },
  { productId: PACK_BUNDLE_PRODUCT_IDS.packs_5, label: '5 Packs', price: '$7.99', badge: 'Popular' },
  { productId: PACK_BUNDLE_PRODUCT_IDS.packs_15, label: '15 Packs', price: '$19.99', badge: 'Best value' },
];

const ODDS_ORDER: CardRarity[] = ['legendary', 'epic', 'rare', 'common'];

export default function BuyPacksScreen() {
  const theme = useTheme();
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const handleBuy = async (productId: string) => {
    if (!isPurchasesConfigured) {
      Alert.alert('Not available yet', 'Pack purchases aren’t configured in this build.');
      return;
    }
    setPurchasingId(productId);
    try {
      await purchasePackBundle(productId);
      Alert.alert('Purchase started', 'Your packs will appear once the purchase finishes processing.');
    } catch (err: any) {
      if (!err?.userCancelled) Alert.alert('Purchase failed', 'Please try again.');
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Get more packs</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          You also get 1 free pack every day just for opening Finzy, plus bonus packs at streak milestones.
        </Text>

        <View style={styles.bundleList}>
          {BUNDLES.map((bundle) => (
            <View key={bundle.productId} style={[styles.bundleCard, { backgroundColor: theme.colors.cardBackground }]}>
              {bundle.badge ? (
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>{bundle.badge}</Text>
                </View>
              ) : null}
              <Ionicons name="albums" size={22} color="#93C5FD" />
              <Text style={styles.bundleLabel}>{bundle.label}</Text>
              <Text style={styles.bundlePrice}>{bundle.price}</Text>
              <Pressable
                style={styles.buyButton}
                onPress={() => handleBuy(bundle.productId)}
                disabled={purchasingId !== null}
                accessibilityRole="button"
              >
                {purchasingId === bundle.productId ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buyButtonText}>Buy</Text>
                )}
              </Pressable>
            </View>
          ))}
        </View>

        <View style={[styles.oddsCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.oddsTitle, { color: theme.colors.textPrimary }]}>Drop rates</Text>
          <Text style={[styles.oddsSubtitle, { color: theme.colors.textSecondary }]}>
            Every pack — free or purchased — uses these exact odds, rolled on our server.
          </Text>
          {ODDS_ORDER.map((rarity) => (
            <View key={rarity} style={styles.oddsRow}>
              <RarityBadge rarity={rarity} size="sm" />
              <Text style={[styles.oddsPercent, { color: theme.colors.textPrimary }]}>
                {(PACK_ODDS[rarity] * 100).toFixed(0)}%
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.legal, { color: theme.colors.textSecondary }]}>
          Packs are consumable in-app purchases, not subscriptions — no auto-renewal. Cards are cosmetic and
          educational; they don't affect your XP, streak, or learning progress.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 20, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13.5, lineHeight: 19 },
  bundleList: { flexDirection: 'row', gap: 10 },
  bundleCard: { flex: 1, borderRadius: 18, padding: 14, alignItems: 'center', gap: 6, position: 'relative' },
  badgePill: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#2563EB',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgePillText: { color: '#fff', fontSize: 9.5, fontWeight: '800', textTransform: 'uppercase' },
  bundleLabel: { color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 6 },
  bundlePrice: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  buyButton: { backgroundColor: '#2563EB', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 8, marginTop: 4, minWidth: 64, alignItems: 'center' },
  buyButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  oddsCard: { borderRadius: 18, borderWidth: 1, padding: 18, gap: 10 },
  oddsTitle: { fontSize: 15, fontWeight: '700' },
  oddsSubtitle: { fontSize: 12.5, lineHeight: 17, marginBottom: 4 },
  oddsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  oddsPercent: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  legal: { fontSize: 11.5, lineHeight: 16, textAlign: 'center' },
});
