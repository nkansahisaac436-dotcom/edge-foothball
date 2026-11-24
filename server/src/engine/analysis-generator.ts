import { FormRecord, MatchAnalysis, MatchFixture, TeamMatchStats } from '../types/index.js';
import { DixonColesParameters } from './dixon-coles.js';
import { ExpectedCornersResult } from './corners-model.js';
import { ExpectedCardsResult } from './cards-model.js';

export function generateMatchAnalysis(
  fixture: MatchFixture,
  homeMatches: TeamMatchStats[],
  awayMatches: TeamMatchStats[],
  dcParams: DixonColesParameters,
  cornersResult: ExpectedCornersResult,
  cardsResult: ExpectedCardsResult,
  scorelineMatrix: number[][],
  h2hMatches: MatchFixture[] = []
): MatchAnalysis {
  const homeName = fixture.homeTeam.name;
  const awayName = fixture.awayTeam.name;

  // Extract last 5 form records
  const homeForm: FormRecord[] = homeMatches.slice(0, 5).map((m) => {
    let result: 'W' | 'D' | 'L' = 'D';
    if (m.goalsFor > m.goalsAgainst) result = 'W';
    else if (m.goalsFor < m.goalsAgainst) result = 'L';
    return {
      result,
      opponent: m.opponentName,
      score: `${m.goalsFor}-${m.goalsAgainst}`,
      date: m.date,
      isHome: m.isHome,
    };
  });

  const awayForm: FormRecord[] = awayMatches.slice(0, 5).map((m) => {
    let result: 'W' | 'D' | 'L' = 'D';
    if (m.goalsFor > m.goalsAgainst) result = 'W';
    else if (m.goalsFor < m.goalsAgainst) result = 'L';
    return {
      result,
      opponent: m.opponentName,
      score: `${m.goalsFor}-${m.goalsAgainst}`,
      date: m.date,
      isHome: m.isHome,
    };
  });

  // Most likely scoreline
  let bestH = 1;
  let bestA = 1;
  let maxP = 0;
  for (let h = 0; h < scorelineMatrix.length; h++) {
    for (let a = 0; a < scorelineMatrix[h].length; a++) {
      if (scorelineMatrix[h][a] > maxP) {
        maxP = scorelineMatrix[h][a];
        bestH = h;
        bestA = a;
      }
    }
  }

  // Key insights and plain English narrative
  const insights: string[] = [];

  const homeWinsIn5 = homeForm.filter((f) => f.result === 'W').length;
  const awayWinsIn5 = awayForm.filter((f) => f.result === 'W').length;

  if (homeWinsIn5 >= 4) {
    insights.push(`${homeName} are in formidable form with ${homeWinsIn5} wins in their last 5 fixtures.`);
  } else if (homeWinsIn5 <= 1) {
    insights.push(`${homeName} have struggled recently, securing only ${homeWinsIn5} win in their last 5 outings.`);
  }

  if (awayWinsIn5 >= 4) {
    insights.push(`${awayName} enter this clash on a hot streak with ${awayWinsIn5} wins in their last 5.`);
  }

  if (dcParams.homeAttack > 1.25 && dcParams.awayDefense > 1.15) {
    insights.push(`${homeName}'s potent attack (rating: ${dcParams.homeAttack.toFixed(2)}) holds a decisive edge against ${awayName}'s vulnerable defense.`);
  } else if (dcParams.awayAttack > 1.25 && dcParams.homeDefense > 1.15) {
    insights.push(`${awayName}'s counter-attacking strength could exploit space behind ${homeName}'s backline.`);
  }

  if (cornersResult.totalCorners >= 10.5) {
    insights.push(`High corner volume expected (~${cornersResult.totalCorners.toFixed(1)} corners) driven by high wing-play and box deliveries.`);
  }

  if (cardsResult.totalCards >= 4.5) {
    insights.push(`Fierce disciplinary contest anticipated (~${cardsResult.totalCards.toFixed(1)} cards expected).`);
  }

  // Head-to-head summary
  let h2hText = '';
  if (h2hMatches.length > 0) {
    let hWins = 0;
    let aWins = 0;
    let draws = 0;
    h2hMatches.forEach((m) => {
      const hg = m.score?.fullTime.home ?? 0;
      const ag = m.score?.fullTime.away ?? 0;
      if (hg > ag) {
        if (m.homeTeam.id === fixture.homeTeam.id) hWins++;
        else aWins++;
      } else if (hg < ag) {
        if (m.homeTeam.id === fixture.homeTeam.id) aWins++;
        else hWins++;
      } else {
        draws++;
      }
    });
    h2hText = ` In past encounters, ${homeName} have won ${hWins}, ${awayName} won ${aWins}, and ${draws} ended level.`;
  }

  const summaryText = `${homeName} host ${awayName} with an expected goal tally of ${dcParams.lambdaHome.toFixed(2)} to ${dcParams.muAway.toFixed(2)}.${h2hText} The Dixon-Coles Poisson model projects the most likely final scoreline to be ${bestH}-${bestA} (${(maxP * 100).toFixed(1)}% probability). Projected match corners stand at ${cornersResult.totalCorners.toFixed(1)} and projected booking cards at ${cardsResult.totalCards.toFixed(1)}.`;

  return {
    homeForm,
    awayForm,
    homeAttackStrength: Number(dcParams.homeAttack.toFixed(2)),
    homeDefenseStrength: Number(dcParams.homeDefense.toFixed(2)),
    awayAttackStrength: Number(dcParams.awayAttack.toFixed(2)),
    awayDefenseStrength: Number(dcParams.awayDefense.toFixed(2)),
    expectedGoalsHome: Number(dcParams.lambdaHome.toFixed(2)),
    expectedGoalsAway: Number(dcParams.muAway.toFixed(2)),
    expectedCornersHome: Number(cornersResult.homeCorners.toFixed(1)),
    expectedCornersAway: Number(cornersResult.awayCorners.toFixed(1)),
    expectedCardsHome: Number(cardsResult.homeCards.toFixed(1)),
    expectedCardsAway: Number(cardsResult.awayCards.toFixed(1)),
    mostLikelyScore: {
      home: bestH,
      away: bestA,
      probability: Number(maxP.toFixed(3)),
    },
    summaryText,
    keyInsights: insights.length > 0 ? insights : [`Competitive encounter anticipated between ${homeName} and ${awayName}.`],
  };
}
