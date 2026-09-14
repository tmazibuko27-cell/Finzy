import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from 'expo-router/react-navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';

import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { ProProvider } from '@/features/pro/ProProvider';
import { useLocalStore } from '@/lib/localStore';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const hydrate = useLocalStore((s) => s.hydrate);
  const hydrated = useLocalStore((s) => s.hydrated);
  const onboardingComplete = useLocalStore((s) => s.onboardingComplete);
  const [ready, setReady] = useState(false);
  const hasRoutedOnce = useRef(false);

  useEffect(() => {
    hydrate().finally(() => setReady(true));
  }, [hydrate]);

  useEffect(() => {
    if (!ready || !hydrated || hasRoutedOnce.current) return;
    hasRoutedOnce.current = true;
    if (!onboardingComplete) {
      router.replace('/(auth)/welcome');
    }
    SplashScreen.hideAsync();
  }, [ready, hydrated, onboardingComplete, router]);

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ProProvider>
            <NavigationThemeProvider value={colorScheme === 'dark' ? NavigationDarkTheme : NavigationDefaultTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
                <Stack.Screen name="paywall" options={{ headerShown: false, presentation: 'modal' }} />
                <Stack.Screen name="rip" options={{ headerShown: false, presentation: 'modal' }} />
                <Stack.Screen name="company/[slug]" options={{ title: '' }} />
                <Stack.Screen name="person/[slug]" options={{ title: '' }} />
                <Stack.Screen name="topic/[slug]" options={{ title: '' }} />
                <Stack.Screen name="card/[id]" options={{ title: '', presentation: 'modal' }} />
                <Stack.Screen name="settings" options={{ title: 'Settings' }} />
                <Stack.Screen name="+not-found" />
              </Stack>
            </NavigationThemeProvider>
          </ProProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
