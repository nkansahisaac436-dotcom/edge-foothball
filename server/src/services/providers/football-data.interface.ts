import { BookmakerOdds, MatchFixture, TeamMatchStats, TeamStanding } from '../../types/index.js';

export interface IFootballDataProvider {
  readonly name: string;
  
  getFixtures(leagueId: string, daysAhead?: number): Promise<{
    fixtures: MatchFixture[];
    lastUpdated: string;
  }>;

  getTeamRecentMatches(
    teamId: string | number,
    leagueId: string,
    count?: number
  ): Promise<TeamMatchStats[]>;

  getStandings(leagueId: string): Promise<TeamStanding[]>;

  getOdds?(fixtureId: string | number): Promise<BookmakerOdds | undefined>;

  getH2H?(
    teamAId: string | number,
    teamBId: string | number,
    count?: number
  ): Promise<MatchFixture[]>;
}
