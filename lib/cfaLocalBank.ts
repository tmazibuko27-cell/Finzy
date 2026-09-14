import type { QuestionOption, QuizPayload } from '@/types/content';

export type PrivateCfaRecord = {
  id: string;
  sourceBook: string;
  sourceTitle: string;
  prompt: string;
  options: QuestionOption[];
  correctOptionId: string | null;
  explanation: string | null;
  status: string;
};

type PrivateCfaBank = { records?: PrivateCfaRecord[] };

function loadPrivateBank(): PrivateCfaBank {
  try {
    // The importer output is intentionally ignored by Git and exists only on the learner's machine.
    const load = eval('require') as (path: string) => PrivateCfaBank;
    return load('../data/cfa.local/question-bank.json');
  } catch {
    return { records: [] };
  }
}

export function getPrivateCfaRecords(): PrivateCfaRecord[] {
  return loadPrivateBank().records?.filter((record) => record.correctOptionId && record.options.length >= 3) ?? [];
}

export function toCfaQuiz(record: PrivateCfaRecord): QuizPayload {
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

export function getPrivateCfaAnswer(questionId: string) {
  return getPrivateCfaRecords().find((record) => record.id === questionId);
}