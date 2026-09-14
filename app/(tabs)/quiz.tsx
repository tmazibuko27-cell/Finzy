import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/ThemeProvider';
import { QuizBlock } from '@/components/quiz/QuizBlock';
import { MOCK_FEED_CARDS } from '@/lib/mockFeed';
import type { QuizSubmitResult } from '@/types/content';

const DAILY_SET_SIZE = 5;

export default function QuizHubScreen() {
  const theme = useTheme();
  const [answered, setAnswered] = useState(false);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalXp, setTotalXp] = useState(0);

  const questions = useMemo(() => {
    const withQuiz = MOCK_FEED_CARDS.filter((c) => c.quiz);
    return withQuiz.slice(0, DAILY_SET_SIZE);
  }, []);

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
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Quiz</Text>
      </View>

      {!started ? (
        <View style={styles.centerPad}>
          <View style={[styles.dailyCard, { backgroundColor: theme.colors.cardBackground }]}>
            <Ionicons name="flash" size={28} color="#FDE047" />
            <Text style={styles.dailyTitle}>Practice Quiz</Text>
            <Text style={styles.dailySubtitle}>{questions.length} demo questions · practice the basics</Text>
            <Pressable
              style={[styles.startButton, { backgroundColor: theme.colors.action }]}
              onPress={() => setStarted(true)}
              accessibilityRole="button"
            >
              <Text style={styles.startButtonText}>Start</Text>
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
  dailyCard: { width: '100%', borderRadius: 20, padding: 24, alignItems: 'center', gap: 6 },
  dailyTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 4 },
  dailySubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center' },
  startButton: { marginTop: 16, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 999 },
  startButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  resultsTitle: { fontSize: 26, fontWeight: '800' },
  resultsXp: { fontSize: 16, fontWeight: '700', marginTop: 6 },
  quizScroll: { padding: 20 },
  progressLabel: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  quizCard: { borderRadius: 20, padding: 20 },
  quizPrompt: { color: '#fff', fontSize: 18, fontWeight: '700', lineHeight: 24 },
});
