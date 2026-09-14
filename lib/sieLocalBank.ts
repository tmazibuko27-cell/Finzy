import type { QuestionOption, QuizPayload } from '@/types/content';
import privateBank from '@/data/sie.local/question-bank.json';

export type PrivateSieRecord = {
  id: string;
  sourceBook: string;
  sourceTitle: string;
  prompt: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  status: string;
};

export function getPrivateSieRecords(): PrivateSieRecord[] {
  return privateBank.records ?? [];
}

export function toSieQuiz(record: PrivateSieRecord): QuizPayload {
  return {
    questionId: record.id,
    questionVersion: 1,
    prompt: record.prompt,
    type: 'multiple_choice',
    difficulty: 2,
    xpReward: 8,
    options: record.options,
  };
}

export function getPrivateSieAnswer(questionId: string) {
  return getPrivateSieRecords().find((record) => record.id === questionId);
}