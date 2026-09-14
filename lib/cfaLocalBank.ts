import type { QuestionOption, QuizPayload } from '@/types/content';
import privateBank from '@/data/cfa.local/question-bank.json';

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

export const CFA_PACKS = [
  { id: 'ethics', title: 'Ethics', subtitle: 'Code, standards, and trust', volume: 'V10' },
  { id: 'quant', title: 'Quantitative Methods', subtitle: 'Rates, statistics, and testing', volume: 'V1' },
  { id: 'economics', title: 'Economics', subtitle: 'Cycles, policy, and markets', volume: 'V2' },
  { id: 'fsa', title: 'Financial Statement Analysis', subtitle: 'Statements, ratios, and models', volume: 'V4' },
  { id: 'corporate', title: 'Corporate Issuers', subtitle: 'Capital, liquidity, and decisions', volume: 'V3' },
  { id: 'equity', title: 'Equity Investments', subtitle: 'Markets, indexes, and shares', volume: 'V5' },
  { id: 'fixed-income', title: 'Fixed Income', subtitle: 'Bonds, yields, and credit', volume: 'V6' },
  { id: 'derivatives', title: 'Derivatives', subtitle: 'Futures, swaps, and options', volume: 'V7' },
  { id: 'alternatives', title: 'Alternative Investments', subtitle: 'Private markets and real assets', volume: 'V8' },
  { id: 'portfolio', title: 'Portfolio Management', subtitle: 'Risk, return, and construction', volume: 'V9' },
] as const;

export function getPrivateCfaRecords(): PrivateCfaRecord[] {
  return privateBank.records?.filter((record) => record.correctOptionId && record.options.length >= 3) ?? [];
}

export function getRecordsForCfaPack(packId: string): PrivateCfaRecord[] {
  const pack = CFA_PACKS.find((item) => item.id === packId);
  if (!pack) return [];
  return getPrivateCfaRecords().filter((record) => record.sourceBook.includes(`L1${pack.volume}`));
}

export function getCfaPackCounts() {
  return CFA_PACKS.map((pack) => ({ ...pack, count: getRecordsForCfaPack(pack.id).length }));
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