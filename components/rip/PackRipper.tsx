import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { RarityBadge, rarityColor } from '@/components/rip/RarityBadge';
import { openPack } from '@/features/pack/api';
import type { PackOpenResult } from '@/types/content';

type Phase = 'idle' | 'opening' | 'revealed';

const CONFETTI_COLORS = ['#FDE047', '#60A5FA', '#F87171', '#4ADE80', '#C084FC'];

export function PackRipper({
  balance,
  onOpened,
  previewPerson,
}: {
  balance: number;
  onOpened: (result: PackOpenResult) => void;
  previewPerson?: PackOpenResult['person'];
}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [cardFlipped, setCardFlipped] = useState(false);
  const [result, setResult] = useState<PackOpenResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [shake] = useState(() => new Animated.Value(0));
  const [flip] = useState(() => new Animated.Value(0));
  const [interactiveFlip] = useState(() => new Animated.Value(0));
  const [reveal] = useState(() => new Animated.Value(0));
  const [confetti] = useState(() =>
    Array.from({ length: 14 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 90 + Math.random() * 60;
      return {
        progress: new Animated.Value(0),
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
      };
    })
  );

  const canRip = phase === 'idle';

  const handleRip = async () => {
    if (!canRip) return;
    setError(null);
    setPhase('opening');

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 90, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 90, useNativeDriver: true }),
    ]).start();

    try {
      const outcome = await openPack();
      setResult(outcome);

      Animated.timing(flip, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setPhase('revealed');
        Animated.spring(reveal, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }).start();

        const isBig = outcome.rarity === 'epic' || outcome.rarity === 'legendary';
        Haptics.notificationAsync(
          isBig ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
        ).catch(() => {});

        if (isBig) {
          confetti.forEach((particle) => {
            particle.progress.setValue(0);
            Animated.timing(particle.progress, {
              toValue: 1,
              duration: 900 + Math.random() * 400,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }).start();
          });
        }

        onOpened(outcome);
      });
    } catch (err) {
      setPhase('idle');
      setError(err instanceof Error ? err.message : 'Could not open pack. Try again.');
    }
  };

  const handlePreview = () => {
    if (!previewPerson || phase !== 'idle') return;
    const previewResult: PackOpenResult = {
      person: previewPerson,
      rarity: 'legendary',
      isDuplicate: false,
      bonusXp: 0,
      balance,
      replay: true,
    };
    setResult(previewResult);
    setCardFlipped(false);
    interactiveFlip.setValue(0);
    flip.setValue(1);
    reveal.setValue(1);
    setPhase('revealed');
    onOpened(previewResult);
  };

  const resetForNextRip = () => {
    flip.setValue(0);
    interactiveFlip.setValue(0);
    reveal.setValue(0);
    setResult(null);
    setCardFlipped(false);
    setPhase('idle');
  };

  const handleCardFlip = () => {
    if (!result) return;
    Haptics.selectionAsync().catch(() => {});
    const nextFlipped = !cardFlipped;
    setCardFlipped(nextFlipped);
    Animated.timing(interactiveFlip, {
      toValue: 0.5,
      duration: 260,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(interactiveFlip, {
        toValue: nextFlipped ? 1 : 0,
        duration: 260,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  };

  const shakeTranslate = shake.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] });
  const flipRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const frontOpacity = flip.interpolate({ inputRange: [0, 0.5, 0.5001, 1], outputRange: [1, 1, 0, 0] });
  const backOpacity = flip.interpolate({ inputRange: [0, 0.5, 0.5001, 1], outputRange: [0, 0, 1, 1] });
  const revealScale = reveal.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });

  const confettiStyles = confetti.map((particle) => ({
    opacity: particle.progress.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
    translateX: particle.progress.interpolate({ inputRange: [0, 1], outputRange: [0, particle.tx] }),
    translateY: particle.progress.interpolate({ inputRange: [0, 1], outputRange: [0, particle.ty] }),
    scale: particle.progress.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0.6] }),
    color: particle.color,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.stage}>
        {phase === 'revealed' && result && (
          <View style={styles.confettiLayer} pointerEvents="none">
            {confettiStyles.map((particleStyle, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.confettiDot,
                  {
                    backgroundColor: particleStyle.color,
                    opacity: particleStyle.opacity,
                    transform: [
                      { translateX: particleStyle.translateX },
                      { translateY: particleStyle.translateY },
                      { scale: particleStyle.scale },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        )}

        {phase !== 'revealed' ? <Animated.View style={{ transform: [{ translateX: shakeTranslate }, { perspective: 800 }, { rotateY: flipRotate }] }}>
          <Animated.View style={[styles.card, styles.cardFace, { opacity: frontOpacity }]}>
            <CollectibleWrapper />
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              styles.cardFace,
              styles.cardBack,
              {
                opacity: backOpacity,
                borderColor: result ? rarityColor(result.rarity) : '#334155',
                transform: [{ rotateY: '180deg' }, { scale: revealScale }],
              },
            ]}
          >
            <View style={[styles.cardOuterRim, { borderColor: result ? rarityColor(result.rarity) : '#334155' }]}>
              <View style={styles.cardInnerRim}>
                {result ? <CollectibleCardFace result={result} /> : null}
              </View>
            </View>
          </Animated.View>
        </Animated.View> : null}

        {phase === 'revealed' && result ? (
          <Pressable style={styles.cardHitbox} onPress={handleCardFlip} accessibilityRole="button" accessibilityLabel="Flip collectible card">
            <Animated.View style={[styles.card, styles.cardFace, styles.staticCard, styles.staticShadow, { transform: [{ scaleX: interactiveFlip.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 1] }) }] }]}> 
              <View style={[styles.cardOuterRim, { borderColor: rarityColor(result.rarity) }]}>
                <View style={styles.cardInnerRim}>
                  {cardFlipped ? <CollectibleCardBack /> : <CollectibleCardFace result={result} />}
                </View>
              </View>
            </Animated.View>
          </Pressable>
        ) : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {phase === 'revealed' ? (
        <Pressable style={styles.actionButton} onPress={resetForNextRip} accessibilityRole="button">
          <Text style={styles.actionButtonText}>{balance > 0 ? 'Rip another' : 'Done'}</Text>
        </Pressable>
      ) : (
        <>
          <Pressable
            style={[styles.actionButton, !canRip && styles.actionButtonDisabled]}
            onPress={handleRip}
            disabled={!canRip}
            accessibilityRole="button"
            accessibilityLabel="Open collectible pack"
          >
            <Text style={styles.actionButtonText}>{phase === 'opening' ? 'Opening…' : 'Open collectible'}</Text>
          </Pressable>
          {previewPerson ? (
            <Pressable
              style={styles.previewButton}
              onPressIn={handlePreview}
              onPress={handlePreview}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Text style={styles.previewButtonText}>Preview Warren Buffett card</Text>
            </Pressable>
          ) : null}
        </>
      )}
    </View>
  );
}

