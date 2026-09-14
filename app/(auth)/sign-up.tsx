import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/features/auth/AuthProvider';
import { emailAuthSchema, type EmailAuthValues } from '@/features/auth/schema';
import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/env';
import { useLocalStore } from '@/lib/localStore';

export default function SignUpScreen() {
  const theme = useTheme();
  const { continueAsGuest } = useAuth();
  const guestXp = useLocalStore((s) => s.guestXp);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<EmailAuthValues>({
    resolver: zodResolver(emailAuthSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: EmailAuthValues) => {
    if (!supabase) {
      setServerError('Backend not configured yet — continuing in demo mode.');
      continueAsGuest();
      router.replace('/(tabs)');
      return;
    }
    setSubmitting(true);
    setServerError(null);
    // Guest XP (`guestXp`) should be merged into the new profile server-side
    // after signup succeeds — e.g. via a one-time RPC call keyed by device id.
    const { error, data } = await supabase.auth.signUp(values);
    setSubmitting(false);
    if (error) {
      setServerError(error.message);
      return;
    }
    if (data.session) {
      router.replace('/onboarding');
    } else {
      setCheckEmail(true);
    }
  };

  if (checkEmail) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', padding: 24 }}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Check your email</Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: 8 }}>
          We sent a verification link. Confirm it, then sign in.
        </Text>
        <Pressable style={[styles.primaryButton, { backgroundColor: theme.colors.action, marginTop: 20 }]} onPress={() => router.replace('/(auth)/sign-in')}>
          <Text style={styles.primaryButtonText}>Back to sign in</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Create your account</Text>
        {!isSupabaseConfigured ? (
          <Text style={[styles.notice, { color: theme.colors.warning }]}>Running in local demo mode.</Text>
        ) : guestXp > 0 ? (
          <Text style={[styles.notice, { color: theme.colors.textSecondary }]}>
            Your {guestXp} guest XP will carry over to your new account.
          </Text>
        ) : null}

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Email"
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
              accessibilityLabel="Email"
            />
          )}
        />
        {errors.email ? <Text style={styles.error}>{errors.email.message}</Text> : null}

        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Password"
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry
              style={[styles.input, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
              accessibilityLabel="Password"
            />
          )}
        />
        {errors.password ? <Text style={styles.error}>{errors.password.message}</Text> : null}
        {serverError ? <Text style={styles.error}>{serverError}</Text> : null}

        <Pressable
          style={[styles.primaryButton, { backgroundColor: theme.colors.action }]}
          onPress={handleSubmit(onSubmit)}
          disabled={submitting}
          accessibilityRole="button"
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Create account</Text>}
        </Pressable>

        <Pressable onPress={() => router.replace('/(auth)/sign-in')} accessibilityRole="button">
          <Text style={[styles.guestLink, { color: theme.colors.textSecondary }]}>Already have an account? Sign in</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: 24, gap: 12, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 8 },
  notice: { fontSize: 13, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  error: { color: '#DC2626', fontSize: 12 },
  primaryButton: { borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  guestLink: { textAlign: 'center', marginTop: 16, fontSize: 14, fontWeight: '600' },
});
