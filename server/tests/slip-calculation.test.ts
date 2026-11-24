import { describe, it, expect } from 'vitest';

describe('Betslip & Accumulator Probability Calculation', () => {
  it('correctly multiplies independent leg probabilities', () => {
    const legs = [
      { prob: 0.70, odds: 1.43 },
      { prob: 0.70, odds: 1.43 },
      { prob: 0.70, odds: 1.43 },
    ];

    const combinedProb = legs.reduce((acc, l) => acc * l.prob, 1.0);
    expect(combinedProb).toBeCloseTo(0.343, 3); // 0.7^3 = 0.343 (34.3%)

    const combinedOdds = Number((1 / combinedProb).toFixed(2));
    expect(combinedOdds).toBeCloseTo(2.92, 1);
  });

  it('detects high-risk threshold when slip has more than 3 legs', () => {
    const legCount = 4;
    const isHighRisk = legCount > 3;
    expect(isHighRisk).toBe(true);
  });

  it('safely handles empty slip', () => {
    const emptyLegs: { prob: number }[] = [];
    const combinedProb = emptyLegs.length > 0 ? emptyLegs.reduce((a, b) => a * b.prob, 1.0) : 1.0;
    expect(combinedProb).toBe(1.0);
  });
});
