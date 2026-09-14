import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Switch, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePro } from '@/features/pro/ProProvider';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
  const theme = useTheme();
  const { isGuest, signOut } = useAuth();
  const { isPro } = usePro();

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This permanently deletes your account and progress. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Deletion runs through an Edge Function using the service-role
            // key — a client can never delete auth.users directly.
            if (supabase) {
              await supabase.rpc('request_account_deletion');
              await supabase.functions.invoke('delete-account');
            }
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={styles.scroll}>
      <Section title="Finzy Pro" theme={theme}>
        {isPro ? (
          <View style={styles.row}>
            <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>You're subscribed</Text>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
          </View>
        ) : (
          <NavRow icon="star-outline" label="Upgrade to Finzy Pro" onPress={() => router.push('/paywall')} theme={theme} />
        )}
        <View style={[styles.row, { borderColor: theme.colors.border }]}>
          <Text style={{ color: theme.colors.textPrimary }}>Streak freeze</Text>
          <Switch value={isPro} disabled={!isPro} onValueChange={() => {}} />
        </View>
      </Section>

      <Section title="Notifications" theme={theme}>
        <RowSwitch label="Daily learning reminder" theme={theme} />
        <RowSwitch label="Streak reminder" theme={theme} />
      </Section>

      <Section title="Legal" theme={theme}>
        <NavRow icon="document-text-outline" label="Terms of Use" onPress={() => Linking.openURL('https://example.com/finzy/terms')} theme={theme} />
        <NavRow icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => Linking.openURL('https://example.com/finzy/privacy')} theme={theme} />
        <NavRow icon="alert-circle-outline" label="Educational Disclaimer" onPress={() => Linking.openURL('https://example.com/finzy/disclaimer')} theme={theme} />
      </Section>

      <Section title="Support" theme={theme}>
        <NavRow icon="flag-outline" label="Report a bug" onPress={() => Linking.openURL('mailto:support@example.com')} theme={theme} />
        <NavRow icon="mail-outline" label="Contact support" onPress={() => Linking.openURL('mailto:support@example.com')} theme={theme} />
      </Section>

      <Section title="Account" theme={theme}>
        {!isGuest ? <NavRow icon="log-out-outline" label="Log out" onPress={signOut} theme={theme} /> : null}
        <NavRow icon="trash-outline" label="Delete account" onPress={confirmDeleteAccount} theme={theme} danger />
      </Section>

      <Text style={[styles.version, { color: theme.colors.textSecondary }]}>Finzy · v1.0.0 (MVP)</Text>
    </ScrollView>
  );
}

function Section({ title, theme, children }: { title: string; theme: ReturnType<typeof useTheme>; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
      <View style={[styles.sectionBody, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>{children}</View>
    </View>
  );
}

function RowSwitch({ label, theme }: { label: string; theme: ReturnType<typeof useTheme> }) {
  const [value, setValue] = React.useState(true);
  return (
    <View style={[styles.row, { borderColor: theme.colors.border }]}>
      <Text style={{ color: theme.colors.textPrimary }}>{label}</Text>
      <Switch value={value} onValueChange={setValue} />
    </View>
  );
}

function NavRow({
  icon,
  label,
  onPress,
  theme,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
  danger?: boolean;
}) {
  return (
    <Pressable style={[styles.row, { borderColor: theme.colors.border }]} onPress={onPress} accessibilityRole="button">
      <View style={styles.navRowLeft}>
        <Ionicons name={icon} size={18} color={danger ? theme.colors.error : theme.colors.textSecondary} />
        <Text style={{ color: danger ? theme.colors.error : theme.colors.textPrimary }}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 22 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionBody: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  navRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  version: { textAlign: 'center', fontSize: 12, marginTop: 8 },
});
