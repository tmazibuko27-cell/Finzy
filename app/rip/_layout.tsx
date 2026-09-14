import { Stack } from 'expo-router';

export default function RipLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Collectibles' }} />
      <Stack.Screen name="buy-packs" options={{ title: 'Get More Packs', presentation: 'modal' }} />
      <Stack.Screen name="collection" options={{ title: 'Your Collection' }} />
    </Stack>
  );
}
