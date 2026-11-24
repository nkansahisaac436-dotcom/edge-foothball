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
  utcDate: string; // ISO 8601 string
  status: 'SCHEDULED' | 'TIMED' | 'LIVE' | 'FINISHED' | 'POSTPONED';
  homeTeam: Team;
  awayTeam: Team;
  score?: MatchScore;
  odds?: BookmakerOdds;
  venue?: string;
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
  form?: string; // e.g. "WWDLW"
}

export interface LeagueConfig {
  id: string; // e.g., 'PL', 'PD', 'BL1', 'SA', 'FL1', 'CL'
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
  outcome: string; // e.g., "1", "X", "2", "Over 2.5", "Yes"
  name: string; // readable name, e.g. "Arsenal Win", "Over 2.5 Goals"
  probability: number; // 0 to 1
  fairOdds: number; // 1 / probability or 100 / percentage
  isEstimate?: boolean; // For corners/cards
  marketOdds?: number; // bookmaker odds if available
  edge?: number; // (probability * marketOdds - 1) if marketOdds exist
  isRecommended?: boolean;
}

export interface MarketGroup {
  id: string; // 'result', 'goals', 'btts', 'handicap', 'halves', 'corners', 'cards', 'scores'
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
  scorelineMatrix: number[][]; // 11x11 matrix
}
