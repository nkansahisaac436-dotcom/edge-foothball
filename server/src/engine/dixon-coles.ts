import { TeamMatchStats } from '../types/index.js';

// Precomputed log-factorials for fast Poisson calculation
const LOG_FACTORIALS: number[] = [0];
for (let i = 1; i <= 25; i++) {
  LOG_FACTORIALS[i] = LOG_FACTORIALS[i - 1] + Math.log(i);
}

export function poissonPm(lambda: number, k: number): number {
  if (k < 0 || lambda <= 0) return k === 0 ? 1 : 0;
  if (k >= LOG_FACTORIALS.length) {
    // Stirling approximation for very large k if needed
    return 0;
  }
  return Math.exp(-lambda + k * Math.log(lambda) - LOG_FACTORIALS[k]);
}

/**
 * Dixon-Coles low-score correlation adjustment factor tau(x, y)
 * Corrects for the empirical under-prediction of 0-0, 1-0, 0-1 and over-prediction of 1-1 in independent Poisson.
 * rho is typically between -0.10 and -0.13.
 */
export function dixonColesTau(x: number, y: number, lambda: number, mu: number, rho: number = -0.11): number {
  if (x === 0 && y === 0) {
    return 1 - lambda * mu * rho;
  } else if (x === 0 && y === 1) {
    return 1 + lambda * rho;
  } else if (x === 1 && y === 0) {
    return 1 + mu * rho;
  } else if (x === 1 && y === 1) {
    return 1 - rho;
  }
  return 1.0;
}

export interface DixonColesParameters {
  homeAttack: number;
  homeDefense: number;
  awayAttack: number;
  awayDefense: number;
  homeAdvantage: number;
  leagueGoalAvg: number;
  lambdaHome: number; // expected home goals
  muAway: number;     // expected away goals
}

/**
 * Computes exponentially weighted attack and defense ratings from recent matches.
 * Decay parameter xi (half-life of approx 60-90 days, or decay factor ~0.92 per match)
 */
export function estimateTeamStrengths(
  homeMatches: TeamMatchStats[],
  awayMatches: TeamMatchStats[],
  leagueGoalAvg: number = 2.75,
  homeAdvantage: number = 1.25,
  decayFactor: number = 0.92
): DixonColesParameters {
  const halfLeagueAvg = leagueGoalAvg / 2;

  // Weight home team matches
  let homeGfWeighted = 0;
  let homeGaWeighted = 0;
  let homeWeightSum = 0;

  homeMatches.forEach((m, idx) => {
    const weight = Math.pow(decayFactor, idx);
    // Home matches get natural home adv, away matches get deflated
    const locationAdj = m.isHome ? 1.0 : (1.0 / homeAdvantage);
    homeGfWeighted += (m.goalsFor * locationAdj) * weight;
    homeGaWeighted += (m.goalsAgainst / locationAdj) * weight;
    homeWeightSum += weight;
  });

  const homeGfPerMatch = homeWeightSum > 0 ? homeGfWeighted / homeWeightSum : halfLeagueAvg;
  const homeGaPerMatch = homeWeightSum > 0 ? homeGaWeighted / homeWeightSum : halfLeagueAvg;

  // Weight away team matches
  let awayGfWeighted = 0;
  let awayGaWeighted = 0;
  let awayWeightSum = 0;

  awayMatches.forEach((m, idx) => {
    const weight = Math.pow(decayFactor, idx);
    const locationAdj = !m.isHome ? 1.0 : homeAdvantage;
    awayGfWeighted += (m.goalsFor / locationAdj) * weight;
    awayGaWeighted += (m.goalsAgainst * locationAdj) * weight;
    awayWeightSum += weight;
  });

  const awayGfPerMatch = awayWeightSum > 0 ? awayGfWeighted / awayWeightSum : halfLeagueAvg;
  const awayGaPerMatch = awayWeightSum > 0 ? awayGaWeighted / awayWeightSum : halfLeagueAvg;

  // Attack & defense ratings relative to league average
  // Lower defense rating means better defense (concedes fewer goals)
  const homeAttack = Math.max(0.5, Math.min(2.5, homeGfPerMatch / halfLeagueAvg));
  const homeDefense = Math.max(0.4, Math.min(2.5, homeGaPerMatch / halfLeagueAvg));

  const awayAttack = Math.max(0.5, Math.min(2.5, awayGfPerMatch / halfLeagueAvg));
  const awayDefense = Math.max(0.4, Math.min(2.5, awayGaPerMatch / halfLeagueAvg));

  // Dixon-Coles expected goals
  // lambda = homeAttack * awayDefense * homeAdvantage * halfLeagueAvg
  // mu = awayAttack * homeDefense * halfLeagueAvg
  let lambdaHome = homeAttack * awayDefense * homeAdvantage * (halfLeagueAvg / 1.0);
  let muAway = awayAttack * homeDefense * (halfLeagueAvg / 1.0);

  // Safety clamps (realistic football expected goals)
  lambdaHome = Math.max(0.35, Math.min(5.5, lambdaHome));
  muAway = Math.max(0.25, Math.min(4.8, muAway));

  return {
    homeAttack,
    homeDefense,
    awayAttack,
    awayDefense,
    homeAdvantage,
    leagueGoalAvg,
    lambdaHome,
    muAway,
  };
}

/**
 * Builds the full 11x11 scoreline probability matrix (scores 0-0 up to 10-10)
 * with Dixon-Coles low-score adjustment and exact normalization (sum = 1.0).
 */
export function generateScorelineMatrix(
  lambda: number,
  mu: number,
  maxGoals: number = 10,
  rho: number = -0.11
): number[][] {
  const matrix: number[][] = [];
  let totalProb = 0;

  // Calculate unnormalized probabilities
  for (let h = 0; h <= maxGoals; h++) {
    matrix[h] = [];
    const pH = poissonPm(lambda, h);
    for (let a = 0; a <= maxGoals; a++) {
      const pA = poissonPm(mu, a);
      const tau = dixonColesTau(h, a, lambda, mu, rho);
      const prob = Math.max(0, tau * pH * pA);
      matrix[h][a] = prob;
      totalProb += prob;
    }
  }

  // Normalize so sum across the entire matrix is exactly 1.0
  if (totalProb > 0) {
    for (let h = 0; h <= maxGoals; h++) {
      for (let a = 0; a <= maxGoals; a++) {
        matrix[h][a] = matrix[h][a] / totalProb;
      }
    }
  }

  return matrix;
}
