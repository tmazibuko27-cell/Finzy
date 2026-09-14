import { supabase } from '@/lib/supabase';
import { MOCK_QUIZ_ANSWERS } from '@/lib/mockFeed';
import { getPrivateCfaAnswer } from '@/lib/cfaLocalBank';
import type { QuizPayload, QuizSubmitResult } from '@/types/content';

/**
 * Submits a quiz answer. Correctness, XP and level are always decided
 * server-side (submit_quiz_answer RPC) to keep progression authoritative and
 * resistant to client tampering, per the XP/streak/mastery rules in the spec.
 * Falls back to a local mock evaluation only when Supabase isn't configured.
 */
export async function submitQuizAnswer(
  quiz: QuizPayload,
  selectedOptionId: string,
  idempotencyKey: string
): Promise<QuizSubmitResult> {
  if (supabase) {
    const { data, error } = await supabase.rpc('submit_quiz_answer', {
      question_id: quiz.questionId,
      question_version: quiz.questionVersion,
      selected_option_id: selectedOptionId,
      idempotency_key: idempotencyKey,
    });
    if (error) throw error;
    if (!data) throw new Error('Quiz submission returned no result');
    return data as QuizSubmitResult;
  }

  const privateAnswer = getPrivateCfaAnswer(quiz.questionId);
  const answer = privateAnswer ?? MOCK_QUIZ_ANSWERS[quiz.questionId];
  if (!answer) throw new Error('This question is unavailable in demo mode');
  const correct = answer.correctOptionId === selectedOptionId;
  return {
    correct,
    explanation: answer.explanation ?? 'Explanation unavailable in demo mode.',
    correctOptionId: answer.correctOptionId ?? null,
    xpAwarded: correct ? quiz.xpReward : 0,
    totalXp: 0,
    level: 1,
  };
}
