import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePro } from '@/features/pro/ProProvider';
import { useLocalStore } from '@/lib/localStore';

export default function ProfileScreen() {
  const theme = useTheme();
  const { isGuest, signOut } = useAuth();
  const { isPro } = usePro();
  const guestXp = useLocalStore((s) => s.guestXp);
  const packBalance = useLocalStore((s) => s.packBalance);
  const collectedCount = useLocalStore((s) => Object.keys(s.collection).length);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.identityRow}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.action }]}>
            <Ionicons name="person" size={28} color="#fff" />
          </View>
          <View>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: theme.colors.textPrimary }]}>
                {isGuest ? 'Guest learner' : 'Themba'}
              </Text>
              {isPro ? (
                <View style={[styles.proBadge, { backgroundColor: theme.colors.action }]}>
                  <Ionicons name="star" size={11} color="#fff" />
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              ) : null}
            </View>
            {isGuest ? (
              <Pressable onPress={() => router.push('/(auth)/sign-in' as never)} accessibilityRole="button">
                <Text style={[styles.link, { color: theme.colors.action }]}>Sign in to save your progress</Text>
              </Pressable>
            ) : (
              <Text style={{ color: theme.colors.textSecondary }}>@themba_m</Text>
            )}
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatTile label="Level" value="1" theme={theme} />
          <StatTile label="Total XP" value={String(guestXp)} theme={theme} />
          <StatTile label="Streak" value="0" theme={theme} />
        </View>

        <Section title="Learning" theme={theme}>
          <RowItem label="Quiz accuracy" value="—" theme={theme} />
          <RowItem label="Cards completed" value="—" theme={theme} />
          <RowItem label="Topics studied" value="—" theme={theme} />
        </Section>

        <Pressable
          style={[styles.upgradeCard, { backgroundColor: '#172554' }]}
          onPress={() => router.push('/rip')}
          accessibilityRole="button"
        >
          <Ionicons name="albums" size={20} color="#93C5FD" />
          <View style={{ flex: 1 }}>
            <Text style={styles.upgradeTitle}>Rip It</Text>
            <Text style={styles.upgradeSubtitle}>
              {packBalance} pack{packBalance === 1 ? '' : 's'} available · {collectedCount} collected
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
        </Pressable>

        {!isPro ? (
          <Pressable
            style={[styles.upgradeCard, { backgroundColor: theme.colors.cardBackground }]}
            onPress={() => router.push('/paywall')}
            accessibilityRole="button"
          >
            <Ionicons name="star" size={20} color="#FDE047" />
            <View style={{ flex: 1 }}>
              <Text style={styles.upgradeTitle}>Go Finzy Pro</Text>
              <Text style={styles.upgradeSubtitle}>Unlimited streak freezes + full mastery insights</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>
        ) : null}

        <Section title="Settings" theme={theme}>
          <NavRow icon="settings-outline" label="Account & preferences" onPress={() => router.push('/settings' as never)} theme={theme} />
          <NavRow icon="notifications-outline" label="Notifications" onPress={() => router.push('/settings' as never)} theme={theme} />
          <NavRow icon="document-text-outline" label="Legal & disclaimer" onPress={() => router.push('/settings' as never)} theme={theme} />
        </Section>

        {!isGuest ? (
          <Pressable style={styles.signOut} onPress={signOut} accessibilityRole="button">
            <Text style={{ color: theme.colors.error, fontWeight: '600' }}>Log out</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatTile({ label, value, theme }: { label: string; value: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={[styles.statTile, { backgroundColor: theme.colors.cardBackground }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Section({ title, theme, children }: { title: string; theme: ReturnType<typeof useTheme>; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
      <View style={[styles.sectionBody, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        {children}
      </View>
    </View>
  );
}

function RowItem({ label, value, theme }: { label: string; value: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={[styles.row, { borderColor: theme.colors.border }]}>
      <Text style={{ color: theme.colors.textPrimary }}>{label}</Text>
      <Text style={{ color: theme.colors.textSecondary }}>{value}</Text>
    </View>
  );
}

function NavRow({
  icon,
  label,
  onPress,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <Pressable style={[styles.row, { borderColor: theme.colors.border }]} onPress={onPress} accessibilityRole="button">
      <View style={styles.navRowLeft}>
        <Ionicons name={icon} size={18} color={theme.colors.textSecondary} />
        <Text style={{ color: theme.colors.textPrimary }}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 24 },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 20, fontWeight: '700' },
  proBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  proBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  upgradeCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 16 },
  upgradeTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  upgradeSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  link: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statTile: { flex: 1, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 20, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionBody: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  navRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  signOut: { alignItems: 'center', paddingVertical: 12 },
});
