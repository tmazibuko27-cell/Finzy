import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/ThemeProvider';
import { QuizBlock } from '@/components/quiz/QuizBlock';
import { MOCK_FEED_CARDS } from '@/lib/mockFeed';
import { CFA_PACKS, getCfaPackCounts, getRecordsForCfaPack, toCfaQuiz } from '@/lib/cfaLocalBank';
import { getPrivateSieRecords, toSieQuiz } from '@/lib/sieLocalBank';
import type { QuizSubmitResult } from '@/types/content';

const DAILY_SET_SIZE = 5;

export default function QuizHubScreen() {
  const theme = useTheme();
  const [answered, setAnswered] = useState(false);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [section, setSection] = useState<'sie' | 'cfa' | null>(null);
  const packCounts = useMemo(() => getCfaPackCounts(), []);
  const sieQuestions = useMemo(() => getPrivateSieRecords().slice(0, DAILY_SET_SIZE).map((record) => ({
    id: record.id,
    eyebrow: `SIE · ${record.sourceTitle}`,
    quiz: toSieQuiz(record),
  })), []);

  const questions = useMemo(() => {
    const privateQuestions = section === 'cfa' && selectedPack
      ? getRecordsForCfaPack(selectedPack).slice(0, DAILY_SET_SIZE).map((record) => ({
          id: record.id,
          eyebrow: `CFA · ${record.sourceTitle}`,
          quiz: toCfaQuiz(record),
        }))
      : [];
    if (section === 'sie') return sieQuestions;
    if (section === 'cfa' && selectedPack) return privateQuestions;
    const withQuiz = MOCK_FEED_CARDS.filter((c) => c.quiz);
    return withQuiz.slice(0, DAILY_SET_SIZE).map((card) => ({ id: card.id, eyebrow: card.eyebrow, quiz: card.quiz! }));
  }, [section, selectedPack, sieQuestions]);

  const finished = started && step >= questions.length;

  const handleResult = (result: QuizSubmitResult) => {
    setAnswered(true);
    if (result.correct) setCorrectCount((c) => c + 1);
    setTotalXp((x) => x + result.xpAwarded);
  };

  const reset = () => {
    setAnswered(false);
    setStarted(false);
    setStep(0);
    setCorrectCount(0);
    setTotalXp(0);
    setSelectedPack(null);
    setSection(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Quiz</Text>
      </View>

      {!started && !section ? (
        <View style={styles.centerPad}>
          <View style={styles.packHeader}>
            <Text style={[styles.packTitle, { color: theme.colors.textPrimary }]}>Choose a study section</Text>
            <Text style={[styles.packSubtitle, { color: theme.colors.textSecondary }]}>Build exam skill one focused set at a time.</Text>
          </View>
          <ScrollView style={styles.packList} contentContainerStyle={styles.packListContent}>
            <Pressable
              style={[styles.examCard, { backgroundColor: theme.colors.cardBackground }]}
              onPress={() => setSection('sie')}
              accessibilityRole="button"
              accessibilityLabel={`SIE Exam, ${sieQuestions.length} imported questions`}
            >
              <View style={styles.examCardCopy}>
                <Text style={styles.examEyebrow}>SECURITIES INDUSTRY ESSENTIALS</Text>
                <Text style={styles.examTitle}>SIE Exam</Text>
                <Text style={styles.examSubtitle}>Securities products, markets, and regulations</Text>
              </View>
              <Text style={styles.examCount}>{sieQuestions.length} ready</Text>
              <Ionicons name="arrow-forward" size={19} color="#A7F3D0" />
            </Pressable>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>CFA Level I</Text>
            {packCounts.map((pack, index) => (
              <Pressable
                key={pack.id}
                style={[styles.packRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, pack.count === 0 && styles.packDisabled]}
                disabled={pack.count === 0}
                onPress={() => { setSection('cfa'); setSelectedPack(pack.id); }}
                accessibilityRole="button"
                accessibilityLabel={`${pack.title}, ${pack.count} questions`}
              >
                <Text style={styles.packNumber}>{String(index + 1).padStart(2, '0')}</Text>
                <View style={styles.packCopy}>
                  <Text style={[styles.packName, { color: theme.colors.textPrimary }]}>{pack.title}</Text>
                  <Text style={[styles.packDescription, { color: theme.colors.textSecondary }]}>{pack.subtitle}</Text>
                </View>
                <Text style={[styles.packCount, { color: pack.count ? theme.colors.action : theme.colors.textSecondary }]}>
                  {pack.count ? `${pack.count}` : 'Soon'}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : !started ? (
        <View style={styles.centerPad}>
          <View style={[styles.dailyCard, { backgroundColor: theme.colors.cardBackground }]}> 
            <Ionicons name="flash" size={28} color="#FDE047" />
            <Text style={styles.dailyTitle}>{section === 'sie' ? 'SIE Exam' : CFA_PACKS.find((pack) => pack.id === selectedPack)?.title}</Text>
            <Text style={styles.dailySubtitle}>{questions.length} questions · {section === 'sie' ? 'SIE source-backed practice' : 'CFA source-backed practice'}</Text>
            <Pressable
              style={[styles.startButton, { backgroundColor: theme.colors.action }]}
              onPress={() => setStarted(true)}
              accessibilityRole="button"
            >
              <Text style={styles.startButtonText}>Start</Text>
            </Pressable>
            <Pressable onPress={() => { setSelectedPack(null); setSection(null); }} accessibilityRole="button">
              <Text style={styles.changePack}>Choose another topic</Text>
            </Pressable>
          </View>
        </View>
      ) : finished ? (
        <View style={styles.centerPad}>
          <Text style={[styles.resultsTitle, { color: theme.colors.textPrimary }]}>
            {correctCount}/{questions.length} correct
          </Text>
          <Text style={[styles.resultsXp, { color: theme.colors.action }]}>+{totalXp} XP earned</Text>
          <Pressable
            style={[styles.startButton, { backgroundColor: theme.colors.action, marginTop: 24 }]}
            onPress={reset}
            accessibilityRole="button"
          >
            <Text style={styles.startButtonText}>Done</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.quizScroll}>
          <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
            Question {step + 1} of {questions.length}
          </Text>
          <View style={[styles.quizCard, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={styles.quizEyebrow}>{questions[step].eyebrow}</Text>
            <Text style={styles.quizPrompt}>{questions[step].quiz!.prompt}</Text>
            <QuizBlock key={step} quiz={questions[step].quiz!} onResult={handleResult} />
          </View>
          <Pressable
            style={[styles.startButton, { backgroundColor: theme.colors.action, marginTop: 20 }]}
            disabled={!answered}
            accessibilityState={{ disabled: !answered }}
            onPress={() => { setAnswered(false); setStep((s) => s + 1); }}
            accessibilityRole="button"
          >
            <Text style={styles.startButtonText}>{step + 1 === questions.length ? 'See results' : 'Next question'}</Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '700' },
  centerPad: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  packHeader: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 },
  packTitle: { fontSize: 22, fontWeight: '800' },
  packSubtitle: { fontSize: 14, marginTop: 5 },
  packList: { flex: 1, width: '100%' },
  packListContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 8 },
  examCard: { minHeight: 112, borderRadius: 12, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  examCardCopy: { flex: 1 },
  examEyebrow: { color: '#A7F3D0', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  examTitle: { color: '#fff', fontSize: 21, fontWeight: '800', marginTop: 7 },
  examSubtitle: { color: 'rgba(255,255,255,0.68)', fontSize: 12, marginTop: 4 },
  examCount: { color: '#A7F3D0', fontSize: 12, fontWeight: '800' },
  sectionLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginTop: 12, marginBottom: 2 },
  packRow: { minHeight: 72, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  packDisabled: { opacity: 0.55 },
  packNumber: { color: '#2563EB', fontSize: 12, fontWeight: '800', width: 22 },
  packCopy: { flex: 1 },
  packName: { fontSize: 15, fontWeight: '800' },
  packDescription: { fontSize: 12, marginTop: 3 },
  packCount: { fontSize: 12, fontWeight: '800' },
  dailyCard: { width: '100%', borderRadius: 20, padding: 24, alignItems: 'center', gap: 6 },
  dailyTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 4 },
  dailySubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center' },
  startButton: { marginTop: 16, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 999 },
  startButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  changePack: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '700', marginTop: 20 },
  resultsTitle: { fontSize: 26, fontWeight: '800' },
  resultsXp: { fontSize: 16, fontWeight: '700', marginTop: 6 },
  quizScroll: { padding: 20 },
  progressLabel: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  quizCard: { borderRadius: 20, padding: 20 },
  quizEyebrow: { color: '#A7F3D0', fontSize: 11, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },
  quizPrompt: { color: '#fff', fontSize: 18, fontWeight: '700', lineHeight: 24 },
});
