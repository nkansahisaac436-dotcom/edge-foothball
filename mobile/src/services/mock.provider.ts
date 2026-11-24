import { BookmakerOdds, MatchFixture, TeamMatchStats, TeamStanding } from '../types';
import { SUPPORTED_LEAGUES } from '../config/leagues';

export interface TeamProfile {
  id: number;
  name: string;
  shortName: string;
  logo: string;
  attackRating: number;
  defenseRating: number;
  cornersWonAvg: number;
  cornersConcededAvg: number;
  cardsAvg: number;
}

export const REAL_TEAMS: Record<string, TeamProfile> = {
  // UCL
  bodo: { id: 2101, name: 'Bodø/Glimt', shortName: 'BOD', logo: 'https://media.api-sports.io/football/teams/328.png', attackRating: 1.25, defenseRating: 1.10, cornersWonAvg: 5.8, cornersConcededAvg: 4.6, cardsAvg: 2.1 },
  lask: { id: 2102, name: 'LASK', shortName: 'LASK', logo: 'https://media.api-sports.io/football/teams/2042.png', attackRating: 1.05, defenseRating: 1.20, cornersWonAvg: 4.8, cornersConcededAvg: 5.5, cardsAvg: 2.7 },
  galatasaray: { id: 2103, name: 'Galatasaray', shortName: 'GAL', logo: 'https://media.api-sports.io/football/teams/645.png', attackRating: 1.30, defenseRating: 1.05, cornersWonAvg: 6.4, cornersConcededAvg: 4.2, cardsAvg: 2.8 },
  aston_villa: { id: 2104, name: 'Aston Villa', shortName: 'AVL', logo: 'https://media.api-sports.io/football/teams/66.png', attackRating: 1.32, defenseRating: 1.00, cornersWonAvg: 5.9, cornersConcededAvg: 4.7, cardsAvg: 2.2 },
  arsenal: { id: 2105, name: 'Arsenal', shortName: 'ARS', logo: 'https://media.api-sports.io/football/teams/42.png', attackRating: 1.45, defenseRating: 0.70, cornersWonAvg: 7.2, cornersConcededAvg: 3.2, cardsAvg: 1.8 },
  dortmund: { id: 2106, name: 'Dortmund', shortName: 'BVB', logo: 'https://media.api-sports.io/football/teams/165.png', attackRating: 1.36, defenseRating: 1.02, cornersWonAvg: 6.3, cornersConcededAvg: 4.6, cardsAvg: 2.0 },
  como: { id: 2107, name: 'Como', shortName: 'COM', logo: 'https://media.api-sports.io/football/teams/887.png', attackRating: 1.05, defenseRating: 1.25, cornersWonAvg: 4.9, cornersConcededAvg: 5.8, cardsAvg: 2.5 },
  aek: { id: 2108, name: 'AEK', shortName: 'AEK', logo: 'https://media.api-sports.io/football/teams/553.png', attackRating: 1.10, defenseRating: 1.15, cornersWonAvg: 5.1, cornersConcededAvg: 5.2, cardsAvg: 2.9 },
  feyenoord: { id: 2109, name: 'Feyenoord', shortName: 'FEY', logo: 'https://media.api-sports.io/football/teams/246.png', attackRating: 1.28, defenseRating: 1.08, cornersWonAvg: 6.7, cornersConcededAvg: 4.1, cardsAvg: 2.3 },
  porto: { id: 2110, name: 'Porto', shortName: 'POR', logo: 'https://media.api-sports.io/football/teams/212.png', attackRating: 1.29, defenseRating: 0.95, cornersWonAvg: 6.5, cornersConcededAvg: 4.3, cardsAvg: 2.6 },
  mancity: { id: 2111, name: 'Man City', shortName: 'MCI', logo: 'https://media.api-sports.io/football/teams/50.png', attackRating: 1.55, defenseRating: 0.75, cornersWonAvg: 8.2, cornersConcededAvg: 2.9, cardsAvg: 1.5 },
  napoli: { id: 2112, name: 'Napoli', shortName: 'NAP', logo: 'https://media.api-sports.io/football/teams/492.png', attackRating: 1.26, defenseRating: 0.88, cornersWonAvg: 6.0, cornersConcededAvg: 4.4, cardsAvg: 2.3 },
  leipzig: { id: 2113, name: 'Leipzig', shortName: 'RBL', logo: 'https://media.api-sports.io/football/teams/173.png', attackRating: 1.34, defenseRating: 0.98, cornersWonAvg: 6.2, cornersConcededAvg: 4.5, cardsAvg: 2.1 },
  lens: { id: 2114, name: 'Lens', shortName: 'RCL', logo: 'https://media.api-sports.io/football/teams/116.png', attackRating: 1.15, defenseRating: 0.96, cornersWonAvg: 5.2, cornersConcededAvg: 4.9, cardsAvg: 2.5 },
  real_madrid: { id: 2115, name: 'Real Madrid', shortName: 'RMA', logo: 'https://media.api-sports.io/football/teams/541.png', attackRating: 1.50, defenseRating: 0.80, cornersWonAvg: 7.1, cornersConcededAvg: 3.6, cardsAvg: 1.9 },
  psv: { id: 2116, name: 'PSV', shortName: 'PSV', logo: 'https://media.api-sports.io/football/teams/247.png', attackRating: 1.32, defenseRating: 1.12, cornersWonAvg: 6.8, cornersConcededAvg: 4.8, cardsAvg: 2.0 },
  slovan: { id: 2117, name: 'Slovan', shortName: 'SLO', logo: 'https://media.api-sports.io/football/teams/642.png', attackRating: 0.98, defenseRating: 1.35, cornersWonAvg: 4.2, cornersConcededAvg: 6.1, cardsAvg: 2.8 },
  real_betis: { id: 2118, name: 'Real Betis', shortName: 'BET', logo: 'https://media.api-sports.io/football/teams/543.png', attackRating: 1.22, defenseRating: 0.95, cornersWonAvg: 5.6, cornersConcededAvg: 4.4, cardsAvg: 2.4 },

  // Tomorrow UCL
  slavia_praha: { id: 2201, name: 'Slavia Praha', shortName: 'SLA', logo: 'https://media.api-sports.io/football/teams/643.png', attackRating: 1.18, defenseRating: 1.05, cornersWonAvg: 5.8, cornersConcededAvg: 4.5, cardsAvg: 2.4 },
  villarreal: { id: 2202, name: 'Villarreal', shortName: 'VIL', logo: 'https://media.api-sports.io/football/teams/533.png', attackRating: 1.28, defenseRating: 1.08, cornersWonAvg: 5.7, cornersConcededAvg: 5.0, cardsAvg: 2.3 },
  sabah: { id: 2203, name: 'Sabah', shortName: 'SAB', logo: 'https://media.api-sports.io/football/teams/1004.png', attackRating: 0.92, defenseRating: 1.55, cornersWonAvg: 3.8, cornersConcededAvg: 7.2, cardsAvg: 3.1 },
  barcelona: { id: 2204, name: 'Barcelona', shortName: 'BAR', logo: 'https://media.api-sports.io/football/teams/529.png', attackRating: 1.58, defenseRating: 0.78, cornersWonAvg: 7.8, cornersConcededAvg: 3.2, cardsAvg: 2.0 },
  atletico_madrid: { id: 2205, name: 'Atlético Madrid', shortName: 'ATM', logo: 'https://media.api-sports.io/football/teams/530.png', attackRating: 1.30, defenseRating: 0.72, cornersWonAvg: 5.9, cornersConcededAvg: 3.8, cardsAvg: 2.9 },
  viking: { id: 2206, name: 'Viking', shortName: 'VIK', logo: 'https://media.api-sports.io/football/teams/331.png', attackRating: 1.00, defenseRating: 1.35, cornersWonAvg: 4.6, cornersConcededAvg: 6.2, cardsAvg: 2.6 },
  club_brugge: { id: 2207, name: 'Club Brugge', shortName: 'BRU', logo: 'https://media.api-sports.io/football/teams/569.png', attackRating: 1.15, defenseRating: 1.20, cornersWonAvg: 5.5, cornersConcededAvg: 5.4, cardsAvg: 2.5 },
  liverpool: { id: 2208, name: 'Liverpool', shortName: 'LIV', logo: 'https://media.api-sports.io/football/teams/40.png', attackRating: 1.48, defenseRating: 0.74, cornersWonAvg: 7.5, cornersConcededAvg: 3.5, cardsAvg: 1.8 },
  inter: { id: 2209, name: 'Inter', shortName: 'INT', logo: 'https://media.api-sports.io/football/teams/505.png', attackRating: 1.38, defenseRating: 0.72, cornersWonAvg: 6.8, cornersConcededAvg: 3.6, cardsAvg: 2.1 },
  stuttgart: { id: 2210, name: 'Stuttgart', shortName: 'VFB', logo: 'https://media.api-sports.io/football/teams/172.png', attackRating: 1.26, defenseRating: 1.10, cornersWonAvg: 5.8, cornersConcededAvg: 4.9, cardsAvg: 2.2 },
  lille: { id: 2211, name: 'Lille', shortName: 'LIL', logo: 'https://media.api-sports.io/football/teams/79.png', attackRating: 1.20, defenseRating: 1.02, cornersWonAvg: 5.4, cornersConcededAvg: 4.6, cardsAvg: 2.4 },
  bayern: { id: 2212, name: 'Bayern', shortName: 'BAY', logo: 'https://media.api-sports.io/football/teams/157.png', attackRating: 1.55, defenseRating: 0.76, cornersWonAvg: 7.9, cornersConcededAvg: 3.3, cardsAvg: 1.6 },
  psg: { id: 2213, name: 'PSG', shortName: 'PSG', logo: 'https://media.api-sports.io/football/teams/85.png', attackRating: 1.46, defenseRating: 0.82, cornersWonAvg: 6.9, cornersConcededAvg: 3.7, cardsAvg: 2.1 },
  roma: { id: 2214, name: 'Roma', shortName: 'ROM', logo: 'https://media.api-sports.io/football/teams/497.png', attackRating: 1.20, defenseRating: 1.04, cornersWonAvg: 5.7, cornersConcededAvg: 4.8, cardsAvg: 2.7 },
  shakhtar: { id: 2215, name: 'Shakhtar', shortName: 'SHK', logo: 'https://media.api-sports.io/football/teams/550.png', attackRating: 1.16, defenseRating: 1.18, cornersWonAvg: 5.2, cornersConcededAvg: 5.3, cardsAvg: 2.6 },
  fenerbahce: { id: 2216, name: 'Fenerbahçe', shortName: 'FEN', logo: 'https://media.api-sports.io/football/teams/611.png', attackRating: 1.25, defenseRating: 1.06, cornersWonAvg: 6.1, cornersConcededAvg: 4.4, cardsAvg: 2.8 },
  sporting: { id: 2217, name: 'Sporting', shortName: 'SCP', logo: 'https://media.api-sports.io/football/teams/228.png', attackRating: 1.34, defenseRating: 0.88, cornersWonAvg: 6.7, cornersConcededAvg: 3.9, cardsAvg: 2.2 },
  man_utd: { id: 2218, name: 'Man Utd', shortName: 'MUN', logo: 'https://media.api-sports.io/football/teams/33.png', attackRating: 1.28, defenseRating: 1.12, cornersWonAvg: 6.2, cornersConcededAvg: 5.1, cardsAvg: 2.4 },

  // Championship
  bristol_city: { id: 2301, name: 'Bristol City', shortName: 'BRC', logo: 'https://media.api-sports.io/football/teams/71.png', attackRating: 1.08, defenseRating: 1.04, cornersWonAvg: 5.3, cornersConcededAvg: 4.8, cardsAvg: 2.3 },
  oxford_utd: { id: 2302, name: 'Oxford United', shortName: 'OXF', logo: 'https://media.api-sports.io/football/teams/69.png', attackRating: 0.98, defenseRating: 1.18, cornersWonAvg: 4.7, cornersConcededAvg: 5.6, cardsAvg: 2.6 },
  cardiff: { id: 2303, name: 'Cardiff', shortName: 'CAR', logo: 'https://media.api-sports.io/football/teams/47.png', attackRating: 1.02, defenseRating: 1.15, cornersWonAvg: 5.1, cornersConcededAvg: 5.2, cardsAvg: 2.5 },
  watford: { id: 2304, name: 'Watford', shortName: 'WAT', logo: 'https://media.api-sports.io/football/teams/38.png', attackRating: 1.15, defenseRating: 1.10, cornersWonAvg: 5.6, cornersConcededAvg: 4.9, cardsAvg: 2.4 },
  burnley: { id: 2305, name: 'Burnley', shortName: 'BUR', logo: 'https://media.api-sports.io/football/teams/44.png', attackRating: 1.28, defenseRating: 0.82, cornersWonAvg: 6.4, cornersConcededAvg: 3.8, cardsAvg: 2.0 },
  middlesbrough: { id: 2306, name: 'Middlesbrough', shortName: 'MID', logo: 'https://media.api-sports.io/football/teams/70.png', attackRating: 1.18, defenseRating: 1.06, cornersWonAvg: 5.8, cornersConcededAvg: 4.7, cardsAvg: 2.2 },
  leeds: { id: 2307, name: 'Leeds', shortName: 'LEE', logo: 'https://media.api-sports.io/football/teams/63.png', attackRating: 1.30, defenseRating: 0.85, cornersWonAvg: 6.9, cornersConcededAvg: 3.9, cardsAvg: 2.1 },
  luton: { id: 2308, name: 'Luton', shortName: 'LUT', logo: 'https://media.api-sports.io/football/teams/1359.png', attackRating: 1.12, defenseRating: 1.16, cornersWonAvg: 5.4, cornersConcededAvg: 5.2, cardsAvg: 2.5 },

  // Premier League & La Liga
  chelsea: { id: 104, name: 'Chelsea', shortName: 'CHE', logo: 'https://media.api-sports.io/football/teams/49.png', attackRating: 1.30, defenseRating: 0.98, cornersWonAvg: 6.2, cornersConcededAvg: 4.4, cardsAvg: 2.6 },
  tottenham: { id: 105, name: 'Tottenham', shortName: 'TOT', logo: 'https://media.api-sports.io/football/teams/47.png', attackRating: 1.32, defenseRating: 1.08, cornersWonAvg: 6.4, cornersConcededAvg: 4.9, cardsAvg: 2.3 },
  sevilla: { id: 304, name: 'Sevilla', shortName: 'SEV', logo: 'https://media.api-sports.io/football/teams/536.png', attackRating: 1.18, defenseRating: 1.12, cornersWonAvg: 5.4, cornersConcededAvg: 5.1, cardsAvg: 2.8 },
  leverkusen: { id: 402, name: 'Bayer Leverkusen', shortName: 'B04', logo: 'https://media.api-sports.io/football/teams/168.png', attackRating: 1.42, defenseRating: 0.88, cornersWonAvg: 7.1, cornersConcededAvg: 3.7, cardsAvg: 1.9 },
  juventus: { id: 503, name: 'Juventus', shortName: 'JUV', logo: 'https://media.api-sports.io/football/teams/496.png', attackRating: 1.20, defenseRating: 0.72, cornersWonAvg: 5.6, cornersConcededAvg: 3.9, cardsAvg: 2.2 },
  monaco: { id: 602, name: 'Monaco', shortName: 'ASM', logo: 'https://media.api-sports.io/football/teams/91.png', attackRating: 1.34, defenseRating: 0.94, cornersWonAvg: 6.1, cornersConcededAvg: 4.3, cardsAvg: 2.3 },
};

