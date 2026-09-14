import { jest, test, expect } from '@jest/globals';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { QuizBlock } from '@/components/quiz/QuizBlock';
import { submitQuizAnswer } from '@/features/quiz/api';
import { MOCK_FEED_CARDS } from '@/lib/mockFeed';

jest.mock('@/features/quiz/api', () => ({ submitQuizAnswer: jest.fn() }));
jest.mock('expo-crypto', () => ({ randomUUID: () => 'stable-attempt' }));
jest.mock('expo-haptics', () => ({ notificationAsync: jest.fn(() => Promise.resolve()), NotificationFeedbackType: { Success: 'success', Error: 'error' } }));
const submit = jest.mocked(submitQuizAnswer);
const quizzes = MOCK_FEED_CARDS.flatMap((c) => c.quiz ? [c.quiz] : []);
const result = { correct: true, explanation: 'Explanation', xpAwarded: 5, totalXp: 5, level: 1 };

test('a new question clears the previous answer lock', async () => {
  submit.mockResolvedValue(result);
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => { renderer = TestRenderer.create(<QuizBlock quiz={quizzes[0]} />); });
  await act(async () => { await renderer.root.findAllByProps({ accessibilityRole: 'button' })[0].props.onPress(); });
  expect(renderer.root.findAllByProps({ accessibilityRole: 'button' })[0].props.accessibilityState.disabled).toBe(true);
  await act(async () => { renderer.update(<QuizBlock quiz={quizzes[1]} />); });
  expect(renderer.root.findAllByProps({ accessibilityRole: 'button' })[0].props.accessibilityState.disabled).toBe(false);
  await act(async () => renderer.unmount());
});

test('retry preserves the committed answer and key after a lost response', async () => {
  submit.mockReset();
  submit.mockRejectedValueOnce(new Error('Lost response')).mockResolvedValueOnce(result);
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => { renderer = TestRenderer.create(<QuizBlock quiz={quizzes[0]} />); });
  await act(async () => { await renderer.root.findAllByProps({ accessibilityRole: 'button' })[0].props.onPress(); });
  const firstArgs = submit.mock.calls[0];
  await act(async () => { await renderer.root.findByProps({ accessibilityLabel: 'Retry answer' }).props.onPress(); });
  expect(submit.mock.calls[1]).toEqual(firstArgs);
  await act(async () => renderer.unmount());
});
