import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/features/auth/AuthProvider';
import { emailAuthSchema, type EmailAuthValues } from '@/features/auth/schema';
import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/env';

export default function SignInScreen() {
  const theme = useTheme();
  const { continueAsGuest } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    const { error } = await supabase.auth.signInWithPassword(values);
    setSubmitting(false);
    if (error) {
      setServerError(error.message);
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Sign in</Text>

        {!isSupabaseConfigured ? (
          <Text style={[styles.notice, { color: theme.colors.warning }]}>
            Running in local demo mode — sign-in will just take you into the app as a guest.
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
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Sign in</Text>}
        </Pressable>

        {Platform.OS === 'ios' ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={theme.mode === 'dark' ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={999}
            style={styles.appleButton}
            onPress={async () => {
              try {
                const credential = await AppleAuthentication.signInAsync({
                  requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                  ],
                });
                if (supabase && credential.identityToken) {
                  const { error } = await supabase.auth.signInWithIdToken({
                    provider: 'apple',
                    token: credential.identityToken,
                  });
                  if (error) {
                    setServerError(error.message);
                    return;
                  }
                } else {
                  continueAsGuest();
                }
                router.replace('/(tabs)');
              } catch {
                // User cancelled — no error state needed.
              }
            }}
          />
        ) : null}

        <Pressable onPress={() => { continueAsGuest(); router.replace('/(tabs)'); }} accessibilityRole="button">
          <Text style={[styles.guestLink, { color: theme.colors.textSecondary }]}>Continue as guest</Text>
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
  appleButton: { height: 48, marginTop: 4 },
  guestLink: { textAlign: 'center', marginTop: 16, fontSize: 14, fontWeight: '600' },
});