function createLiveMatch(
  id: string,
  leagueId: string,
  leagueName: string,
  country: string,
  homeKey: string,
  awayKey: string,
  timeString: string,
  minute: number,
  score: [number, number],
  stats: {
    possession: [number, number];
    shotsTotal: [number, number];
    shotsOnTarget: [number, number];
    corners: [number, number];
    yellowCards: [number, number];
    redCards: [number, number];
  }
): MatchFixture {
  const home = REAL_TEAMS[homeKey];
  const away = REAL_TEAMS[awayKey];
  const league = SUPPORTED_LEAGUES.find((l) => l.id === leagueId) || SUPPORTED_LEAGUES[1];

  const pHome = (home.attackRating / away.defenseRating) * 1.2;
  const pAway = away.attackRating / home.defenseRating;
  const sum = pHome + pAway + 0.85;

  return {
    id,
    leagueId,
    leagueName,
    leagueLogo: league.logo,
    country,
    countryFlag: country === 'Europe' ? '🇪🇺' : country === 'England' ? '🏴󠁧󠁢󠁥󠁮󠁧󠁿' : country === 'Spain' ? '🇪🇸' : '🌍',
    round: 'League Phase',
    utcDate: new Date(Date.now() - minute * 60 * 1000).toISOString(),
    status: 'LIVE',
    minute: `${minute}'`,
    homeTeam: { id: home.id, name: home.name, shortName: home.shortName, logo: home.logo },
    awayTeam: { id: away.id, name: away.name, shortName: away.shortName, logo: away.logo },
    score: {
      fullTime: { home: score[0], away: score[1] },
      halfTime: { home: Math.min(score[0], 1), away: Math.min(score[1], 1) },
    },
    odds: {
      homeWin: Number((1.06 / (pHome / sum)).toFixed(2)),
      draw: Number((1.06 / (0.85 / sum)).toFixed(2)),
      awayWin: Number((1.06 / (pAway / sum)).toFixed(2)),
      bookmaker: 'SportyBet',
      over25: 1.82,
      under25: 2.02,
      bttsYes: 1.76,
      bttsNo: 2.04,
    },
    liveStats: {
      minute,
      homeScore: score[0],
      awayScore: score[1],
      period: minute <= 45 ? '1H' : '2H',
      possession: stats.possession,
      shotsTotal: stats.shotsTotal,
      shotsOnTarget: stats.shotsOnTarget,
      corners: stats.corners,
      yellowCards: stats.yellowCards,
      redCards: stats.redCards,
      liveStatusText: `${minute}'`,
    },
  };
}

