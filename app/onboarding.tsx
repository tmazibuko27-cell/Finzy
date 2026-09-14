import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useLocalStore } from '@/lib/localStore';
import type { ExperienceLevel, UserGoal } from '@/types/content';

const INTERESTS = [
  'CEOs', 'Billionaires', 'Company Stories', 'Stocks', 'Investing',
  'Economics', 'Financial History', 'Accounting', 'Personal Finance', 'Careers',
];

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'some_knowledge', label: 'Some knowledge' },
  { value: 'professional', label: 'Finance student or professional' },
];

const GOAL_OPTIONS: { value: UserGoal; label: string }[] = [
  { value: 'casual', label: 'Learn casually' },
  { value: 'markets', label: 'Understand markets' },
  { value: 'career', label: 'Prepare for finance career' },
  { value: 'investing', label: 'Build investing knowledge' },
];

const MIN_INTERESTS = 3;

export default function OnboardingScreen() {
  const theme = useTheme();
  const completeOnboarding = useLocalStore((s) => s.completeOnboarding);

  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);
  const [goal, setGoal] = useState<UserGoal | null>(null);

  const toggleInterest = (label: string) => {
    setInterests((prev) => (prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]));
  };

  const canProceed = step === 0 ? interests.length >= MIN_INTERESTS : step === 1 ? !!experience : true;

  const finish = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') await Notifications.requestPermissionsAsync();
    } catch {
      // Permission prompt is best-effort; onboarding should not block on it.
    }
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.progressRow}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.progressDot, { backgroundColor: i <= step ? theme.colors.action : theme.colors.border }]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 0 && (
          <>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>What do you want to learn?</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Choose at least {MIN_INTERESTS}.</Text>
            <View style={styles.chipWrap}>
              {INTERESTS.map((label) => {
                const active = interests.includes(label);
                return (
                  <Pressable
                    key={label}
                    onPress={() => toggleInterest(label)}
                    style={[
                      styles.chip,
                      { borderColor: theme.colors.border, backgroundColor: active ? theme.colors.action : theme.colors.surface },
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={{ color: active ? '#fff' : theme.colors.textPrimary, fontWeight: '600' }}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>What's your experience level?</Text>
            <View style={{ gap: 10, marginTop: 8 }}>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <OptionRow key={opt.value} label={opt.label} active={experience === opt.value} onPress={() => setExperience(opt.value)} theme={theme} />
              ))}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>What's your goal?</Text>
            <View style={{ gap: 10, marginTop: 8 }}>
              {GOAL_OPTIONS.map((opt) => (
                <OptionRow key={opt.value} label={opt.label} active={goal === opt.value} onPress={() => setGoal(opt.value)} theme={theme} />
              ))}
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Stay on track</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              We'll send a gentle daily reminder and a streak nudge — never price alerts or pressure. You can turn
              this off anytime in Settings.
            </Text>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.primaryButton, { backgroundColor: canProceed ? theme.colors.action : theme.colors.border }]}
          disabled={!canProceed}
          onPress={() => (step < 3 ? setStep((s) => s + 1) : finish())}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>{step < 3 ? 'Continue' : 'Start learning'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function OptionRow({ label, active, onPress, theme }: { label: string; active: boolean; onPress: () => void; theme: ReturnType<typeof useTheme> }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.optionRow, { borderColor: active ? theme.colors.action : theme.colors.border, backgroundColor: theme.colors.surface }]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  progressRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 24, paddingTop: 12 },
  progressDot: { flex: 1, height: 4, borderRadius: 2 },
  content: { padding: 24, gap: 8 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 14, lineHeight: 20 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1.5 },
  optionRow: { borderWidth: 1.5, borderRadius: 14, padding: 16 },
  footer: { padding: 20 },
  primaryButton: { borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
