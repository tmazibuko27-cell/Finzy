import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PackRipper } from '@/components/rip/PackRipper';
import { getPackBalance, claimDailyPack } from '@/features/pack/api';

export default function CollectibleScreen() {
  const [balance, setBalance] = useState<number | null>(null);
  const [dailyClaimed, setDailyClaimed] = useState(false);

  const refresh = useCallback(async () => {
    const [bal, daily] = await Promise.all([getPackBalance(), claimDailyPack()]);
    setDailyClaimed(daily.claimed);
    setBalance(daily.claimed ? daily.balance : bal);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#0B1220', '#111A2E', '#1E3A8A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Collectibles</Text>
            <Text style={styles.subtitle}>Open a pack, meet a CEO or investor.</Text>
          </View>

          {dailyClaimed ? (
            <View style={styles.dailyBanner}>
              <Ionicons name="gift" size={16} color="#4ADE80" />
              <Text style={styles.dailyBannerText}>Your free daily pack was added</Text>
            </View>
          ) : null}

          <View style={styles.balanceRow}>
            <Ionicons name="albums" size={18} color="#93C5FD" />
            <Text style={styles.balanceText}>{balance ?? '—'} pack{balance === 1 ? '' : 's'} available</Text>
          </View>

          <PackRipper
            balance={balance ?? 0}
            onOpened={() => refresh()}
            previewPerson={{
              id: 'warren-buffett',
              name: 'Warren Buffett',
              slug: 'warren-buffett',
              descriptor: 'Chairman and CEO of Berkshire Hathaway',
              business: 'Berkshire Hathaway',
              education: 'Columbia Business School',
              netWorth: '$150B+',
              power: 98,
              portraitAsset: require('../../assets/images/collectibles/image.png'),
            }}
          />

          <View style={styles.linkRow}>
            <Pressable onPress={() => router.push('/rip/buy-packs')} accessibilityRole="button">
              <Text style={styles.link}>Get more packs</Text>
            </Pressable>
            <Text style={styles.dot}>·</Text>
            <Pressable onPress={() => router.push('/rip/collection')} accessibilityRole="button">
              <Text style={styles.link}>Your collection</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, alignItems: 'center', gap: 20, paddingTop: 8, paddingBottom: 48 },
  header: { alignItems: 'center', gap: 4 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  dailyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  dailyBannerText: { color: '#4ADE80', fontSize: 12.5, fontWeight: '600' },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  balanceText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  link: { color: '#60A5FA', fontSize: 13.5, fontWeight: '600' },
  dot: { color: 'rgba(255,255,255,0.4)' },
});