function createScheduledMatch(
  id: string,
  leagueId: string,
  leagueName: string,
  country: string,
  homeKey: string,
  awayKey: string,
  dateIso: string,
  round: string = 'League Phase'
): MatchFixture {
  const home = REAL_TEAMS[homeKey];
  const away = REAL_TEAMS[awayKey];
  const league = SUPPORTED_LEAGUES.find((l) => l.id === leagueId) || SUPPORTED_LEAGUES[0];

  const pHome = (home.attackRating / away.defenseRating) * league.defaultHomeAdvantage;
  const pAway = away.attackRating / home.defenseRating;
  const sum = pHome + pAway + 0.85;

  return {
    id,
    leagueId,
    leagueName,
    leagueLogo: league.logo,
    country,
    countryFlag: country === 'Europe' ? '🇪🇺' : country === 'England' ? '🏴󠁧󠁢󠁥󠁮󠁧󠁿' : country === 'Spain' ? '🇪🇸' : '🌍',
    round,
    utcDate: dateIso,
    status: 'SCHEDULED',
    homeTeam: { id: home.id, name: home.name, shortName: home.shortName, logo: home.logo },
    awayTeam: { id: away.id, name: away.name, shortName: away.shortName, logo: away.logo },
    score: { fullTime: { home: null, away: null } },
    odds: {
      homeWin: Number((1.06 / (pHome / sum)).toFixed(2)),
      draw: Number((1.06 / (0.85 / sum)).toFixed(2)),
      awayWin: Number((1.06 / (pAway / sum)).toFixed(2)),
      bookmaker: 'SportyBet',
      over25: 1.85,
      under25: 1.95,
      bttsYes: 1.75,
      bttsNo: 2.05,
    },
  };
}

