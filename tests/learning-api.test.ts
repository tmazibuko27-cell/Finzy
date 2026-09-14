import { jest, test, expect, beforeEach } from '@jest/globals';
jest.mock('@/lib/supabase', () => ({ supabase: { rpc: jest.fn() } }));
import { supabase } from '@/lib/supabase';
import { fetchFeedPage } from '@/features/feed/api';
import { submitQuizAnswer } from '@/features/quiz/api';
import { MOCK_FEED_CARDS } from '@/lib/mockFeed';

const rpc = supabase!.rpc as unknown as jest.Mock<(...args: unknown[]) => Promise<{ data: unknown; error: Error | null }>>;
const quiz = MOCK_FEED_CARDS.find((card) => card.quiz)!.quiz!;
beforeEach(() => { rpc.mockReset(); });

test('live quiz failures never return demo correctness or XP', async () => {
  rpc.mockResolvedValue({ data: null, error: new Error('Offline') });
  await expect(submitQuizAnswer(quiz, 'a', 'retry-key')).rejects.toThrow('Offline');
});

test('empty quiz responses are failures, not locally scored answers', async () => {
  rpc.mockResolvedValue({ data: null, error: null });
  await expect(submitQuizAnswer(quiz, 'a', 'retry-key')).rejects.toThrow('no result');
});

test('server result and caller idempotency key are preserved', async () => {
  const result = { correct: true, xpAwarded: 0, totalXp: 12, level: 1, explanation: 'Already answered' };
  rpc.mockResolvedValue({ data: result, error: null });
  await expect(submitQuizAnswer(quiz, 'a', 'retry-key')).resolves.toEqual(result);
  expect(rpc).toHaveBeenCalledWith('submit_quiz_answer', expect.objectContaining({ idempotency_key: 'retry-key' }));
});

test('live feed failures do not inject synthetic cards', async () => {
  rpc.mockResolvedValue({ data: null, error: new Error('Offline') });
  await expect(fetchFeedPage(null)).rejects.toThrow('Offline');
});
