import { TeamMatchStats } from '../types/index.js';
import {
  convolveDistributions,
  generateNegativeBinomialDistribution,
  probOver,
  probUnder,
} from './negative-binomial.js';

export interface ExpectedCornersResult {
  homeCorners: number;
  awayCorners: number;
  totalCorners: number;
  homeDist: number[];
  awayDist: number[];
  totalDist: number[];
  firstHalfDist: number[];
}

/**
 * Calculates expected corners per team using a blend of corners won and opponent corners conceded,
 * home/away split, and team strength gap.
 * Uses Negative Binomial with dispersion r ~ 20.
 */
export function calculateCornersDistribution(
  homeMatches: TeamMatchStats[],
  awayMatches: TeamMatchStats[],
  homeStrengthGap: number = 0, // positive if home is stronger
  leagueAvgCorners: number = 10.2
): ExpectedCornersResult {
  const halfLeagueCorners = leagueAvgCorners / 2;

  // Home corners won & conceded
  let homeWonSum = 0;
  let homeWonCount = 0;
  let homeConcededSum = 0;
  let homeConcededCount = 0;

  homeMatches.slice(0, 10).forEach((m) => {
    // weight home matches higher for home team
    const w = m.isHome ? 1.2 : 0.8;
    homeWonSum += m.cornersFor * w;
    homeWonCount += w;
    homeConcededSum += m.cornersAgainst * w;
    homeConcededCount += w;
  });

  const homeAvgWon = homeWonCount > 0 ? homeWonSum / homeWonCount : halfLeagueCorners;
  const homeAvgConceded = homeConcededCount > 0 ? homeConcededSum / homeConcededCount : halfLeagueCorners;

  // Away corners won & conceded
  let awayWonSum = 0;
  let awayWonCount = 0;
  let awayConcededSum = 0;
  let awayConcededCount = 0;

  awayMatches.slice(0, 10).forEach((m) => {
    const w = !m.isHome ? 1.2 : 0.8;
    awayWonSum += m.cornersFor * w;
    awayWonCount += w;
    awayConcededSum += m.cornersAgainst * w;
    awayConcededCount += w;
  });

  const awayAvgWon = awayWonCount > 0 ? awayWonSum / awayWonCount : halfLeagueCorners;
  const awayAvgConceded = awayConcededCount > 0 ? awayConcededSum / awayConcededCount : halfLeagueCorners;

  // Blend: 55% team corners won, 45% opponent corners conceded
  let expHome = (0.55 * homeAvgWon + 0.45 * awayAvgConceded) + (homeStrengthGap * 0.4);
  let expAway = (0.55 * awayAvgWon + 0.45 * homeAvgConceded) - (homeStrengthGap * 0.4);

  // Bounds check
  expHome = Math.max(2.5, Math.min(10.5, expHome));
  expAway = Math.max(2.0, Math.min(9.5, expAway));

  const totalExp = expHome + expAway;

  // Negative binomial dispersion r = 20 for corners (modelling overdispersion)
  const rCorners = 20;
  const homeDist = generateNegativeBinomialDistribution(expHome, rCorners, 25);
  const awayDist = generateNegativeBinomialDistribution(expAway, rCorners, 25);
  const totalDist = convolveDistributions(homeDist, awayDist);

  // First half corners: ~46% of total corners occur in 1st half
  const expFirstHalf = totalExp * 0.46;
  const firstHalfDist = generateNegativeBinomialDistribution(expFirstHalf, rCorners * 0.8, 15);

  return {
    homeCorners: expHome,
    awayCorners: expAway,
    totalCorners: totalExp,
    homeDist,
    awayDist,
    totalDist,
    firstHalfDist,
  };
}

/**
 * Calculates corner handicap and most corners probability
 */
export function calculateCornerOutcomes(homeDist: number[], awayDist: number[]) {
  let homeMost = 0;
  let drawMost = 0;
  let awayMost = 0;

  for (let h = 0; h < homeDist.length; h++) {
    for (let a = 0; a < awayDist.length; a++) {
      const p = homeDist[h] * awayDist[a];
      if (h > a) homeMost += p;
      else if (h === a) drawMost += p;
      else awayMost += p;
    }
  }

  // Corner Handicap -1.5 (Home -1.5)
  let homeHcapMinus15 = 0;
  for (let h = 0; h < homeDist.length; h++) {
    for (let a = 0; a < awayDist.length; a++) {
      if (h - a > 1.5) homeHcapMinus15 += homeDist[h] * awayDist[a];
    }
  }

  return {
    homeMost,
    drawMost,
    awayMost,
    homeHcapMinus15,
  };
}
