import {
  ConfidenceLevel,
  MatchFixture,
  MatchPrediction,
  MarketSelection,
  TeamMatchStats,
} from '../types';
import { getLeagueById } from '../config/leagues';
import { estimateTeamStrengths, generateScorelineMatrix } from './dixon-coles';
import { calculateCornersDistribution } from './corners-model';
import { calculateCardsDistribution } from './cards-model';
import { removeMargin } from './odds-blend';
import { deriveAllMarkets } from './markets-derivation';
import { generateMatchAnalysis } from './analysis-generator';

export interface PredictionOptions {
  modelWeight?: number;
  maxGoals?: number;
}

export class PredictionEngine {
  public static predict(
    fixture: MatchFixture,
    homeMatches: TeamMatchStats[],
    awayMatches: TeamMatchStats[],
    h2hMatches: MatchFixture[] = [],
    options: PredictionOptions = {}
  ): MatchPrediction {
    const league = getLeagueById(fixture.leagueId);
    const leagueGoalAvg = league?.defaultLeagueAvgGoals ?? 2.75;
    const homeAdvantage = league?.defaultHomeAdvantage ?? 1.25;
    const leagueCornersAvg = league?.defaultLeagueAvgCorners ?? 10.2;
    const leagueCardsAvg = league?.defaultLeagueAvgCards ?? 4.2;

    const modelWeight = options.modelWeight ?? 0.70;
    const maxGoals = options.maxGoals ?? 10;

    let confidence: ConfidenceLevel = 'High';
    let confidenceReason = 'Robust sample size (10+ recent matches with complete statistics)';

    const minMatches = Math.min(homeMatches.length, awayMatches.length);
    if (minMatches < 4) {
      confidence = 'Low';
      confidenceReason = 'Limited recent match history; falling back to league baseline averages.';
    } else if (minMatches < 8) {
      confidence = 'Medium';
      confidenceReason = 'Moderate match history available; predictions partially weighted to league norms.';
    }

    const dcParams = estimateTeamStrengths(
      homeMatches,
      awayMatches,
      leagueGoalAvg,
      homeAdvantage
    );

    let finalLambda = dcParams.lambdaHome;
    let finalMu = dcParams.muAway;

    if (fixture.odds && fixture.odds.homeWin && fixture.odds.awayWin) {
      const deoverrounded = removeMargin(fixture.odds);
      if (deoverrounded) {
        const marketRatio = deoverrounded.homeProb / Math.max(0.05, deoverrounded.awayProb);
        const modelRatio = dcParams.lambdaHome / Math.max(0.05, dcParams.muAway);
        const blendedRatio = modelWeight * modelRatio + (1 - modelWeight) * marketRatio;

        const totalExpectedGoals = dcParams.lambdaHome + dcParams.muAway;
        finalLambda = (blendedRatio / (blendedRatio + 1)) * totalExpectedGoals;
        finalMu = totalExpectedGoals - finalLambda;
      }
    }

    const scorelineMatrix = generateScorelineMatrix(finalLambda, finalMu, maxGoals, -0.11);
    const strengthGap = dcParams.homeAttack - dcParams.awayDefense;
    const cornersResult = calculateCornersDistribution(
      homeMatches,
      awayMatches,
      strengthGap,
      leagueCornersAvg
    );

    const closenessFactor = Math.abs(finalLambda - finalMu) < 0.3 ? 1.15 : 1.0;
    const cardsResult = calculateCardsDistribution(
      homeMatches,
      awayMatches,
      closenessFactor,
      undefined,
      leagueCardsAvg
    );

    const markets = deriveAllMarkets(
      scorelineMatrix,
      cornersResult,
      cardsResult,
      confidence,
      fixture.homeTeam.name,
      fixture.awayTeam.name,
      fixture.odds,
      finalLambda,
      finalMu
    );

    const analysis = generateMatchAnalysis(
      fixture,
      homeMatches,
      awayMatches,
      dcParams,
      cornersResult,
      cardsResult,
      scorelineMatrix,
      h2hMatches
    );

    const candidatePicks: MarketSelection[] = [
      ...markets.doubleChance.selections,
      ...markets.totalGoals.selections.filter((s) => s.outcome === 'Over 1.5' || s.outcome === 'Over 2.5' || s.outcome === 'Under 3.5'),
      ...markets.btts.selections,
      ...markets.cornersTotal.selections.filter((s) => s.outcome === 'Over 7.5' || s.outcome === 'Over 8.5'),
      ...markets.result1X2.selections,
    ];

    const filteredCandidates = candidatePicks.filter(
      (p) => p.probability >= 0.55 && p.probability <= 0.88
    );

    const sortedByProb = (filteredCandidates.length >= 3 ? filteredCandidates : candidatePicks)
      .sort((a, b) => b.probability - a.probability);

    const topPicks: MarketSelection[] = [];
    const usedOutcomes = new Set<string>();

    for (const pick of sortedByProb) {
      const baseKey = pick.outcome.split(' ')[0];
      if (!usedOutcomes.has(baseKey)) {
        topPicks.push(pick);
        usedOutcomes.add(baseKey);
      }
      if (topPicks.length >= 3) break;
    }

    if (topPicks.length < 3) {
      topPicks.push(...sortedByProb.slice(0, 3 - topPicks.length));
    }

    return {
      matchId: fixture.id,
      fixture,
      lastUpdated: new Date().toISOString(),
      confidence,
      confidenceReason,
      topPicks,
      analysis,
      markets,
      scorelineMatrix,
    };
  }
}
