import {
  ConfidenceLevel,
  InPlayProbabilities,
  MatchFixture,
  MatchPrediction,
  MarketSelection,
  TeamMatchStats,
} from '../types/index.js';
import { getLeagueById } from '../config/leagues.js';
import { estimateTeamStrengths, generateScorelineMatrix, poissonPm } from './dixon-coles.js';
import { calculateCornersDistribution } from './corners-model.js';
import { calculateCardsDistribution } from './cards-model.js';
import { blendProbabilities, removeMargin } from './odds-blend.js';
import { deriveAllMarkets } from './markets-derivation.js';
import { generateMatchAnalysis } from './analysis-generator.js';

export interface PredictionOptions {
  modelWeight?: number; // 0.0 to 1.0 (default 0.70)
  maxGoals?: number;    // default 10
}

export class PredictionEngine {
  /**
   * Main entry point to predict a match fixture
   */
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

    // Assess data quality and confidence level
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

    // 1. Dixon-Coles goal expectation
    const dcParams = estimateTeamStrengths(
      homeMatches,
      awayMatches,
      leagueGoalAvg,
      homeAdvantage
    );

    // 2. Market Odds Blending
    let finalLambda = dcParams.lambdaHome;
    let finalMu = dcParams.muAway;

    if (fixture.odds && fixture.odds.homeWin && fixture.odds.awayWin) {
      const deoverrounded = removeMargin(fixture.odds);
      if (deoverrounded) {
        // Approximate expected goals implied by market odds:
        // P(Home) / P(Away) ~ lambda / mu
        const marketRatio = deoverrounded.homeProb / Math.max(0.05, deoverrounded.awayProb);
        const modelRatio = dcParams.lambdaHome / Math.max(0.05, dcParams.muAway);
        const blendedRatio = modelWeight * modelRatio + (1 - modelWeight) * marketRatio;

        const totalExpectedGoals = dcParams.lambdaHome + dcParams.muAway;
        finalLambda = (blendedRatio / (blendedRatio + 1)) * totalExpectedGoals;
        finalMu = totalExpectedGoals - finalLambda;
      }
    }

    // 3. Generate 11x11 scoreline matrix (0 to 10 goals each)
    const scorelineMatrix = generateScorelineMatrix(finalLambda, finalMu, maxGoals, -0.11);

    // 4. Corners Model (Negative Binomial)
    const strengthGap = (dcParams.homeAttack - dcParams.awayDefense);
    const cornersResult = calculateCornersDistribution(
      homeMatches,
      awayMatches,
      strengthGap,
      leagueCornersAvg
    );

    // 5. Cards Model (Negative Binomial)
    const closenessFactor = Math.abs(finalLambda - finalMu) < 0.3 ? 1.15 : 1.0;
    const cardsResult = calculateCardsDistribution(
      homeMatches,
      awayMatches,
      closenessFactor,
      undefined,
      leagueCardsAvg
    );

    // 6. Derive All Major SportyBet-style Betting Markets
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

    // 7. Generate Plain English Analysis & Key Insights
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

    // 8. Select 3-4 Varied Picks (Distinct Market Categories)
    // One primary 1X2 or Double Chance
    const resultCandidates = [
      ...markets.doubleChance.selections,
      ...markets.result1X2.selections,
    ].sort((a, b) => b.probability - a.probability);
    const primaryResult = resultCandidates.find((p) => p.probability >= 0.50) || resultCandidates[0];

    // One over/under (goals or corners)
    const overUnderCandidates = [
      ...markets.totalGoals.selections.filter((s) => ['Over 1.5', 'Over 2.5', 'Under 3.5'].includes(s.outcome)),
      ...markets.cornersTotal.selections.filter((s) => ['Over 7.5', 'Over 8.5', 'Over 9.5'].includes(s.outcome)),
    ].sort((a, b) => b.probability - a.probability);
    const primaryOverUnder = overUnderCandidates.find((p) => p.probability >= 0.55 && p.probability <= 0.88) || overUnderCandidates[0];

