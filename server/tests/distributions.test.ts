import { describe, it, expect } from 'vitest';
import {
  convolveDistributions,
  generateNegativeBinomialDistribution,
  negativeBinomialPmf,
  probOver,
  probUnder,
} from '../src/engine/negative-binomial.js';
import { calculateCornersDistribution } from '../src/engine/corners-model.js';
import { calculateCardsDistribution } from '../src/engine/cards-model.js';

describe('Negative Binomial Distributions (Corners and Cards)', () => {
  it('computes Negative Binomial PMF and normalizes distribution to sum to 1.0', () => {
    const mu = 5.0;
    const r = 15;
    const dist = generateNegativeBinomialDistribution(mu, r, 25);

    expect(dist.length).toBe(26);
    let sum = 0;
    dist.forEach((p) => {
      expect(p).toBeGreaterThanOrEqual(0);
      sum += p;
    });

    expect(sum).toBeCloseTo(1.0, 5);
  });

  it('convolves independent team distributions properly', () => {
    const distA = generateNegativeBinomialDistribution(5.0, 20, 20);
    const distB = generateNegativeBinomialDistribution(4.5, 20, 20);
    const convolved = convolveDistributions(distA, distB);

    let sum = 0;
    convolved.forEach((p) => (sum += p));
    expect(sum).toBeCloseTo(1.0, 4);

    // Over 7.5 total corners
    const pOver75 = probOver(convolved, 7.5);
    const pUnder75 = probUnder(convolved, 7.5);
    expect(pOver75 + pUnder75).toBeCloseTo(1.0, 2);
    expect(pOver75).toBeGreaterThan(0.5); // Mean is ~9.5, so > 7.5 should be > 50%
  });

  it('calculates corners model with team statistics and home advantage', () => {
    const mockHomeMatches = [
      { matchId: 1, date: '2024-01-01', isHome: true, opponentId: 2, opponentName: 'O1', goalsFor: 2, goalsAgainst: 1, cornersFor: 8, cornersAgainst: 3, yellowCards: 1, redCards: 0 },
      { matchId: 2, date: '2024-01-05', isHome: true, opponentId: 3, opponentName: 'O2', goalsFor: 1, goalsAgainst: 0, cornersFor: 7, cornersAgainst: 2, yellowCards: 2, redCards: 0 },
    ];
    const mockAwayMatches = [
      { matchId: 3, date: '2024-01-01', isHome: false, opponentId: 4, opponentName: 'O3', goalsFor: 0, goalsAgainst: 1, cornersFor: 3, cornersAgainst: 7, yellowCards: 3, redCards: 0 },
    ];

    const corners = calculateCornersDistribution(mockHomeMatches, mockAwayMatches, 0.5);

    expect(corners.homeCorners).toBeGreaterThan(corners.awayCorners);
    expect(corners.totalCorners).toBeGreaterThan(6.0);
    expect(corners.totalDist.length).toBeGreaterThan(20);
  });

  it('calculates cards model with expected disciplinary factors', () => {
    const mockHomeMatches = [
      { matchId: 1, date: '2024-01-01', isHome: true, opponentId: 2, opponentName: 'O1', goalsFor: 1, goalsAgainst: 1, cornersFor: 5, cornersAgainst: 4, yellowCards: 3, redCards: 1 },
    ];
    const mockAwayMatches = [
      { matchId: 2, date: '2024-01-01', isHome: false, opponentId: 3, opponentName: 'O2', goalsFor: 0, goalsAgainst: 0, cornersFor: 4, cornersAgainst: 5, yellowCards: 4, redCards: 0 },
    ];

    const cards = calculateCardsDistribution(mockHomeMatches, mockAwayMatches, 1.2);
    expect(cards.totalCards).toBeGreaterThan(3.5);
    expect(cards.totalDist.length).toBeGreaterThan(15);
  });
});
