import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/features/auth/AuthProvider';

export default function WelcomeScreen() {
  const { continueAsGuest } = useAuth();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 40, 720);

  const startGuest = () => {
    continueAsGuest();
    router.replace('/onboarding');
  };

  return (
    <View style={styles.screen}>
      <LinearGradient colors={['#07111F', '#102A43', '#195B66']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { width: contentWidth }]} showsVerticalScrollIndicator={false}>
          <View style={styles.nav}>
            <View style={styles.brandLockup}>
              <View style={styles.logoMark}><Ionicons name="pulse" size={17} color="#07111F" /></View>
              <Text style={styles.wordmark}>FINZY</Text>
            </View>
            <Text style={styles.navLabel}>THE DAILY MONEY PRACTICE</Text>
          </View>

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>A calmer way to get smart with money</Text>
            <Text style={styles.headline}>Make financial understanding a daily habit.</Text>
            <Text style={styles.heroCopy}>
              Finzy turns the money topics everyone talks around into short, clear lessons you can actually use.
            </Text>
            <View style={styles.heroActions}>
              <Pressable style={styles.primaryButton} onPress={startGuest} accessibilityRole="button">
                <Text style={styles.primaryButtonText}>Start learning</Text>
                <Ionicons name="arrow-forward" size={18} color="#07111F" />
              </Pressable>
              <Pressable style={styles.textButton} onPress={() => router.push('/(auth)/sign-in')} accessibilityRole="button">
                <Text style={styles.textButtonText}>Sign in</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.signalRow}>
            <View><Text style={styles.signalNumber}>5 min</Text><Text style={styles.signalLabel}>to learn something useful</Text></View>
            <View style={styles.signalDivider} />
            <View><Text style={styles.signalNumber}>0%</Text><Text style={styles.signalLabel}>finance-bro energy</Text></View>
          </View>

          <View style={styles.missionSection}>
            <Text style={styles.sectionEyebrow}>OUR MISSION</Text>
            <Text style={styles.missionTitle}>Money knowledge should feel like momentum, not homework.</Text>
            <Text style={styles.missionCopy}>
              We are building the place people go before they make a money decision: curious, informed, and a little more ready than yesterday.
            </Text>
          </View>

          <View style={styles.pillarGrid}>
            <Pillar icon="sparkles-outline" title="Learn" copy="Short, sourced explainers that make the complex click." />
            <Pillar icon="flash-outline" title="Practice" copy="Low-stakes quizzes that turn recognition into recall." />
            <Pillar icon="compass-outline" title="Decide" copy="A clearer point of view for the next choice in front of you." />
          </View>

          <View style={styles.quoteBlock}>
            <Ionicons name="leaf-outline" size={24} color="#A7F3D0" />
            <Text style={styles.quote}>“The goal is not to know everything. It is to feel less lost when it matters.”</Text>
          </View>

          <View style={styles.footerCta}>
            <Text style={styles.footerTitle}>Your next smart move starts small.</Text>
            <Pressable style={styles.outlineButton} onPress={startGuest} accessibilityRole="button">
              <Text style={styles.outlineButtonText}>Open Finzy</Text>
              <Ionicons name="arrow-up-right-box" size={17} color="#fff" />
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Pillar({ icon, title, copy }: { icon: React.ComponentProps<typeof Ionicons>['name']; title: string; copy: string }) {
  return (
    <View style={styles.pillar}>
      <Ionicons name={icon} size={22} color="#A7F3D0" />
      <Text style={styles.pillarTitle}>{title}</Text>
      <Text style={styles.pillarCopy}>{copy}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#07111F' },
  safeArea: { flex: 1, alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 48 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 18, paddingBottom: 56 },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logoMark: { width: 30, height: 30, borderRadius: 9, backgroundColor: '#A7F3D0', alignItems: 'center', justifyContent: 'center' },
  wordmark: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 2 },
  navLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  hero: { maxWidth: 580 },
  eyebrow: { color: '#A7F3D0', fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 18 },
  headline: { color: '#fff', fontSize: 48, lineHeight: 54, fontWeight: '800', letterSpacing: -1, maxWidth: 560 },
  heroCopy: { color: 'rgba(255,255,255,0.72)', fontSize: 17, lineHeight: 26, marginTop: 20, maxWidth: 470 },
  heroActions: { flexDirection: 'row', alignItems: 'center', gap: 24, marginTop: 30 },
  primaryButton: { backgroundColor: '#A7F3D0', borderRadius: 10, paddingHorizontal: 18, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  primaryButtonText: { color: '#07111F', fontWeight: '800', fontSize: 15 },
  textButton: { paddingVertical: 14 },
  textButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  signalRow: { flexDirection: 'row', alignItems: 'center', gap: 28, marginTop: 64, paddingTop: 22, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.16)' },
  signalNumber: { color: '#fff', fontSize: 21, fontWeight: '800' },
  signalLabel: { color: 'rgba(255,255,255,0.52)', fontSize: 11, marginTop: 4 },
  signalDivider: { width: 1, height: 34, backgroundColor: 'rgba(255,255,255,0.2)' },
  missionSection: { marginTop: 96, paddingTop: 26, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.16)' },
  sectionEyebrow: { color: '#A7F3D0', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 15 },
  missionTitle: { color: '#fff', fontSize: 30, lineHeight: 37, fontWeight: '800', maxWidth: 570 },
  missionCopy: { color: 'rgba(255,255,255,0.68)', fontSize: 16, lineHeight: 24, marginTop: 16, maxWidth: 540 },
  pillarGrid: { flexDirection: 'row', gap: 12, marginTop: 34 },
  pillar: { flex: 1, minHeight: 158, padding: 16, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  pillarTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 19 },
  pillarCopy: { color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 19, marginTop: 7 },
  quoteBlock: { marginTop: 46, padding: 22, borderLeftWidth: 2, borderLeftColor: '#A7F3D0', backgroundColor: 'rgba(167,243,208,0.08)' },
  quote: { color: '#D1FAE5', fontSize: 20, lineHeight: 29, fontWeight: '700', marginTop: 13, maxWidth: 500 },
  footerCta: { marginTop: 72, paddingTop: 26, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.16)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 18 },
  footerTitle: { flex: 1, color: '#fff', fontSize: 22, lineHeight: 28, fontWeight: '800' },
  outlineButton: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  outlineButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