function CollectibleCardBack() {
  return (
    <LinearGradient colors={['#07111F', '#123B4E', '#07111F']} style={styles.backContent}>
      <Image source={require('../../assets/images/collectibles/logo-mark.svg')} style={styles.backLogo} contentFit="contain" />
      <Text style={styles.backBrand}>FINZY</Text>
      <Text style={styles.backSeries}>COLLECTIBLE SERIES</Text>
      <View style={styles.backRule} />
      <Text style={styles.backHint}>TAP TO FLIP</Text>
    </LinearGradient>
  );
}

function CollectibleWrapper() {
  return (
    <LinearGradient colors={['#123B4E', '#07111F', '#0F2740']} style={styles.wrapper}>
      <View style={styles.wrapperTopFold} />
      <View style={styles.wrapperLogoFrame}>
        <Image source={require('../../assets/images/collectibles/logo.png')} style={styles.wrapperLogo} contentFit="contain" />
      </View>
      <Text style={styles.wrapperBrand}>FINZY</Text>
      <Text style={styles.wrapperSeries}>FOUNDERS COLLECTION</Text>
      <View style={styles.wrapperTearLine}>
        <Text style={styles.wrapperTearText}>TEAR HERE</Text>
      </View>
      <Text style={styles.wrapperHint}>COLLECTIBLE CARD</Text>
    </LinearGradient>
  );
}