// Generate schedule for Today, Tomorrow, and upcoming days
export class MobileDataProvider {
  public static getFixtures(leagueFilter?: string, dateFilter?: string): MatchFixture[] {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Today timestamps
    const today545 = new Date(now);
    today545.setHours(17, 45, 0, 0);
    const today800 = new Date(now);
    today800.setHours(20, 0, 0, 0);
    const today745 = new Date(now);
    today745.setHours(19, 45, 0, 0);

    // Tomorrow timestamps
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrow545 = new Date(tomorrow);
    tomorrow545.setHours(17, 45, 0, 0);
    const tomorrow800 = new Date(tomorrow);
    tomorrow800.setHours(20, 0, 0, 0);
    const tomorrow745 = new Date(tomorrow);
    tomorrow745.setHours(19, 45, 0, 0);

    // Day + 2 timestamps (Weekend / Upcoming)
    const day2 = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const day3 = new Date(now.getTime() + 72 * 60 * 60 * 1000);

    const allFixtures: MatchFixture[] = [
      // === TODAY: UEFA CHAMPIONS LEAGUE (Europe) ===
      // Match 1: LIVE 68'
      createLiveMatch(
        'ucl_today_1',
        'CL',
        'UEFA Champions League',
        'Europe',
        'bodo',
        'lask',
        '5:45 PM',
        68,
        [2, 1],
        {
          possession: [58, 42],
          shotsTotal: [14, 8],
          shotsOnTarget: [6, 3],
          corners: [7, 3],
          yellowCards: [1, 2],
          redCards: [0, 0],
        }
      ),
      // Match 2: LIVE 74'
      createLiveMatch(
        'ucl_today_2',
        'CL',
        'UEFA Champions League',
        'Europe',
        'galatasaray',
        'aston_villa',
        '5:45 PM',
        74,
        [1, 1],
        {
          possession: [51, 49],
          shotsTotal: [11, 13],
          shotsOnTarget: [4, 5],
          corners: [5, 6],
          yellowCards: [3, 2],
          redCards: [0, 0],
        }
      ),
      // Matches 3-9: 8:00 PM
      createScheduledMatch('ucl_today_3', 'CL', 'UEFA Champions League', 'Europe', 'arsenal', 'dortmund', today800.toISOString()),
      createScheduledMatch('ucl_today_4', 'CL', 'UEFA Champions League', 'Europe', 'como', 'aek', today800.toISOString()),
      createScheduledMatch('ucl_today_5', 'CL', 'UEFA Champions League', 'Europe', 'feyenoord', 'porto', today800.toISOString()),
      createScheduledMatch('ucl_today_6', 'CL', 'UEFA Champions League', 'Europe', 'mancity', 'napoli', today800.toISOString()),
      createScheduledMatch('ucl_today_7', 'CL', 'UEFA Champions League', 'Europe', 'leipzig', 'lens', today800.toISOString()),
      createScheduledMatch('ucl_today_8', 'CL', 'UEFA Champions League', 'Europe', 'real_madrid', 'psv', today800.toISOString()),
      createScheduledMatch('ucl_today_9', 'CL', 'UEFA Champions League', 'Europe', 'slovan', 'real_betis', today800.toISOString()),

      // === TODAY: CHAMPIONSHIP (England) ===
      createScheduledMatch('elc_today_1', 'ELC', 'Championship', 'England', 'bristol_city', 'oxford_utd', today745.toISOString()),
      createScheduledMatch('elc_today_2', 'ELC', 'Championship', 'England', 'cardiff', 'watford', today745.toISOString()),

      // === TOMORROW: UEFA CHAMPIONS LEAGUE (Europe) ===
      createScheduledMatch('ucl_tom_1', 'CL', 'UEFA Champions League', 'Europe', 'slavia_praha', 'villarreal', tomorrow545.toISOString()),
      createScheduledMatch('ucl_tom_2', 'CL', 'UEFA Champions League', 'Europe', 'sabah', 'barcelona', tomorrow545.toISOString()),
      createScheduledMatch('ucl_tom_3', 'CL', 'UEFA Champions League', 'Europe', 'atletico_madrid', 'viking', tomorrow800.toISOString()),
      createScheduledMatch('ucl_tom_4', 'CL', 'UEFA Champions League', 'Europe', 'club_brugge', 'liverpool', tomorrow800.toISOString()),
      createScheduledMatch('ucl_tom_5', 'CL', 'UEFA Champions League', 'Europe', 'inter', 'stuttgart', tomorrow800.toISOString()),
      createScheduledMatch('ucl_tom_6', 'CL', 'UEFA Champions League', 'Europe', 'lille', 'bayern', tomorrow800.toISOString()),
      createScheduledMatch('ucl_tom_7', 'CL', 'UEFA Champions League', 'Europe', 'psg', 'roma', tomorrow800.toISOString()),
      createScheduledMatch('ucl_tom_8', 'CL', 'UEFA Champions League', 'Europe', 'shakhtar', 'fenerbahce', tomorrow800.toISOString()),
      createScheduledMatch('ucl_tom_9', 'CL', 'UEFA Champions League', 'Europe', 'sporting', 'man_utd', tomorrow800.toISOString()),

      // === TOMORROW: CHAMPIONSHIP (England) ===
      createScheduledMatch('elc_tom_1', 'ELC', 'Championship', 'England', 'burnley', 'middlesbrough', tomorrow745.toISOString()),
      createScheduledMatch('elc_tom_2', 'ELC', 'Championship', 'England', 'leeds', 'luton', tomorrow745.toISOString()),

      // === UPCOMING: PREMIER LEAGUE & LA LIGA & BUNDESLIGA ===
      createScheduledMatch('pl_wk_1', 'PL', 'Premier League', 'England', 'arsenal', 'chelsea', day2.toISOString(), 'Matchday 13'),
      createScheduledMatch('pl_wk_2', 'PL', 'Premier League', 'England', 'liverpool', 'mancity', day2.toISOString(), 'Matchday 13'),
      createScheduledMatch('pl_wk_3', 'PL', 'Premier League', 'England', 'tottenham', 'aston_villa', day3.toISOString(), 'Matchday 13'),
      createScheduledMatch('pd_wk_1', 'PD', 'La Liga', 'Spain', 'barcelona', 'real_madrid', day2.toISOString(), 'Matchday 14'),
      createScheduledMatch('pd_wk_2', 'PD', 'La Liga', 'Spain', 'atletico_madrid', 'sevilla', day3.toISOString(), 'Matchday 14'),
      createScheduledMatch('bl1_wk_1', 'BL1', 'Bundesliga', 'Germany', 'bayern', 'leverkusen', day2.toISOString(), 'Matchday 12'),
      createScheduledMatch('sa_wk_1', 'SA', 'Serie A', 'Italy', 'inter', 'juventus', day2.toISOString(), 'Matchday 13'),
      createScheduledMatch('fl1_wk_1', 'FL1', 'Ligue 1', 'France', 'psg', 'monaco', day3.toISOString(), 'Matchday 13'),
    ];

    let filtered = allFixtures;

    if (leagueFilter && leagueFilter !== 'ALL') {
      filtered = filtered.filter((f) => f.leagueId.toUpperCase() === leagueFilter.toUpperCase());
    }

    return filtered;
  }