    // One combo or BTTS
    const comboCandidates = [
      ...markets.bttsCombos.selections,
      ...markets.btts.selections,
    ].sort((a, b) => b.probability - a.probability);
    const primaryCombo = comboCandidates.find((p) => p.probability >= 0.45 && p.probability <= 0.85) || comboCandidates[0];

    // One value pick (where fair odds < market odds, or highest edge)
    const allMarketSelections: MarketSelection[] = Object.values(markets).flatMap((m) => m.selections);
    const valuePicks = allMarketSelections
      .filter((s) => s.edge && s.edge > 0.03 && s.probability >= 0.35)
      .sort((a, b) => (b.edge || 0) - (a.edge || 0));
    const primaryValue = valuePicks[0];

    const topPicks: MarketSelection[] = [];
    if (primaryResult) topPicks.push(primaryResult);
    if (primaryOverUnder && !topPicks.some((p) => p.name === primaryOverUnder.name)) topPicks.push(primaryOverUnder);
    if (primaryCombo && !topPicks.some((p) => p.name === primaryCombo.name)) topPicks.push(primaryCombo);
    if (primaryValue && !topPicks.some((p) => p.name === primaryValue.name) && topPicks.length < 4) {
      topPicks.push(primaryValue);
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

  /**
   * In-play probability calculation based on Dixon-Coles Poisson remaining time model
   */
  public static calculateInPlayProbabilities(
    currentHomeScore: number,
    currentAwayScore: number,
    minute: number,
    expectedHomeGoalsFull: number = 1.45,
    expectedAwayGoalsFull: number = 1.15
  ): InPlayProbabilities {
    if (minute >= 90) {
      if (currentHomeScore > currentAwayScore) {
        return { homeProb: 1.0, drawProb: 0.0, awayProb: 0.0, fairOddsHome: 1.01, fairOddsDraw: 100, fairOddsAway: 100, label: 'Full Time' };
      } else if (currentHomeScore < currentAwayScore) {
        return { homeProb: 0.0, drawProb: 0.0, awayProb: 1.0, fairOddsHome: 100, fairOddsDraw: 100, fairOddsAway: 1.01, label: 'Full Time' };
      } else {
        return { homeProb: 0.0, drawProb: 1.0, awayProb: 0.0, fairOddsHome: 100, fairOddsDraw: 1.01, fairOddsAway: 100, label: 'Full Time' };
      }
    }

    const remainingFraction = Math.max(0.02, (90 - Math.min(minute, 89)) / 90);
    const remLambda = Math.max(0.01, expectedHomeGoalsFull * remainingFraction);
    const remMu = Math.max(0.01, expectedAwayGoalsFull * remainingFraction);

    let pHome = 0;
    let pDraw = 0;
    let pAway = 0;

    for (let gH = 0; gH <= 6; gH++) {
      for (let gA = 0; gA <= 6; gA++) {
        const pJoint = poissonPm(remLambda, gH) * poissonPm(remMu, gA);
        const finalH = currentHomeScore + gH;
        const finalA = currentAwayScore + gA;

        if (finalH > finalA) {
          pHome += pJoint;
        } else if (finalH === finalA) {
          pDraw += pJoint;
        } else {
          pAway += pJoint;
        }
      }
    }

    const total = pHome + pDraw + pAway;
    const normHome = total > 0 ? pHome / total : 0.33;
    const normDraw = total > 0 ? pDraw / total : 0.33;
    const normAway = total > 0 ? pAway / total : 0.34;

    return {
      homeProb: Number(normHome.toFixed(4)),
      drawProb: Number(normDraw.toFixed(4)),
      awayProb: Number(normAway.toFixed(4)),
      fairOddsHome: Number(Math.min(100, 1 / Math.max(0.01, normHome)).toFixed(2)),
      fairOddsDraw: Number(Math.min(100, 1 / Math.max(0.01, normDraw)).toFixed(2)),
      fairOddsAway: Number(Math.min(100, 1 / Math.max(0.01, normAway)).toFixed(2)),
      label: 'Live probability',
    };
  }
}
