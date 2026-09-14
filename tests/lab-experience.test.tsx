import { jest, test, expect } from '@jest/globals';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { LabExperience } from '@/components/labs/LabExperience';
import { LABS } from '@/features/labs/catalog';
import { getTheme as mockGetTheme } from '@/lib/theme';

jest.mock('@/components/ThemeProvider', () => ({ useTheme: () => mockGetTheme('light') }));
jest.mock('@/components/labs/ModelChart', () => ({ ModelChart: () => null }));

test('the lab requires prediction, model interaction and application before the takeaway', async () => {
  const exit = jest.fn();
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => { renderer = TestRenderer.create(<LabExperience lab={LABS[0]} onExit={exit} />); });
  const primary = () => renderer.root.findAllByProps({ accessibilityRole: 'button' }).find((node) => node.props.accessibilityState?.disabled !== undefined && !node.props.accessibilityLabel)!;
  expect(primary().props.accessibilityState.disabled).toBe(true);
  await act(async () => { renderer.root.findAllByProps({ accessibilityRole: 'radio' })[1].props.onPress(); });
  expect(primary().props.accessibilityState.disabled).toBe(false);
  await act(async () => { primary().props.onPress(); });
  expect(primary().props.accessibilityState.disabled).toBe(true);
  await act(async () => { renderer.root.findByProps({ accessibilityLabel: 'Increase Market yield' }).props.onPress(); });
  expect(primary().props.accessibilityState.disabled).toBe(false);
  await act(async () => { primary().props.onPress(); });
  expect(primary().props.accessibilityState.disabled).toBe(true);
  await act(async () => { renderer.root.findAllByProps({ accessibilityRole: 'radio' })[0].props.onPress(); });
  await act(async () => { primary().props.onPress(); });
  expect(JSON.stringify(renderer.toJSON())).toContain('Concept connected.');
  expect(exit).not.toHaveBeenCalled();
  await act(async () => renderer.unmount());
});
