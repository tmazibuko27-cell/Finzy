import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { LABS } from '@/features/labs/catalog';
import { useTheme } from '@/components/ThemeProvider';

export function LabDiscovery() {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Pressable accessibilityRole="button" accessibilityLabel="Start The rate shock interactive finance lab"
        onPress={() => router.push('/lab/rate-shock' as never)} style={styles.hero}>
        <View style={styles.heroTop}><Text style={styles.eyebrow}>THE FINANCE LAB</Text><View style={styles.pill}><Text style={styles.pillText}>LEARN BY DOING</Text></View></View>
        <Text style={styles.headline}>Make your{ '\n' }next money{ '\n' }moment click.</Text>
        <Text style={styles.description}>Change an assumption.{ '\n' }See the whole picture move.</Text>
        <View style={styles.preview} accessible={false} importantForAccessibility="no-hide-descendants">
          <View style={styles.previewRow}><Text style={styles.previewLabel}>MARKET YIELD</Text><Text style={styles.previewValue}>5% → 7%</Text></View>
          <Svg width="100%" height={85} viewBox="0 0 300 85">
            <Line x1="0" x2="300" y1="70" y2="70" stroke="#344C48" strokeDasharray="3 5" />
            <Path d="M0,12 C65,12 95,30 145,42 S235,67 300,73" fill="none" stroke="#B8F36D" strokeWidth={3} />
            <Circle cx="145" cy="42" r="5" fill="#B8F36D" />
          </Svg>
          <View style={styles.previewRow}><Text style={styles.previewLabel}>FIXED COUPON. NEW PRICE.</Text><Text style={styles.previewValue}>↓</Text></View>
        </View>
        <View style={styles.heroBottom}><Text style={styles.cta}>Try the rate shock</Text><Ionicons name="arrow-forward" size={22} color="#B8F36D" /></View>
      </Pressable>
      <View style={styles.sectionTop}>
        <Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Build your intuition</Text>
        <Text style={[styles.count, { color: theme.colors.textSecondary }]}>3 LABS</Text>
      </View>
      <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>Start curious. Leave with a deeper understanding.</Text>
      {LABS.map((lab) => (
        <Pressable key={lab.slug} accessibilityRole="button" accessibilityLabel={`${lab.title}. ${lab.subtitle}`} onPress={() => router.push(`/lab/${lab.slug}` as never)}
          style={[styles.lab, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={[styles.icon, { backgroundColor: '#101E2B' }]}><Ionicons name={lab.icon} size={22} color={lab.accent} /></View>
          <View style={styles.labBody}>
            <Text style={[styles.labCategory, { color: theme.colors.textSecondary }]}>{lab.category}</Text>
            <Text style={[styles.labTitle, { color: theme.colors.textPrimary }]}>{lab.title}</Text>
            <Text style={[styles.labSubtitle, { color: theme.colors.textSecondary }]}>{lab.subtitle}</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={theme.colors.textSecondary} />
        </Pressable>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { gap: 10 }, hero: { backgroundColor: '#102A28', borderRadius: 26, padding: 24, gap: 20, overflow: 'hidden' },
  heroTop: { gap: 10, alignItems: 'flex-start' }, eyebrow: { color: '#B8F36D', fontSize: 10, fontWeight: '800', letterSpacing: 1.8 },
  pill: { borderWidth: 1, borderColor: '#456145', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 }, pillText: { color: '#D3E7CC', fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  headline: { color: '#F3F7E8', fontSize: 36, lineHeight: 39, fontWeight: '800', letterSpacing: -1.3 },
  description: { color: '#BBCFC5', fontSize: 14, lineHeight: 21 }, preview: { backgroundColor: '#183832', padding: 16, borderRadius: 16 },
  previewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, previewLabel: { color: '#BDCEBC', fontSize: 9, letterSpacing: 0.8, flexShrink: 1 },
  previewValue: { color: '#B8F36D', fontSize: 15, fontWeight: '700' }, heroBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, cta: { color: '#B8F36D', fontSize: 15, fontWeight: '700' },
  sectionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, gap: 8 }, sectionTitle: { fontSize: 21, fontWeight: '700', letterSpacing: -0.5, flexShrink: 1 },
  count: { fontSize: 9, letterSpacing: 1, fontWeight: '700' }, sectionDescription: { fontSize: 13, lineHeight: 20, marginBottom: 6 },
  lab: { borderRadius: 18, borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }, icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  labBody: { flex: 1, gap: 5 }, labCategory: { fontSize: 9, letterSpacing: 1, fontWeight: '700' }, labTitle: { fontSize: 16, fontWeight: '700' }, labSubtitle: { fontSize: 12, lineHeight: 18 },
});