  public static getTeamMatchStats(teamId: string | number): TeamMatchStats[] {
    const numericId = Number(teamId);
    const profile = Object.values(REAL_TEAMS).find((t) => t.id === numericId) || REAL_TEAMS.arsenal;

    const stats: TeamMatchStats[] = [];
    const now = new Date();

    for (let i = 1; i <= 15; i++) {
      const matchDate = new Date(now.getTime() - i * 4 * 24 * 60 * 60 * 1000);
      const isHome = i % 2 === 0;
      const baseGoals = Math.max(0, Math.round(profile.attackRating * (0.8 + Math.random() * 0.8)));
      const baseAgainst = Math.max(0, Math.round(profile.defenseRating * (0.5 + Math.random() * 0.9)));
      const corners = Math.max(2, Math.round(profile.cornersWonAvg + (Math.random() * 3 - 1.5)));
      const cornersAgainst = Math.max(2, Math.round(profile.cornersConcededAvg + (Math.random() * 3 - 1.5)));
      const yellowCards = Math.max(0, Math.round(profile.cardsAvg + (Math.random() * 2 - 1)));

      stats.push({
        matchId: `hist_${teamId}_${i}`,
        date: matchDate.toISOString(),
        isHome,
        opponentId: 9990 + i,
        opponentName: isHome ? 'Away Opponent' : 'Home Opponent',
        goalsFor: baseGoals,
        goalsAgainst: baseAgainst,
        cornersFor: corners,
        cornersAgainst,
        yellowCards,
        redCards: Math.random() > 0.92 ? 1 : 0,
        shotsTotal: corners + baseGoals * 3 + 4,
        shotsOnTarget: baseGoals + 3,
      });
    }

    return stats;
  }

