import React, { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Crypto from 'expo-crypto';
import type { QuizPayload, QuizSubmitResult } from '@/types/content';
import { submitQuizAnswer } from '@/features/quiz/api';

type Props = {
  quiz: QuizPayload;
  onResult?: (result: QuizSubmitResult) => void;
};

export function QuizBlock(props: Props) {
  return <QuizAttempt key={`${props.quiz.questionId}:${props.quiz.questionVersion}`} {...props} />;
}

function QuizAttempt({ quiz, onResult }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmitResult | null>(null);

  const [error, setError] = useState(false);
  const attempt = useRef<{ optionId: string; key: string } | null>(null);
  const inFlight = useRef(false);

  const locked = result !== null;

  const handleSelect = async (optionId: string) => {
    if (locked || inFlight.current) return;
    inFlight.current = true;
    setError(false);
    setSelectedId(optionId);
    setSubmitting(true);
    try {
      // A lost response may already have committed: retry the same answer/key.
      attempt.current ??= { optionId, key: Crypto.randomUUID() };
      const outcome = await submitQuizAnswer(quiz, attempt.current.optionId, attempt.current.key);
      setResult(outcome);
      Haptics.notificationAsync(
        outcome.correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
      ).catch(() => {});
      onResult?.(outcome);
    } catch {
      setError(true);
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {quiz.options?.map((option) => {
        const isSelected = selectedId === option.id;
        const isCorrectOption = locked && result?.correctOptionId === option.id;
        const isWrongSelected = locked && isSelected && !result?.correct;

        return (
          <Pressable
            key={option.id}
            onPress={() => handleSelect(option.id)}
            disabled={locked || submitting || error}
            style={[
              styles.option,
              isSelected && !locked && styles.optionSelected,
              isCorrectOption && styles.optionCorrect,
              isWrongSelected && styles.optionWrong,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected, disabled: locked || submitting || error }}
            accessibilityLabel={option.label}
          >
            <Text style={styles.optionText}>{option.label}</Text>
            {submitting && isSelected ? <ActivityIndicator size="small" color="#fff" /> : null}
          </Pressable>
        );
      })}

      {error ? (
        <View style={styles.feedback}>
          <Text accessibilityRole="alert" style={styles.explanation}>
            Your answer could not be confirmed. Reconnect and retry.
          </Text>
          <Pressable style={styles.option} accessibilityRole="button" accessibilityLabel="Retry answer"
            onPress={() => selectedId && handleSelect(selectedId)}>
            <Text style={styles.optionText}>Retry answer</Text>
          </Pressable>
        </View>
      ) : null}
      {result ? (
        <View style={styles.feedback}>
          <Text style={[styles.feedbackTitle, { color: result.correct ? '#4ADE80' : '#F87171' }]}>
            {result.correct ? `Correct · +${result.xpAwarded} XP` : 'Not quite'}
          </Text>
          <Text style={styles.explanation}>{result.explanation}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20, gap: 10 },
  option: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionSelected: { borderColor: '#60A5FA', backgroundColor: 'rgba(96,165,250,0.15)' },
  optionCorrect: { borderColor: '#4ADE80', backgroundColor: 'rgba(74,222,128,0.15)' },
  optionWrong: { borderColor: '#F87171', backgroundColor: 'rgba(248,113,113,0.15)' },
  optionText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  feedback: { marginTop: 8, gap: 6 },
  feedbackTitle: { fontSize: 15, fontWeight: '700' },
  explanation: { color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 20 },
});