function CollectibleCardFace({ result }: { result: PackOpenResult }) {
  return (
    <LinearGradient colors={['#163B54', '#0E2439', '#07111F']} style={styles.faceContent}>
      <View style={styles.foilLine} />
      <View style={styles.cardTopline}>
        <Text style={styles.cardSeries}>FINZY / FOUNDERS</Text>
        <Text style={styles.cardNumber}>01</Text>
      </View>
      {result.person.portraitAsset || result.person.portraitUrl ? (
        <Image
          source={result.person.portraitAsset ?? { uri: result.person.portraitUrl ?? undefined }}
          style={styles.portraitPanel}
          contentFit="cover"
        />
      ) : (
        <View style={styles.portraitPanel}><Ionicons name="person-circle" size={72} color="#94A3B8" /></View>
      )}
      <View style={styles.cardHeader}>
        <Text style={styles.resultName}>{result.person.name}</Text>
        <RarityBadge rarity={result.rarity} size="sm" />
      </View>
      <Text style={styles.resultDescriptor}>{result.person.descriptor}</Text>
      <View style={styles.statGrid}>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>BUSINESS</Text>
          <Text style={styles.statValue} numberOfLines={1}>{result.person.business ?? '—'}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>EDUCATION</Text>
          <Text style={styles.statValue} numberOfLines={1}>{result.person.education ?? '—'}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>NET WORTH</Text>
          <Text style={styles.statValue}>{result.person.netWorth ?? '—'}</Text>
        </View>
        <View style={styles.powerCell}>
          <Text style={styles.statLabel}>POWER</Text>
          <Text style={styles.powerValue}>{result.person.power ?? '—'}</Text>
        </View>
      </View>
      {result.isDuplicate && result.bonusXp > 0 ? (
        <Text style={styles.dupText}>Already collected · +{result.bonusXp} XP</Text>
      ) : result.isDuplicate ? null : (
        <Text style={styles.newText}>New card!</Text>
      )}
      <View style={styles.foilLine} />
    </LinearGradient>
  );
}

