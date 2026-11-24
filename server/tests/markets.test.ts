import { describe, it, expect } from 'vitest';
import { generateScorelineMatrix } from '../src/engine/dixon-coles.js';
import { deriveAllMarkets } from '../src/engine/markets-derivation.js';
import { calculateCornersDistribution } from '../src/engine/corners-model.js';
import { calculateCardsDistribution } from '../src/engine/cards-model.js';

describe('Markets Derivation and Betting Consistency', () => {
  const matrix = generateScorelineMatrix(1.75, 1.15, 10);
  const cornersResult = calculateCornersDistribution([], [], 0);
  const cardsResult = calculateCardsDistribution([], [], 1.0);

  const markets = deriveAllMarkets(
    matrix,
    cornersResult,
    cardsResult,
    'High',
    'Arsenal',
    'Chelsea'
  );

  it('1X2 probabilities sum to 1.0', () => {
    const home = markets.result1X2.selections.find((s) => s.outcome === '1')!.probability;
    const draw = markets.result1X2.selections.find((s) => s.outcome === 'X')!.probability;
    const away = markets.result1X2.selections.find((s) => s.outcome === '2')!.probability;

    expect(home + draw + away).toBeCloseTo(1.0, 4);
    expect(home).toBeGreaterThan(0);
    expect(draw).toBeGreaterThan(0);
    expect(away).toBeGreaterThan(0);
  });

  it('Double Chance selections equal component sums', () => {
    const home = markets.result1X2.selections.find((s) => s.outcome === '1')!.probability;
    const draw = markets.result1X2.selections.find((s) => s.outcome === 'X')!.probability;
    const away = markets.result1X2.selections.find((s) => s.outcome === '2')!.probability;

    const p1X = markets.doubleChance.selections.find((s) => s.outcome === '1X')!.probability;
    const pX2 = markets.doubleChance.selections.find((s) => s.outcome === 'X2')!.probability;
    const p12 = markets.doubleChance.selections.find((s) => s.outcome === '12')!.probability;

    expect(p1X).toBeCloseTo(home + draw, 4);
    expect(pX2).toBeCloseTo(draw + away, 4);
    expect(p12).toBeCloseTo(home + away, 4);
  });

  it('Total Goals Over 2.5 + Under 2.5 sums to 1.0', () => {
    const over25 = markets.totalGoals.selections.find((s) => s.outcome === 'Over 2.5')!.probability;
    const under25 = markets.totalGoals.selections.find((s) => s.outcome === 'Under 2.5')!.probability;

    expect(over25 + under25).toBeCloseTo(1.0, 4);
  });

  it('BTTS Yes + No sums to 1.0', () => {
    const yes = markets.btts.selections.find((s) => s.outcome === 'Yes')!.probability;
    const no = markets.btts.selections.find((s) => s.outcome === 'No')!.probability;

    expect(yes + no).toBeCloseTo(1.0, 4);
  });

  it('Odd + Even total goals sums to 1.0', () => {
    const odd = markets.oddEven.selections.find((s) => s.outcome === 'Odd')!.probability;
    const even = markets.oddEven.selections.find((s) => s.outcome === 'Even')!.probability;

    expect(odd + even).toBeCloseTo(1.0, 4);
  });

  it('Corners over 7.5 selection is present and marked', () => {
    const over75 = markets.cornersTotal.selections.find((s) => s.outcome === 'Over 7.5');
    expect(over75).toBeDefined();
    expect(over75!.probability).toBeGreaterThan(0.4);
    expect(over75!.isEstimate).toBe(true);
  });

  it('Cards total lines are valid', () => {
    const over35Cards = markets.cardsTotal.selections.find((s) => s.outcome === 'Over 3.5');
    expect(over35Cards).toBeDefined();
    expect(over35Cards!.probability).toBeGreaterThan(0);
    expect(over35Cards!.fairOdds).toBeGreaterThan(1.0);
  });
});
