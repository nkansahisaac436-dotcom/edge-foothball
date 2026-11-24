import { BookmakerOdds, ConfidenceLevel, MarketGroup, MarketSelection } from '../types/index.js';
import { calculateEdge, probToFairOdds } from './odds-blend.js';
import { ExpectedCornersResult } from './corners-model.js';
import { ExpectedCardsResult } from './cards-model.js';
import { probOver, probUnder } from './negative-binomial.js';
import { generateScorelineMatrix } from './dixon-coles.js';

export interface DerivedMarketsResult {
  result1X2: MarketGroup;
  doubleChance: MarketGroup;
  drawNoBet: MarketGroup;
  totalGoals: MarketGroup;
  oddEven: MarketGroup;
  btts: MarketGroup;
  bttsCombos: MarketGroup;
  cleanSheetWinToNil: MarketGroup;
  teamTotals: MarketGroup;
  handicapEuropean: MarketGroup;
  handicapAsian: MarketGroup;
  firstHalfResult: MarketGroup;
  firstHalfGoals: MarketGroup;
  secondHalfGoals: MarketGroup;
  highestScoringHalf: MarketGroup;
  halfTimeFullTime: MarketGroup;
  correctScores: MarketGroup;
  exactTotalGoals: MarketGroup;
  cornersTotal: MarketGroup;
  cornersTeam: MarketGroup;
  cornersFirstHalf: MarketGroup;
  cornersHandicap: MarketGroup;
  cornersMost: MarketGroup;
  cardsTotal: MarketGroup;
  cardsTeam: MarketGroup;
}

