export interface Team {
  id: number | string;
  name: string;
  shortName?: string;
  logo?: string;
}

export interface MatchScore {
  fullTime: {
    home: number | null;
    away: number | null;
  };
  halfTime?: {
    home: number | null;
    away: number | null;
  };
}

export interface BookmakerOdds {
  homeWin: number;
  draw: number;
  awayWin: number;
  bookmaker?: string;
  over25?: number;
  under25?: number;
  bttsYes?: number;
  bttsNo?: number;
}

export interface MatchFixture {
  id: string | number;
  leagueId: string;
  leagueName: string;
  leagueLogo?: string;
  round?: string;
  utcDate: string;
  status: 'SCHEDULED' | 'TIMED' | 'LIVE' | 'FINISHED' | 'POSTPONED';
  homeTeam: Team;
  awayTeam: Team;
  score?: MatchScore;
  odds?: BookmakerOdds;
  venue?: string;
}

export interface LeagueConfig {
  id: string;
  name: string;
  country: string;
  logo: string;
  defaultHomeAdvantage: number;
  defaultLeagueAvgGoals: number;
  defaultLeagueAvgCorners: number;
  defaultLeagueAvgCards: number;
}

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export interface MarketSelection {
  outcome: string;
  name: string;
  probability: number;
  fairOdds: number;
  isEstimate?: boolean;
  marketOdds?: number;
  edge?: number;
  isRecommended?: boolean;
}

export interface MarketGroup {
  id: string;
  title: string;
  isEstimate?: boolean;
  confidence: ConfidenceLevel;
  selections: MarketSelection[];
}

export interface FormRecord {
  result: 'W' | 'D' | 'L';
  opponent: string;
  score: string;
  date: string;
  isHome: boolean;
}

export interface MatchAnalysis {
  homeForm: FormRecord[];
  awayForm: FormRecord[];
  homeAttackStrength: number;
  homeDefenseStrength: number;
  awayAttackStrength: number;
  awayDefenseStrength: number;
  expectedGoalsHome: number;
  expectedGoalsAway: number;
  expectedCornersHome: number;
  expectedCornersAway: number;
  expectedCardsHome: number;
  expectedCardsAway: number;
  mostLikelyScore: {
    home: number;
    away: number;
    probability: number;
  };
  summaryText: string;
  keyInsights: string[];
}

export interface MatchPrediction {
  matchId: string | number;
  fixture: MatchFixture;
  lastUpdated: string;
  confidence: ConfidenceLevel;
  confidenceReason: string;
  topPicks: MarketSelection[];
  analysis: MatchAnalysis;
  markets: {
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
  };
  scorelineMatrix: number[][];
}

export interface AccumulatorLeg {
  id: string;
  matchId: string | number;
  matchTitle: string;
  marketTitle: string;
  outcome: string;
  name: string;
  probability: number;
  fairOdds: number;
  isEstimate?: boolean;
}

export interface CalibrationBin {
  binRange: string;
  minProb: number;
  maxProb: number;
  count: number;
  avgPredictedProb: number;
  actualWinRate: number;
  diff: number;
}

export interface BacktestResults {
  totalMatches: number;
  evaluatedMarkets: string[];
  matchResult1X2: {
    accuracy: number;
    brierScore: number;
    logLoss: number;
  };
  totalGoals25: {
    accuracy: number;
    brierScore: number;
  };
  btts: {
    accuracy: number;
    brierScore: number;
  };
  calibrationTable: CalibrationBin[];
  summary: string;
}
