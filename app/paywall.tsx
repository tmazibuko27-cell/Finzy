import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/components/ThemeProvider';
import { usePro } from '@/features/pro/ProProvider';
import { useLocalStore } from '@/lib/localStore';
import { getProOfferings, purchaseProPackage, restorePurchases, isPurchasesConfigured } from '@/lib/purchases';

const PERKS = [
  { icon: 'snow-outline' as const, title: 'Unlimited streak freezes', body: 'Never lose a streak to one missed day.' },
  { icon: 'stats-chart-outline' as const, title: 'Mastery insights', body: 'Full topic-by-topic breakdown of strengths and gaps.' },
  { icon: 'ribbon-outline' as const, title: 'Pro badge', body: 'A small mark of support on your profile.' },
];

export default function PaywallScreen() {
  const theme = useTheme();
  const { isPro } = usePro();
  const setIsPro = useLocalStore((s) => s.setIsPro);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!isPurchasesConfigured) {
      Alert.alert('Not available yet', 'Finzy Pro purchases aren’t configured in this build.');
      return;
    }
    setLoading(true);
    try {
      const offering = await getProOfferings();
      const pkg = offering?.availablePackages?.[0];
      if (!pkg) {
        Alert.alert('Unavailable', 'No Pro package is configured right now.');
        return;
      }
      const success = await purchaseProPackage(pkg);
      setIsPro(success);
      if (success) router.back();
    } catch (err: any) {
      if (!err?.userCancelled) Alert.alert('Purchase failed', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const restored = await restorePurchases();
      setIsPro(restored);
      Alert.alert(restored ? 'Restored' : 'Nothing to restore', restored ? 'Finzy Pro is active.' : 'No previous purchase found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#0B1220', '#172554', '#1E3A8A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close" hitSlop={12}>
            <Ionicons name="close" size={26} color="#fff" />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Finzy Pro</Text>
          <Text style={styles.subtitle}>
            Learning stays free, forever. Pro is just a way to support Finzy and unlock a few extras.
          </Text>

          {isPro ? (
            <View style={styles.activeBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#4ADE80" />
              <Text style={styles.activeText}>You're a Finzy Pro member</Text>
            </View>
          ) : (
            <>
              <View style={styles.perks}>
                {PERKS.map((perk) => (
                  <View key={perk.title} style={styles.perkRow}>
                    <Ionicons name={perk.icon} size={22} color="#93C5FD" />
                    <View style={styles.perkText}>
                      <Text style={styles.perkTitle}>{perk.title}</Text>
                      <Text style={styles.perkBody}>{perk.body}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <Pressable
                style={[styles.purchaseButton, { backgroundColor: theme.colors.action }]}
                onPress={handlePurchase}
                disabled={loading}
                accessibilityRole="button"
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.purchaseButtonText}>Continue — $4.99/month</Text>}
              </Pressable>

              <Text style={styles.legalNote}>
                Auto-renews monthly until canceled. Manage or cancel anytime in your App Store account settings.
              </Text>

              <Pressable onPress={handleRestore} disabled={loading} accessibilityRole="button">
                <Text style={styles.restoreLink}>Restore purchases</Text>
              </Pressable>
            </>
          )}

          <View style={styles.legalLinks}>
            <Pressable onPress={() => Linking.openURL('https://example.com/finzy/terms')}>
              <Text style={styles.legalLink}>Terms of Use</Text>
            </Pressable>
            <Text style={styles.legalDot}>·</Text>
            <Pressable onPress={() => Linking.openURL('https://example.com/finzy/privacy')}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { paddingHorizontal: 20, paddingTop: 8 },
  content: { padding: 24, paddingTop: 12, gap: 16 },
  title: { color: '#fff', fontSize: 30, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 21 },
  perks: { gap: 16, marginTop: 8 },
  perkRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  perkText: { flex: 1 },
  perkTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  perkBody: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
  purchaseButton: { borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  purchaseButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  legalNote: { color: 'rgba(255,255,255,0.55)', fontSize: 12, textAlign: 'center', lineHeight: 17 },
  restoreLink: { color: '#93C5FD', fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 4 },
  activeBadge: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: 'rgba(74,222,128,0.15)', padding: 14, borderRadius: 14 },
  activeText: { color: '#4ADE80', fontWeight: '700' },
  legalLinks: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 24 },
  legalLink: { color: 'rgba(255,255,255,0.6)', fontSize: 12, textDecorationLine: 'underline' },
  legalDot: { color: 'rgba(255,255,255,0.4)' },
});
