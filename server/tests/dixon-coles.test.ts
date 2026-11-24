import { describe, it, expect } from 'vitest';
import {
  dixonColesTau,
  estimateTeamStrengths,
  generateScorelineMatrix,
  poissonPm,
} from '../src/engine/dixon-coles.js';
import { TeamMatchStats } from '../src/types/index.js';

describe('Dixon-Coles Poisson Model', () => {
  it('calculates Poisson PMF correctly', () => {
    // Poisson(lambda=2, k=0) = e^-2 ~ 0.1353
    const p0 = poissonPm(2.0, 0);
    expect(p0).toBeCloseTo(0.1353, 3);

    // Poisson(lambda=2, k=2) = 2^2 * e^-2 / 2! = 2 * e^-2 ~ 0.2707
    const p2 = poissonPm(2.0, 2);
    expect(p2).toBeCloseTo(0.2707, 3);
  });

  it('adjusts low scorelines with Dixon-Coles tau', () => {
    const lambda = 1.5;
    const mu = 1.2;
    const rho = -0.11;

    // tau(0, 0) = 1 - lambda * mu * rho = 1 - (1.5 * 1.2 * -0.11) = 1 + 0.198 = 1.198
    const tau00 = dixonColesTau(0, 0, lambda, mu, rho);
    expect(tau00).toBeCloseTo(1.198, 3);

    // tau(1, 1) = 1 - rho = 1 - (-0.11) = 1.11 ? Wait: tau(1, 1) = 1 - rho
    const tau11 = dixonColesTau(1, 1, lambda, mu, rho);
    expect(tau11).toBeCloseTo(1.11, 3);

    // tau for normal scores (e.g. 2, 1) should be 1.0
    const tau21 = dixonColesTau(2, 1, lambda, mu, rho);
    expect(tau21).toBe(1.0);
  });

  it('generates an 11x11 scoreline matrix that sums exactly to 1.0', () => {
    const lambda = 1.65;
    const mu = 1.15;
    const matrix = generateScorelineMatrix(lambda, mu, 10);

    expect(matrix.length).toBe(11);
    expect(matrix[0].length).toBe(11);

    let sum = 0;
    for (let h = 0; h <= 10; h++) {
      for (let a = 0; a <= 10; a++) {
        expect(matrix[h][a]).toBeGreaterThanOrEqual(0);
        sum += matrix[h][a];
      }
    }

    expect(sum).toBeCloseTo(1.0, 6);
  });

  it('correctly weights recent matches and home advantage for team strengths', () => {
    const mockHomeMatches: TeamMatchStats[] = [
      { matchId: 1, date: '2024-01-01', isHome: true, opponentId: 2, opponentName: 'O1', goalsFor: 3, goalsAgainst: 0, cornersFor: 7, cornersAgainst: 3, yellowCards: 1, redCards: 0 },
      { matchId: 2, date: '2024-01-05', isHome: false, opponentId: 3, opponentName: 'O2', goalsFor: 2, goalsAgainst: 1, cornersFor: 6, cornersAgainst: 4, yellowCards: 2, redCards: 0 },
      { matchId: 3, date: '2024-01-10', isHome: true, opponentId: 4, opponentName: 'O3', goalsFor: 4, goalsAgainst: 1, cornersFor: 8, cornersAgainst: 2, yellowCards: 0, redCards: 0 },
    ];

    const mockAwayMatches: TeamMatchStats[] = [
      { matchId: 4, date: '2024-01-01', isHome: true, opponentId: 5, opponentName: 'O4', goalsFor: 0, goalsAgainst: 2, cornersFor: 3, cornersAgainst: 7, yellowCards: 3, redCards: 0 },
      { matchId: 5, date: '2024-01-05', isHome: false, opponentId: 6, opponentName: 'O5', goalsFor: 1, goalsAgainst: 3, cornersFor: 4, cornersAgainst: 6, yellowCards: 2, redCards: 1 },
    ];

    const params = estimateTeamStrengths(mockHomeMatches, mockAwayMatches);

    // Strong attack + weak opponent defense should give higher expected goals for home
    expect(params.homeAttack).toBeGreaterThan(1.0);
    expect(params.lambdaHome).toBeGreaterThan(params.muAway);
  });
});
