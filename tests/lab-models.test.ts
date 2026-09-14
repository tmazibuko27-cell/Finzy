import { test, expect } from '@jest/globals';
import { bondPrice, compoundValue, equityValue } from '@/features/labs/models';
import { LABS } from '@/features/labs/catalog';
import { searchLocalContent } from '@/features/discover/search';

test('a fixed coupon bond trades at par when coupon equals yield', () => {
  expect(bondPrice(5)).toBeCloseTo(1000, 8);
});
test('bond cash flows reprice inversely to yield, including zero yield', () => {
  expect(bondPrice(7)).toBeCloseTo(917.9961, 3);
  expect(bondPrice(3)).toBeGreaterThan(1000);
  expect(bondPrice(0)).toBe(1250);
  expect(bondPrice(5, 1)).toBeCloseTo(1000, 8);
});
test('compound growth has correct baseline and accelerates at a positive constant rate', () => {
  expect(compoundValue(0)).toBe(1000);
  expect(compoundValue(20)).toBeCloseTo(3869.6845, 3);
  expect(compoundValue(30) - compoundValue(20)).toBeGreaterThan(compoundValue(10) - compoundValue(0));
  expect(compoundValue(20, 0)).toBe(1000);
});
test('the equity bridge offsets equal increases in cash and debt', () => {
  expect(equityValue(1000, 200, 100)).toBe(900);
  expect(equityValue(1000, 400, 100)).toBe(700);
  expect(equityValue(1000, 300, 200)).toBe(900);
});
test('invalid model inputs fail explicitly', () => {
  expect(() => bondPrice(NaN)).toThrow();
  expect(() => bondPrice(5, 1.5)).toThrow();
  expect(() => compoundValue(-1)).toThrow();
  expect(() => equityValue(1000, -100, 0)).toThrow();
});
test('every available lab produces finite chart values and searchable results', () => {
  for (const lab of LABS) {
    for (let value = lab.min; value <= lab.max; value += lab.step) expect(Number.isFinite(lab.calculate(value))).toBe(true);
    expect(searchLocalContent(lab.title)).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'lab', slug: lab.slug })]));
  }
});