  public static getTeamRecentMatches(teamId: string | number, count: number = 10): TeamMatchStats[] {
    return this.getTeamMatchStats(teamId).slice(0, count);
  }

  public static getStandings(leagueId: string): TeamStanding[] {
    if (leagueId.toUpperCase() === 'CL') {
      return [
        { position: 1, teamId: REAL_TEAMS.mancity.id, teamName: 'Manchester City', playedGames: 4, won: 4, draw: 0, lost: 0, points: 12, goalsFor: 12, goalsAgainst: 2, goalDifference: 10, form: 'WWWW' },
        { position: 2, teamId: REAL_TEAMS.barcelona.id, teamName: 'Barcelona', playedGames: 4, won: 3, draw: 1, lost: 0, points: 10, goalsFor: 13, goalsAgainst: 4, goalDifference: 9, form: 'WDWW' },
        { position: 3, teamId: REAL_TEAMS.liverpool.id, teamName: 'Liverpool', playedGames: 4, won: 3, draw: 1, lost: 0, points: 10, goalsFor: 9, goalsAgainst: 3, goalDifference: 6, form: 'WWWD' },
        { position: 4, teamId: REAL_TEAMS.arsenal.id, teamName: 'Arsenal', playedGames: 4, won: 3, draw: 0, lost: 1, points: 9, goalsFor: 8, goalsAgainst: 2, goalDifference: 6, form: 'LWWW' },
        { position: 5, teamId: REAL_TEAMS.real_madrid.id, teamName: 'Real Madrid', playedGames: 4, won: 3, draw: 0, lost: 1, points: 9, goalsFor: 10, goalsAgainst: 5, goalDifference: 5, form: 'WWLW' },
        { position: 6, teamId: REAL_TEAMS.bayern.id, teamName: 'Bayern Munich', playedGames: 4, won: 3, draw: 0, lost: 1, points: 9, goalsFor: 11, goalsAgainst: 7, goalDifference: 4, form: 'WLWW' },
        { position: 7, teamId: REAL_TEAMS.inter.id, teamName: 'Inter Milan', playedGames: 4, won: 2, draw: 2, lost: 0, points: 8, goalsFor: 6, goalsAgainst: 1, goalDifference: 5, form: 'WDDW' },
        { position: 8, teamId: REAL_TEAMS.atletico_madrid.id, teamName: 'Atlético Madrid', playedGames: 4, won: 2, draw: 1, lost: 1, points: 7, goalsFor: 7, goalsAgainst: 5, goalDifference: 2, form: 'DLWW' },
        { position: 9, teamId: REAL_TEAMS.bodo.id, teamName: 'Bodø/Glimt', playedGames: 4, won: 2, draw: 1, lost: 1, points: 7, goalsFor: 6, goalsAgainst: 5, goalDifference: 1, form: 'WDWL' },
        { position: 10, teamId: REAL_TEAMS.galatasaray.id, teamName: 'Galatasaray', playedGames: 4, won: 2, draw: 0, lost: 2, points: 6, goalsFor: 8, goalsAgainst: 8, goalDifference: 0, form: 'LWLW' },
        { position: 11, teamId: REAL_TEAMS.aston_villa.id, teamName: 'Aston Villa', playedGames: 4, won: 2, draw: 0, lost: 2, points: 6, goalsFor: 6, goalsAgainst: 6, goalDifference: 0, form: 'WWLL' },
        { position: 12, teamId: REAL_TEAMS.dortmund.id, teamName: 'Borussia Dortmund', playedGames: 4, won: 2, draw: 0, lost: 2, points: 6, goalsFor: 7, goalsAgainst: 8, goalDifference: -1, form: 'LWLL' },
      ];
    }

    if (leagueId.toUpperCase() === 'ELC') {
      return [
        { position: 1, teamId: REAL_TEAMS.burnley.id, teamName: 'Burnley', playedGames: 16, won: 11, draw: 3, lost: 2, points: 36, goalsFor: 28, goalsAgainst: 9, goalDifference: 19, form: 'WDWWW' },
        { position: 2, teamId: REAL_TEAMS.leeds.id, teamName: 'Leeds United', playedGames: 16, won: 10, draw: 4, lost: 2, points: 34, goalsFor: 30, goalsAgainst: 12, goalDifference: 18, form: 'WWWDW' },
        { position: 3, teamId: REAL_TEAMS.watford.id, teamName: 'Watford', playedGames: 16, won: 9, draw: 2, lost: 5, points: 29, goalsFor: 25, goalsAgainst: 19, goalDifference: 6, form: 'LWWLW' },
        { position: 4, teamId: REAL_TEAMS.bristol_city.id, teamName: 'Bristol City', playedGames: 16, won: 7, draw: 6, lost: 3, points: 27, goalsFor: 21, goalsAgainst: 17, goalDifference: 4, form: 'DDWWD' },
        { position: 5, teamId: REAL_TEAMS.middlesbrough.id, teamName: 'Middlesbrough', playedGames: 16, won: 8, draw: 3, lost: 5, points: 27, goalsFor: 23, goalsAgainst: 18, goalDifference: 5, form: 'WWLWL' },
        { position: 6, teamId: REAL_TEAMS.cardiff.id, teamName: 'Cardiff City', playedGames: 16, won: 6, draw: 4, lost: 6, points: 22, goalsFor: 18, goalsAgainst: 20, goalDifference: -2, form: 'WLDDL' },
      ];
    }

    // Default Premier League
    return [
      { position: 1, teamId: REAL_TEAMS.arsenal.id, teamName: 'Arsenal', playedGames: 12, won: 9, draw: 2, lost: 1, points: 29, goalsFor: 26, goalsAgainst: 9, goalDifference: 17, form: 'WDWWW' },
      { position: 2, teamId: REAL_TEAMS.liverpool.id, teamName: 'Liverpool', playedGames: 12, won: 9, draw: 1, lost: 2, points: 28, goalsFor: 28, goalsAgainst: 11, goalDifference: 17, form: 'WWLWW' },
      { position: 3, teamId: REAL_TEAMS.mancity.id, teamName: 'Manchester City', playedGames: 12, won: 8, draw: 2, lost: 2, points: 26, goalsFor: 29, goalsAgainst: 14, goalDifference: 15, form: 'LWWWD' },
      { position: 4, teamId: REAL_TEAMS.chelsea.id, teamName: 'Chelsea', playedGames: 12, won: 7, draw: 3, lost: 2, points: 24, goalsFor: 24, goalsAgainst: 14, goalDifference: 10, form: 'WWDWD' },
      { position: 5, teamId: REAL_TEAMS.aston_villa.id, teamName: 'Aston Villa', playedGames: 12, won: 7, draw: 1, lost: 4, points: 22, goalsFor: 20, goalsAgainst: 16, goalDifference: 4, form: 'LWWLL' },
      { position: 6, teamId: REAL_TEAMS.tottenham.id, teamName: 'Tottenham', playedGames: 12, won: 6, draw: 2, lost: 4, points: 20, goalsFor: 23, goalsAgainst: 18, goalDifference: 5, form: 'DWLLW' },
    ];
  }
}
