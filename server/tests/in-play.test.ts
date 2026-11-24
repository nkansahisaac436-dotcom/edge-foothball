import { describe, it, expect } from 'vitest';
import { PredictionEngine } from '../src/engine/prediction-engine.js';

describe('In-Play Live Dixon-Coles Poisson Model', () => {
  it('should increase home win probability when home team leads 2-0 at 75th minute', () => {
    const liveProbLeading = PredictionEngine.calculateInPlayProbabilities(2, 0, 75, 1.45, 1.15);
    const preMatchProb = PredictionEngine.calculateInPlayProbabilities(0, 0, 1, 1.45, 1.15);

    expect(liveProbLeading.homeProb).toBeGreaterThan(0.85);
    expect(liveProbLeading.awayProb).toBeLessThan(0.05);
    expect(liveProbLeading.homeProb).toBeGreaterThan(preMatchProb.homeProb);
    expect(liveProbLeading.label).toBe('Live probability');
  });

  it('should calculate draw as high probability when tied 1-1 at 85th minute', () => {
    const tiedLate = PredictionEngine.calculateInPlayProbabilities(1, 1, 85, 1.45, 1.15);
    expect(tiedLate.drawProb).toBeGreaterThan(0.60);
    expect(tiedLate.fairOddsDraw).toBeLessThan(1.70);
  });

  it('should return 100% certainty for winning team when minute is 90+ (FT)', () => {
    const finishedMatch = PredictionEngine.calculateInPlayProbabilities(3, 1, 90, 1.45, 1.15);
    expect(finishedMatch.homeProb).toBe(1.0);
    expect(finishedMatch.drawProb).toBe(0.0);
    expect(finishedMatch.awayProb).toBe(0.0);
    expect(finishedMatch.label).toBe('Full Time');
  });

  it('should ensure probabilities sum to approximately 1.0', () => {
    const res = PredictionEngine.calculateInPlayProbabilities(1, 0, 55, 1.5, 1.2);
    const sum = res.homeProb + res.drawProb + res.awayProb;
    expect(sum).toBeCloseTo(1.0, 2);
  });
});
