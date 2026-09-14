import React from 'react';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLab } from '@/features/labs/catalog';
import { LabExperience } from '@/components/labs/LabExperience';
import { ErrorState } from '@/components/ui/ErrorState';
import { useTheme } from '@/components/ThemeProvider';

export default function LabScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const lab = getLab(slug);
  const theme = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['bottom']}>
      <Stack.Screen options={{ title: 'The Finance Lab', headerBackTitle: 'Discover' }} />
      {lab ? <LabExperience key={lab.slug} lab={lab} onExit={() => router.replace('/(tabs)/discover')} /> :
        <ErrorState title="Lab not found" message="Choose an available experiment from Discover." onRetry={() => router.replace('/(tabs)/discover')} />}
    </SafeAreaView>
  );
}
