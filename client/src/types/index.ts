export interface Team {
  id: number | string;
  name: string;
  shortName?: string;
  logo?: string;
}

export type MatchStatus =
  | 'SCHEDULED'
  | 'TIMED'
  | 'LIVE'
  | '1H'
  | 'HT'
  | '2H'
  | 'ET'
  | 'P'
  | 'PEN'
  | 'FINISHED'
  | 'FT'
  | 'AET'
  | 'POSTPONED'
  | 'CANCELLED'
  | 'SUSPENDED';

export interface MatchEvent {
  id: string;
  type: 'GOAL' | 'CARD_YELLOW' | 'CARD_RED' | 'SUBSTITUTION' | 'VAR';
  minute: number;
  extraMinute?: number;
  teamSide: 'home' | 'away';
  playerName: string;
  assistPlayerName?: string;
  subInPlayerName?: string;
  subOutPlayerName?: string;
  detail?: string;
}

export interface InPlayProbabilities {
  homeProb: number;
  drawProb: number;
  awayProb: number;
  fairOddsHome: number;
  fairOddsDraw: number;
  fairOddsAway: number;
  label: string;
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

export interface LiveMatchStats {
  minute: number;
  homeScore: number;
  awayScore: number;
  period?: '1H' | 'HT' | '2H' | 'FT';
  possession?: [number, number]; // [home, away] e.g. [54, 46]
  shotsTotal?: [number, number];
  shotsOnTarget?: [number, number];
  corners?: [number, number];
  fouls?: [number, number];
  yellowCards?: [number, number];
  redCards?: [number, number];
  liveStatusText?: string;
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
  country?: string;
  countryFlag?: string;
  round?: string;
  utcDate: string;
  status: MatchStatus;
  homeTeam: Team;
  awayTeam: Team;
  score?: MatchScore;
  odds?: BookmakerOdds;
  venue?: string;
  minute?: number | string;
  liveStats?: LiveMatchStats;
  events?: MatchEvent[];
  inPlayProbabilities?: InPlayProbabilities;
}

export interface TeamMatchStats {
  matchId: string | number;
  date: string;
  isHome: boolean;
  opponentId: string | number;
  opponentName: string;
  goalsFor: number;
  goalsAgainst: number;
  cornersFor: number;
  cornersAgainst: number;
  yellowCards: number;
  redCards: number;
  shotsTotal?: number;
  shotsOnTarget?: number;
}

export interface TeamStanding {
  position: number;
  teamId: string | number;
  teamName: string;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form?: string;
}

export interface LeagueConfig {
  id: string;
  name: string;
  country: string;
  logo: string;
  apiFootballId: number;
  footballDataOrgCode: string;
  defaultHomeAdvantage: number;
  defaultLeagueAvgGoals: number;
  defaultLeagueAvgCorners: number;
  defaultLeagueAvgCards: number;
  currentSeason: number;
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
  count: number;
  avgPredictedProb: number;
  actualWinRate: number;
  diff: number;
}

export interface BacktestResults {
  totalMatches: number;
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
  summary?: string;
}