const CARD_W = 220;
const CARD_H = 300;

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 24 },
  stage: { width: CARD_W, height: CARD_H, alignItems: 'center', justifyContent: 'center' },
  cardHitbox: { width: CARD_W, height: CARD_H, position: 'absolute', left: 0, top: 0 },
  confettiLayer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 1,
    height: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confettiDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 24,
    position: 'absolute',
    backfaceVisibility: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFace: { backgroundColor: '#0F172A' },
  cardBack: { borderWidth: 2, gap: 7, padding: 0, backgroundColor: '#163B54', overflow: 'hidden' },
  staticCard: { zIndex: 5 },
  staticShadow: { shadowColor: '#020617', shadowOffset: { width: 7, height: 9 }, shadowOpacity: 0.7, shadowRadius: 0, elevation: 12 },
  cardOuterRim: { width: '100%', height: '100%', borderWidth: 5, borderRadius: 21, padding: 4, backgroundColor: '#07111F' },
  cardInnerRim: { flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)', borderRadius: 14, overflow: 'hidden' },
  faceContent: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 14 },
  backContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 18 },
  backLogo: { width: 116, height: 116 },
  backBrand: { color: '#fff', fontSize: 23, fontWeight: '900', letterSpacing: 4, marginTop: 16 },
  backSeries: { color: '#A7F3D0', fontSize: 8, fontWeight: '800', letterSpacing: 1.5, marginTop: 5 },
  backRule: { width: 90, height: 1, backgroundColor: 'rgba(255,255,255,0.35)', marginVertical: 22 },
  backHint: { color: 'rgba(255,255,255,0.55)', fontSize: 8, fontWeight: '800', letterSpacing: 1.3 },
  wrapper: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', padding: 18, overflow: 'hidden' },
  wrapperTopFold: { position: 'absolute', top: 0, left: 0, right: 0, height: 26, backgroundColor: '#1A5265', borderBottomWidth: 1, borderBottomColor: 'rgba(167,243,208,0.45)' },
  wrapperLogoFrame: { width: 116, height: 116, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(167,243,208,0.5)', alignItems: 'center', justifyContent: 'center', backgroundColor: '#07111F', overflow: 'hidden' },
  wrapperLogo: { width: 108, height: 108 },
  wrapperBrand: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 4, marginTop: 16 },
  wrapperSeries: { color: '#A7F3D0', fontSize: 8, fontWeight: '800', letterSpacing: 1.2, marginTop: 6 },
  wrapperTearLine: { width: '100%', borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.3)', marginTop: 24, paddingVertical: 7, alignItems: 'center' },
  wrapperTearText: { color: 'rgba(255,255,255,0.62)', fontSize: 8, fontWeight: '900', letterSpacing: 1.5 },
  wrapperHint: { color: 'rgba(255,255,255,0.46)', fontSize: 8, fontWeight: '700', letterSpacing: 1.3, marginTop: 18 },
  foilLine: { width: '100%', height: 2, backgroundColor: '#A7F3D0', opacity: 0.8 },
  cardTopline: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardSeries: { color: '#A7F3D0', fontSize: 7, fontWeight: '900', letterSpacing: 0.9 },
  cardNumber: { color: 'rgba(255,255,255,0.55)', fontSize: 8, fontWeight: '800' },
  portraitPanel: { width: '100%', height: 92, borderWidth: 2, borderColor: '#A7F3D0', backgroundColor: '#0B1220', alignItems: 'center', justifyContent: 'center' },
  cardHeader: { width: '100%', alignItems: 'center', gap: 5 },
  packInner: { alignItems: 'center', gap: 6 },
  packLabel: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 1, marginTop: 8 },
  packSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  resultName: { color: '#fff', fontSize: 18, fontWeight: '800', textAlign: 'center' },
  resultDescriptor: { color: 'rgba(255,255,255,0.68)', fontSize: 10, textAlign: 'center' },
  statGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 2 },
  statCell: { width: '48%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 5, padding: 5, borderLeftWidth: 2, borderLeftColor: '#60A5FA' },
  powerCell: { width: '48%', backgroundColor: 'rgba(167,243,208,0.18)', borderRadius: 5, padding: 5, borderLeftWidth: 2, borderLeftColor: '#A7F3D0' },
  statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 7, fontWeight: '800', letterSpacing: 0.5 },
  statValue: { color: '#fff', fontSize: 9, fontWeight: '700', marginTop: 2 },
  powerValue: { color: '#A7F3D0', fontSize: 15, fontWeight: '900', marginTop: -1 },
  newText: { color: '#4ADE80', fontWeight: '700', fontSize: 13 },
  dupText: { color: '#93C5FD', fontWeight: '600', fontSize: 13, textAlign: 'center' },
  actionButton: { backgroundColor: '#2563EB', borderRadius: 999, paddingHorizontal: 32, paddingVertical: 14 },
  actionButtonDisabled: { backgroundColor: '#334155' },
  actionButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  previewButton: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10 },
  previewButtonText: { color: 'rgba(255,255,255,0.8)', fontWeight: '700', fontSize: 13 },
  error: { color: '#F87171', fontSize: 13, textAlign: 'center' },
});