export function deriveAllMarkets(
  matrix: number[][], // 11x11 scoreline matrix
  cornersResult: ExpectedCornersResult,
  cardsResult: ExpectedCardsResult,
  confidence: ConfidenceLevel,
  homeTeamName: string,
  awayTeamName: string,
  bookmakerOdds?: BookmakerOdds,
  lambdaHome: number = 1.4,
  muAway: number = 1.1
): DerivedMarketsResult {
  const maxGoals = matrix.length - 1;

  // 1. MATCH RESULT 1X2
  let pHomeWin = 0;
  let pDraw = 0;
  let pAwayWin = 0;

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const p = matrix[h][a];
      if (h > a) pHomeWin += p;
      else if (h === a) pDraw += p;
      else pAwayWin += p;
    }
  }

  const result1X2Selections: MarketSelection[] = [
    {
      outcome: '1',
      name: `${homeTeamName} Win`,
      probability: pHomeWin,
      fairOdds: probToFairOdds(pHomeWin),
      marketOdds: bookmakerOdds?.homeWin,
      edge: calculateEdge(pHomeWin, bookmakerOdds?.homeWin),
    },
    {
      outcome: 'X',
      name: 'Draw',
      probability: pDraw,
      fairOdds: probToFairOdds(pDraw),
      marketOdds: bookmakerOdds?.draw,
      edge: calculateEdge(pDraw, bookmakerOdds?.draw),
    },
    {
      outcome: '2',
      name: `${awayTeamName} Win`,
      probability: pAwayWin,
      fairOdds: probToFairOdds(pAwayWin),
      marketOdds: bookmakerOdds?.awayWin,
      edge: calculateEdge(pAwayWin, bookmakerOdds?.awayWin),
    },
  ];

  // 2. DOUBLE CHANCE
  const p1X = pHomeWin + pDraw;
  const pX2 = pDraw + pAwayWin;
  const p12 = pHomeWin + pAwayWin;

  const doubleChanceSelections: MarketSelection[] = [
    { outcome: '1X', name: `${homeTeamName} or Draw`, probability: p1X, fairOdds: probToFairOdds(p1X) },
    { outcome: 'X2', name: `Draw or ${awayTeamName}`, probability: pX2, fairOdds: probToFairOdds(pX2) },
    { outcome: '12', name: `${homeTeamName} or ${awayTeamName}`, probability: p12, fairOdds: probToFairOdds(p12) },
  ];

  // 3. DRAW NO BET (DNB)
  const pDnbHome = p12 > 0 ? pHomeWin / p12 : 0.5;
  const pDnbAway = p12 > 0 ? pAwayWin / p12 : 0.5;

  const drawNoBetSelections: MarketSelection[] = [
    { outcome: 'Home DNB', name: `${homeTeamName} (Draw No Bet)`, probability: pDnbHome, fairOdds: probToFairOdds(pDnbHome) },
    { outcome: 'Away DNB', name: `${awayTeamName} (Draw No Bet)`, probability: pDnbAway, fairOdds: probToFairOdds(pDnbAway) },
  ];

  // 4. TOTAL GOALS OVER / UNDER (0.5, 1.5, 2.5, 3.5, 4.5, 5.5)
  const totalGoalsLines = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5];
  const totalGoalsSelections: MarketSelection[] = [];

  totalGoalsLines.forEach((line) => {
    let pUnder = 0;
    for (let h = 0; h <= maxGoals; h++) {
      for (let a = 0; a <= maxGoals; a++) {
        if (h + a < line) {
          pUnder += matrix[h][a];
        }
      }
    }
    const pOver = 1 - pUnder;

    // Check if line is 2.5 to attach bookmaker odds if available
    const overMkt = line === 2.5 ? bookmakerOdds?.over25 : undefined;
    const underMkt = line === 2.5 ? bookmakerOdds?.under25 : undefined;

    totalGoalsSelections.push({
      outcome: `Over ${line}`,
      name: `Over ${line} Goals`,
      probability: pOver,
      fairOdds: probToFairOdds(pOver),
      marketOdds: overMkt,
      edge: calculateEdge(pOver, overMkt),
    });
    totalGoalsSelections.push({
      outcome: `Under ${line}`,
      name: `Under ${line} Goals`,
      probability: pUnder,
      fairOdds: probToFairOdds(pUnder),
      marketOdds: underMkt,
      edge: calculateEdge(pUnder, underMkt),
    });
  });

  // 5. ODD / EVEN TOTAL GOALS
  let pOddGoals = 0;
  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      if ((h + a) % 2 !== 0) {
        pOddGoals += matrix[h][a];
      }
    }
  }
  const pEvenGoals = 1 - pOddGoals;

  const oddEvenSelections: MarketSelection[] = [
    { outcome: 'Odd', name: 'Odd Total Goals', probability: pOddGoals, fairOdds: probToFairOdds(pOddGoals) },
    { outcome: 'Even', name: 'Even Total Goals', probability: pEvenGoals, fairOdds: probToFairOdds(pEvenGoals) },
  ];

  // 6. BOTH TEAMS TO SCORE (BTTS)
  let pBttsYes = 0;
  for (let h = 1; h <= maxGoals; h++) {
    for (let a = 1; a <= maxGoals; a++) {
      pBttsYes += matrix[h][a];
    }
  }
  const pBttsNo = 1 - pBttsYes;

  const bttsSelections: MarketSelection[] = [
    {
      outcome: 'Yes',
      name: 'Both Teams to Score (Yes)',
      probability: pBttsYes,
      fairOdds: probToFairOdds(pBttsYes),
      marketOdds: bookmakerOdds?.bttsYes,
      edge: calculateEdge(pBttsYes, bookmakerOdds?.bttsYes),
    },
    {
      outcome: 'No',
      name: 'Both Teams to Score (No)',
      probability: pBttsNo,
      fairOdds: probToFairOdds(pBttsNo),
      marketOdds: bookmakerOdds?.bttsNo,
      edge: calculateEdge(pBttsNo, bookmakerOdds?.bttsNo),
    },
  ];

  // 7. BTTS + OVER/UNDER 2.5 COMBINATIONS
  let pBttsYesOver25 = 0;
  let pBttsYesUnder25 = 0;
  let pBttsNoOver25 = 0;
  let pBttsNoUnder25 = 0;

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const p = matrix[h][a];
      const isBtts = h >= 1 && a >= 1;
      const isOver25 = h + a > 2.5;

      if (isBtts && isOver25) pBttsYesOver25 += p;
      else if (isBtts && !isOver25) pBttsYesUnder25 += p;
      else if (!isBtts && isOver25) pBttsNoOver25 += p;
      else if (!isBtts && !isOver25) pBttsNoUnder25 += p;
    }
  }

  const bttsCombosSelections: MarketSelection[] = [
    { outcome: 'Yes & Over 2.5', name: 'BTTS Yes & Over 2.5', probability: pBttsYesOver25, fairOdds: probToFairOdds(pBttsYesOver25) },
    { outcome: 'Yes & Under 2.5', name: 'BTTS Yes & Under 2.5 (1-1)', probability: pBttsYesUnder25, fairOdds: probToFairOdds(pBttsYesUnder25) },
    { outcome: 'No & Over 2.5', name: 'BTTS No & Over 2.5', probability: pBttsNoOver25, fairOdds: probToFairOdds(pBttsNoOver25) },
    { outcome: 'No & Under 2.5', name: 'BTTS No & Under 2.5', probability: pBttsNoUnder25, fairOdds: probToFairOdds(pBttsNoUnder25) },
  ];

  // 8. CLEAN SHEET & WIN TO NIL
  let pHomeCleanSheet = 0; // Away scores 0
  let pAwayCleanSheet = 0; // Home scores 0
  let pHomeWinToNil = 0;   // Home > 0 and Away = 0
  let pAwayWinToNil = 0;   // Away > 0 and Home = 0

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const p = matrix[h][a];
      if (a === 0) pHomeCleanSheet += p;
      if (h === 0) pAwayCleanSheet += p;
      if (h > 0 && a === 0) pHomeWinToNil += p;
      if (a > 0 && h === 0) pAwayWinToNil += p;
    }
  }

  const cleanSheetWinToNilSelections: MarketSelection[] = [
    { outcome: 'Home Clean Sheet', name: `${homeTeamName} Clean Sheet`, probability: pHomeCleanSheet, fairOdds: probToFairOdds(pHomeCleanSheet) },
    { outcome: 'Away Clean Sheet', name: `${awayTeamName} Clean Sheet`, probability: pAwayCleanSheet, fairOdds: probToFairOdds(pAwayCleanSheet) },
    { outcome: 'Home Win to Nil', name: `${homeTeamName} Win to Nil`, probability: pHomeWinToNil, fairOdds: probToFairOdds(pHomeWinToNil) },
    { outcome: 'Away Win to Nil', name: `${awayTeamName} Win to Nil`, probability: pAwayWinToNil, fairOdds: probToFairOdds(pAwayWinToNil) },
  ];

  // 9. TEAM TOTAL GOALS (Home & Away O/U 0.5, 1.5, 2.5)
  const teamTotalsSelections: MarketSelection[] = [];
  [0.5, 1.5, 2.5].forEach((line) => {
    // Home team
    let pHomeUnder = 0;
    for (let h = 0; h <= maxGoals; h++) {
      if (h < line) {
        for (let a = 0; a <= maxGoals; a++) {
          pHomeUnder += matrix[h][a];
        }
      }
    }
    const pHomeOver = 1 - pHomeUnder;
    teamTotalsSelections.push({
      outcome: `Home Over ${line}`,
      name: `${homeTeamName} Over ${line}`,
      probability: pHomeOver,
      fairOdds: probToFairOdds(pHomeOver),
    });
    teamTotalsSelections.push({
      outcome: `Home Under ${line}`,
      name: `${homeTeamName} Under ${line}`,
      probability: pHomeUnder,
      fairOdds: probToFairOdds(pHomeUnder),
    });

    // Away team
    let pAwayUnder = 0;
    for (let a = 0; a <= maxGoals; a++) {
      if (a < line) {
        for (let h = 0; h <= maxGoals; h++) {
          pAwayUnder += matrix[h][a];
        }
      }
    }
    const pAwayOver = 1 - pAwayUnder;
    teamTotalsSelections.push({
      outcome: `Away Over ${line}`,
      name: `${awayTeamName} Over ${line}`,
      probability: pAwayOver,
      fairOdds: probToFairOdds(pAwayOver),
    });
    teamTotalsSelections.push({
      outcome: `Away Under ${line}`,
      name: `${awayTeamName} Under ${line}`,
      probability: pAwayUnder,
      fairOdds: probToFairOdds(pAwayUnder),
    });
  });

  // 10. EUROPEAN HANDICAP (-2, -1, +1, +2)
  const europeanHandicapSelections: MarketSelection[] = [];
  [-2, -1, 1, 2].forEach((hcap) => {
    let pHomeHcap = 0;
    let pDrawHcap = 0;
    let pAwayHcap = 0;

    for (let h = 0; h <= maxGoals; h++) {
      for (let a = 0; a <= maxGoals; a++) {
        const diff = (h + hcap) - a;
        if (diff > 0) pHomeHcap += matrix[h][a];
        else if (diff === 0) pDrawHcap += matrix[h][a];
        else pAwayHcap += matrix[h][a];
      }
    }

    const sign = hcap > 0 ? `+${hcap}` : `${hcap}`;
    europeanHandicapSelections.push({
      outcome: `Home (${sign})`,
      name: `${homeTeamName} (${sign})`,
      probability: pHomeHcap,
      fairOdds: probToFairOdds(pHomeHcap),
    });
    europeanHandicapSelections.push({
      outcome: `Draw (${sign})`,
      name: `Draw (${sign})`,
      probability: pDrawHcap,
      fairOdds: probToFairOdds(pDrawHcap),
    });
    europeanHandicapSelections.push({
      outcome: `Away (${hcap > 0 ? `-${hcap}` : `+${Math.abs(hcap)}`})`,
      name: `${awayTeamName} (${hcap > 0 ? `-${hcap}` : `+${Math.abs(hcap)}`})`,
      probability: pAwayHcap,
      fairOdds: probToFairOdds(pAwayHcap),
    });
  });

  // 11. ASIAN HANDICAP (-0.5, -1, +0.5, +1)
  const asianHandicapSelections: MarketSelection[] = [];
  // -0.5 is Home Win; +0.5 is Double Chance 1X
  asianHandicapSelections.push({
    outcome: 'Home -0.5',
    name: `${homeTeamName} (-0.5)`,
    probability: pHomeWin,
    fairOdds: probToFairOdds(pHomeWin),
  });
  asianHandicapSelections.push({
    outcome: 'Away +0.5',
    name: `${awayTeamName} (+0.5)`,
    probability: pX2,
    fairOdds: probToFairOdds(pX2),
  });

  // -1.0 Asian Handicap: win by 2+ is full win, win by 1 is push (half-win/returned)
  let pHomeWinBy2Plus = 0;
  let pHomeWinBy1 = 0;
  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      if (h - a >= 2) pHomeWinBy2Plus += matrix[h][a];
      else if (h - a === 1) pHomeWinBy1 += matrix[h][a];
    }
  }
  const pHomeAhMinus1 = pHomeWinBy2Plus + 0.5 * pHomeWinBy1;
  const pAwayAhPlus1 = 1 - pHomeAhMinus1;

  asianHandicapSelections.push({
    outcome: 'Home -1.0',
    name: `${homeTeamName} (-1.0)`,
    probability: pHomeAhMinus1,
    fairOdds: probToFairOdds(pHomeAhMinus1),
  });
  asianHandicapSelections.push({
    outcome: 'Away +1.0',
    name: `${awayTeamName} (+1.0)`,
    probability: pAwayAhPlus1,
    fairOdds: probToFairOdds(pAwayAhPlus1),
  });

  // 12. FIRST HALF & SECOND HALF
  // In professional football, ~45% of expected goals occur in 1st half, ~55% in 2nd half
  const lambda1H = lambdaHome * 0.45;
  const mu1H = muAway * 0.45;
  const matrix1H = generateScorelineMatrix(lambda1H, mu1H, 5);

  let p1HHome = 0;
  let p1HDraw = 0;
  let p1HAway = 0;
  let p1HOver05 = 0;
  let p1HOver15 = 0;

  for (let h = 0; h <= 5; h++) {
    for (let a = 0; a <= 5; a++) {
      const p = matrix1H[h][a];
      if (h > a) p1HHome += p;
      else if (h === a) p1HDraw += p;
      else p1HAway += p;

      if (h + a > 0.5) p1HOver05 += p;
      if (h + a > 1.5) p1HOver15 += p;
    }
  }

  const firstHalfResultSelections: MarketSelection[] = [
    { outcome: '1H 1', name: `1st Half: ${homeTeamName}`, probability: p1HHome, fairOdds: probToFairOdds(p1HHome) },
    { outcome: '1H X', name: '1st Half: Draw', probability: p1HDraw, fairOdds: probToFairOdds(p1HDraw) },
    { outcome: '1H 2', name: `1st Half: ${awayTeamName}`, probability: p1HAway, fairOdds: probToFairOdds(p1HAway) },
  ];

  const firstHalfGoalsSelections: MarketSelection[] = [
    { outcome: '1H Over 0.5', name: '1st Half Over 0.5 Goals', probability: p1HOver05, fairOdds: probToFairOdds(p1HOver05) },
    { outcome: '1H Under 0.5', name: '1st Half Under 0.5 Goals', probability: 1 - p1HOver05, fairOdds: probToFairOdds(1 - p1HOver05) },
    { outcome: '1H Over 1.5', name: '1st Half Over 1.5 Goals', probability: p1HOver15, fairOdds: probToFairOdds(p1HOver15) },
    { outcome: '1H Under 1.5', name: '1st Half Under 1.5 Goals', probability: 1 - p1HOver15, fairOdds: probToFairOdds(1 - p1HOver15) },
  ];

  // 2nd Half Goals
  const lambda2H = lambdaHome * 0.55;
  const mu2H = muAway * 0.55;
  const matrix2H = generateScorelineMatrix(lambda2H, mu2H, 5);
  let p2HOver05 = 0;
  let p2HOver15 = 0;
  for (let h = 0; h <= 5; h++) {
    for (let a = 0; a <= 5; a++) {
      const p = matrix2H[h][a];
      if (h + a > 0.5) p2HOver05 += p;
      if (h + a > 1.5) p2HOver15 += p;
    }
  }

  const secondHalfGoalsSelections: MarketSelection[] = [
    { outcome: '2H Over 0.5', name: '2nd Half Over 0.5 Goals', probability: p2HOver05, fairOdds: probToFairOdds(p2HOver05) },
    { outcome: '2H Under 0.5', name: '2nd Half Under 0.5 Goals', probability: 1 - p2HOver05, fairOdds: probToFairOdds(1 - p2HOver05) },
    { outcome: '2H Over 1.5', name: '2nd Half Over 1.5 Goals', probability: p2HOver15, fairOdds: probToFairOdds(p2HOver15) },
    { outcome: '2H Under 1.5', name: '2nd Half Under 1.5 Goals', probability: 1 - p2HOver15, fairOdds: probToFairOdds(1 - p2HOver15) },
  ];

  // Highest Scoring Half
  // 1st Half vs 2nd Half: 2nd half usually has ~55% of goals, ~48% chance of highest scoring half
  const pHighest1H = 0.33;
  const pHighest2H = 0.48;
  const pHighestEqual = 0.19;

  const highestScoringHalfSelections: MarketSelection[] = [
    { outcome: '1st Half', name: '1st Half Highest Scoring', probability: pHighest1H, fairOdds: probToFairOdds(pHighest1H) },
    { outcome: '2nd Half', name: '2nd Half Highest Scoring', probability: pHighest2H, fairOdds: probToFairOdds(pHighest2H) },
    { outcome: 'Equal', name: 'Equal Goals in Both Halves', probability: pHighestEqual, fairOdds: probToFairOdds(pHighestEqual) },
  ];

  // HT/FT (9 outcomes)
  // Approximate joint distribution using conditional transitions
  const htftOutcomes = [
    { code: '1/1', name: `${homeTeamName} / ${homeTeamName}`, prob: p1HHome * 0.72 },
    { code: '1/X', name: `${homeTeamName} / Draw`, prob: p1HHome * 0.18 },
    { code: '1/2', name: `${homeTeamName} / ${awayTeamName}`, prob: p1HHome * 0.10 },
    { code: 'X/1', name: `Draw / ${homeTeamName}`, prob: p1HDraw * 0.42 },
    { code: 'X/X', name: 'Draw / Draw', prob: p1HDraw * 0.35 },
    { code: 'X/2', name: `Draw / ${awayTeamName}`, prob: p1HDraw * 0.23 },
    { code: '2/1', name: `${awayTeamName} / ${homeTeamName}`, prob: p1HAway * 0.10 },
    { code: '2/X', name: `${awayTeamName} / Draw`, prob: p1HAway * 0.20 },
    { code: '2/2', name: `${awayTeamName} / ${awayTeamName}`, prob: p1HAway * 0.70 },
  ];

  const htftSum = htftOutcomes.reduce((acc, cur) => acc + cur.prob, 0);
  const halfTimeFullTimeSelections: MarketSelection[] = htftOutcomes.map((item) => {
    const p = item.prob / htftSum;
    return {
      outcome: item.code,
      name: item.name,
      probability: p,
      fairOdds: probToFairOdds(p),
    };
  });

  // 13. CORRECT SCORE (Top 5)
  const scorelines: { h: number; a: number; p: number }[] = [];
  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      scorelines.push({ h, a, p: matrix[h][a] });
    }
  }
  scorelines.sort((a, b) => b.p - a.p);

  const correctScoresSelections: MarketSelection[] = scorelines.slice(0, 5).map((s) => ({
    outcome: `${s.h}-${s.a}`,
    name: `Score ${s.h} - ${s.a}`,
    probability: s.p,
    fairOdds: probToFairOdds(s.p),
  }));

  // 14. EXACT TOTAL GOALS (0, 1, 2, 3, 4, 5, 6+)
  const exactGoalsSelections: MarketSelection[] = [];
  const exactGoalCounts = new Array(7).fill(0);

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const tot = h + a;
      if (tot >= 6) exactGoalCounts[6] += matrix[h][a];
      else exactGoalCounts[tot] += matrix[h][a];
    }
  }

  for (let g = 0; g <= 5; g++) {
    exactGoalsSelections.push({
      outcome: `${g}`,
      name: `Exactly ${g} Goals`,
      probability: exactGoalCounts[g],
      fairOdds: probToFairOdds(exactGoalCounts[g]),
    });
  }
  exactGoalsSelections.push({
    outcome: '6+',
    name: '6 or More Goals',
    probability: exactGoalCounts[6],
    fairOdds: probToFairOdds(exactGoalCounts[6]),
  });

  // 15. CORNERS (Negative Binomial)
  // Lines: 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5
  // Over 7.5 must be clearly marked
  const cornerLines = [6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5];
  const cornersTotalSelections: MarketSelection[] = [];

  cornerLines.forEach((line) => {
    const pOv = probOver(cornersResult.totalDist, line);
    const pUn = probUnder(cornersResult.totalDist, line);

    cornersTotalSelections.push({
      outcome: `Over ${line}`,
      name: `Corners Over ${line}`,
      probability: pOv,
      fairOdds: probToFairOdds(pOv),
      isEstimate: true,
      isRecommended: line === 7.5 && pOv > 0.65, // highlight 7.5 specifically
    });
    cornersTotalSelections.push({
      outcome: `Under ${line}`,
      name: `Corners Under ${line}`,
      probability: pUn,
      fairOdds: probToFairOdds(pUn),
      isEstimate: true,
    });
  });

  // Home & Away Corners Over/Under
  const cornersTeamSelections: MarketSelection[] = [];
  [3.5, 4.5, 5.5].forEach((line) => {
    const pHomeOver = probOver(cornersResult.homeDist, line);
    const pHomeUnder = probUnder(cornersResult.homeDist, line);
    cornersTeamSelections.push({
      outcome: `Home Over ${line}`,
      name: `${homeTeamName} Corners Over ${line}`,
      probability: pHomeOver,
      fairOdds: probToFairOdds(pHomeOver),
      isEstimate: true,
    });
    cornersTeamSelections.push({
      outcome: `Home Under ${line}`,
      name: `${homeTeamName} Corners Under ${line}`,
      probability: pHomeUnder,
      fairOdds: probToFairOdds(pHomeUnder),
      isEstimate: true,
    });

    const pAwayOver = probOver(cornersResult.awayDist, line);
    const pAwayUnder = probUnder(cornersResult.awayDist, line);
    cornersTeamSelections.push({
      outcome: `Away Over ${line}`,
      name: `${awayTeamName} Corners Over ${line}`,
      probability: pAwayOver,
      fairOdds: probToFairOdds(pAwayOver),
      isEstimate: true,
    });
    cornersTeamSelections.push({
      outcome: `Away Under ${line}`,
      name: `${awayTeamName} Corners Under ${line}`,
      probability: pAwayUnder,
      fairOdds: probToFairOdds(pAwayUnder),
      isEstimate: true,
    });
  });

  // 1st Half Corners Over/Under 3.5, 4.5, 5.5
  const cornersFirstHalfSelections: MarketSelection[] = [];
  [3.5, 4.5, 5.5].forEach((line) => {
    const pOv = probOver(cornersResult.firstHalfDist, line);
    const pUn = probUnder(cornersResult.firstHalfDist, line);
    cornersFirstHalfSelections.push({
      outcome: `1H Corners Over ${line}`,
      name: `1st Half Corners Over ${line}`,
      probability: pOv,
      fairOdds: probToFairOdds(pOv),
      isEstimate: true,
    });
    cornersFirstHalfSelections.push({
      outcome: `1H Corners Under ${line}`,
      name: `1st Half Corners Under ${line}`,
      probability: pUn,
      fairOdds: probToFairOdds(pUn),
      isEstimate: true,
    });
  });

  // Most Corners & Corner Handicap
  let pMostCornersHome = 0;
  let pMostCornersDraw = 0;
  let pMostCornersAway = 0;
  let pCornerHcapHomeMinus15 = 0;

  for (let h = 0; h < cornersResult.homeDist.length; h++) {
    for (let a = 0; a < cornersResult.awayDist.length; a++) {
      const p = cornersResult.homeDist[h] * cornersResult.awayDist[a];
      if (h > a) pMostCornersHome += p;
      else if (h === a) pMostCornersDraw += p;
      else pMostCornersAway += p;

      if (h - a > 1.5) pCornerHcapHomeMinus15 += p;
    }
  }

  const cornersMostSelections: MarketSelection[] = [
    { outcome: 'Home Most Corners', name: `${homeTeamName} Most Corners`, probability: pMostCornersHome, fairOdds: probToFairOdds(pMostCornersHome), isEstimate: true },
    { outcome: 'Draw Most Corners', name: 'Tie Corners', probability: pMostCornersDraw, fairOdds: probToFairOdds(pMostCornersDraw), isEstimate: true },
    { outcome: 'Away Most Corners', name: `${awayTeamName} Most Corners`, probability: pMostCornersAway, fairOdds: probToFairOdds(pMostCornersAway), isEstimate: true },
  ];

  const cornersHandicapSelections: MarketSelection[] = [
    { outcome: 'Home -1.5 Corners', name: `${homeTeamName} (-1.5 Corners)`, probability: pCornerHcapHomeMinus15, fairOdds: probToFairOdds(pCornerHcapHomeMinus15), isEstimate: true },
    { outcome: 'Away +1.5 Corners', name: `${awayTeamName} (+1.5 Corners)`, probability: 1 - pCornerHcapHomeMinus15, fairOdds: probToFairOdds(1 - pCornerHcapHomeMinus15), isEstimate: true },
  ];

  // 16. CARDS (Negative Binomial)
  // Lines: 2.5, 3.5, 4.5, 5.5
  const cardLines = [2.5, 3.5, 4.5, 5.5];
  const cardsTotalSelections: MarketSelection[] = [];

  cardLines.forEach((line) => {
    const pOv = probOver(cardsResult.totalDist, line);
    const pUn = probUnder(cardsResult.totalDist, line);
    cardsTotalSelections.push({
      outcome: `Over ${line}`,
      name: `Cards Over ${line}`,
      probability: pOv,
      fairOdds: probToFairOdds(pOv),
      isEstimate: true,
    });
    cardsTotalSelections.push({
      outcome: `Under ${line}`,
      name: `Cards Under ${line}`,
      probability: pUn,
      fairOdds: probToFairOdds(pUn),
      isEstimate: true,
    });
  });

  const cardsTeamSelections: MarketSelection[] = [];
  [1.5, 2.5].forEach((line) => {
    const pHomeOver = probOver(cardsResult.homeDist, line);
    const pHomeUnder = probUnder(cardsResult.homeDist, line);
    cardsTeamSelections.push({
      outcome: `Home Over ${line}`,
      name: `${homeTeamName} Cards Over ${line}`,
      probability: pHomeOver,
      fairOdds: probToFairOdds(pHomeOver),
      isEstimate: true,
    });
    cardsTeamSelections.push({
      outcome: `Home Under ${line}`,
      name: `${homeTeamName} Cards Under ${line}`,
      probability: pHomeUnder,
      fairOdds: probToFairOdds(pHomeUnder),
      isEstimate: true,
    });

    const pAwayOver = probOver(cardsResult.awayDist, line);
    const pAwayUnder = probUnder(cardsResult.awayDist, line);
    cardsTeamSelections.push({
      outcome: `Away Over ${line}`,
      name: `${awayTeamName} Cards Over ${line}`,
      probability: pAwayOver,
      fairOdds: probToFairOdds(pAwayOver),
      isEstimate: true,
    });
    cardsTeamSelections.push({
      outcome: `Away Under ${line}`,
      name: `${awayTeamName} Cards Under ${line}`,
      probability: pAwayUnder,
      fairOdds: probToFairOdds(pAwayUnder),
      isEstimate: true,
    });
  });

  return {
    result1X2: { id: 'result', title: 'Match Result 1X2', confidence, selections: result1X2Selections },
    doubleChance: { id: 'double_chance', title: 'Double Chance', confidence, selections: doubleChanceSelections },
    drawNoBet: { id: 'dnb', title: 'Draw No Bet', confidence, selections: drawNoBetSelections },
    totalGoals: { id: 'goals', title: 'Total Goals Over/Under', confidence, selections: totalGoalsSelections },
    oddEven: { id: 'odd_even', title: 'Odd / Even Total Goals', confidence, selections: oddEvenSelections },
    btts: { id: 'btts', title: 'Both Teams to Score (BTTS)', confidence, selections: bttsSelections },
    bttsCombos: { id: 'btts_combos', title: 'BTTS + Goals Combinations', confidence, selections: bttsCombosSelections },
    cleanSheetWinToNil: { id: 'clean_sheet', title: 'Clean Sheet & Win to Nil', confidence, selections: cleanSheetWinToNilSelections },
    teamTotals: { id: 'team_totals', title: 'Team Total Goals', confidence, selections: teamTotalsSelections },
    handicapEuropean: { id: 'handicap_euro', title: 'European Handicap', confidence, selections: europeanHandicapSelections },
    handicapAsian: { id: 'handicap_asian', title: 'Asian Handicap', confidence, selections: asianHandicapSelections },
    firstHalfResult: { id: 'halves_result', title: '1st Half Result', confidence, selections: firstHalfResultSelections },
    firstHalfGoals: { id: 'halves_goals_1h', title: '1st Half Goals Over/Under', confidence, selections: firstHalfGoalsSelections },
    secondHalfGoals: { id: 'halves_goals_2h', title: '2nd Half Goals Over/Under', confidence, selections: secondHalfGoalsSelections },
    highestScoringHalf: { id: 'halves_highest', title: 'Highest Scoring Half', confidence, selections: highestScoringHalfSelections },
    halfTimeFullTime: { id: 'ht_ft', title: 'Half Time / Full Time', confidence, selections: halfTimeFullTimeSelections },
    correctScores: { id: 'scores_correct', title: 'Top 5 Correct Scores', confidence, selections: correctScoresSelections },
    exactTotalGoals: { id: 'scores_exact', title: 'Exact Total Goals', confidence, selections: exactGoalsSelections },
    cornersTotal: { id: 'corners_total', title: 'Corners Over/Under', isEstimate: true, confidence, selections: cornersTotalSelections },
    cornersTeam: { id: 'corners_team', title: 'Team Corners Over/Under', isEstimate: true, confidence, selections: cornersTeamSelections },
    cornersFirstHalf: { id: 'corners_1h', title: '1st Half Corners', isEstimate: true, confidence, selections: cornersFirstHalfSelections },
    cornersHandicap: { id: 'corners_hcap', title: 'Corner Handicap', isEstimate: true, confidence, selections: cornersHandicapSelections },
    cornersMost: { id: 'corners_most', title: 'Most Corners', isEstimate: true, confidence, selections: cornersMostSelections },
    cardsTotal: { id: 'cards_total', title: 'Cards Over/Under', isEstimate: true, confidence, selections: cardsTotalSelections },
    cardsTeam: { id: 'cards_team', title: 'Team Cards Over/Under', isEstimate: true, confidence, selections: cardsTeamSelections },
  };
}
