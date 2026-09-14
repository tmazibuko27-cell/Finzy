import React, { useEffect, useState } from 'react';
import { Animated, View, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';

/** Loading placeholder shaped like a real feed card, not a bare spinner. */
export function CardSkeleton() {
  const theme = useTheme();
  const { height } = useWindowDimensions();
  const [opacity] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View style={[styles.container, { height, backgroundColor: theme.colors.cardBackground }]}>
      <Animated.View style={[styles.pill, { opacity, width: 90 }]} />
      <Animated.View style={[styles.line, { opacity, width: '80%', height: 26, marginTop: 24 }]} />
      <Animated.View style={[styles.line, { opacity, width: '60%', height: 26, marginTop: 8 }]} />
      <Animated.View style={[styles.line, { opacity, width: '95%', marginTop: 28 }]} />
      <Animated.View style={[styles.line, { opacity, width: '90%' }]} />
      <Animated.View style={[styles.line, { opacity, width: '70%' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: 20, paddingTop: 100 },
  pill: { height: 20, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.25)' },
  line: { height: 16, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', marginTop: 10 },
});
