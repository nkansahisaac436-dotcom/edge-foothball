import { IFootballDataProvider } from './football-data.interface.js';
import { ApiFootballProvider } from './api-football.provider.js';
import { FootballDataOrgProvider } from './football-data-org.provider.js';
import { MockFootballDataProvider } from './mock.provider.js';

export class FootballProviderFactory {
  private static instance: IFootballDataProvider | null = null;

  public static getProvider(): IFootballDataProvider {
    if (this.instance) {
      return this.instance;
    }

    const providerType = process.env.FOOTBALL_DATA_PROVIDER?.toLowerCase() || 'auto';
    const apiFootballKey = process.env.API_FOOTBALL_KEY;
    const footballDataOrgKey = process.env.FOOTBALL_DATA_ORG_KEY;

    if ((providerType === 'api-football' || providerType === 'auto') && apiFootballKey) {
      console.log('⚡ Initializing ApiFootballProvider with provided API key');
      this.instance = new ApiFootballProvider(apiFootballKey);
      return this.instance;
    }

    if ((providerType === 'football-data-org' || providerType === 'auto') && footballDataOrgKey) {
      console.log('⚡ Initializing FootballDataOrgProvider with provided API key');
      this.instance = new FootballDataOrgProvider(footballDataOrgKey);
      return this.instance;
    }

    console.log('⚡ No external API key found or MOCK requested; initializing MockFootballDataProvider (rich realistic match data)');
    this.instance = new MockFootballDataProvider();
    return this.instance;
  }

  public static setProvider(provider: IFootballDataProvider): void {
    this.instance = provider;
  }
}
