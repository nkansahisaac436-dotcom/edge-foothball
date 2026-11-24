import fs from 'fs';
import path from 'path';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
  lastUpdated: string;
}

export class CacheService {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private cacheDir: string;

  constructor(cacheDirName: string = '.cache') {
    this.cacheDir = path.resolve(process.cwd(), cacheDirName);
    this.ensureCacheDir();
    this.loadFromDisk();
  }

  private ensureCacheDir() {
    try {
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      }
    } catch (e) {
      // Ignore directory creation error in read-only environment
    }
  }

  private loadFromDisk() {
    try {
      if (!fs.existsSync(this.cacheDir)) return;
      const files = fs.readdirSync(this.cacheDir);
      const now = Date.now();
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const filePath = path.join(this.cacheDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const entry: CacheEntry<any> = JSON.parse(content);
        if (now - entry.timestamp < entry.ttlMs) {
          const key = decodeURIComponent(file.replace('.json', ''));
          this.memoryCache.set(key, entry);
        } else {
          // expired file
          try { fs.unlinkSync(filePath); } catch {}
        }
      }
    } catch (e) {
      // fallback to pure memory cache
    }
  }

  public get<T>(key: string): { data: T; lastUpdated: string } | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttlMs) {
      this.memoryCache.delete(key);
      try {
        const filePath = path.join(this.cacheDir, `${encodeURIComponent(key)}.json`);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch {}
      return null;
    }

    return {
      data: entry.data as T,
      lastUpdated: entry.lastUpdated,
    };
  }

  public set<T>(key: string, data: T, ttlMs: number): { data: T; lastUpdated: string } {
    const now = Date.now();
    const lastUpdated = new Date(now).toISOString();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttlMs,
      lastUpdated,
    };

    this.memoryCache.set(key, entry);

    try {
      this.ensureCacheDir();
      const filePath = path.join(this.cacheDir, `${encodeURIComponent(key)}.json`);
      fs.writeFileSync(filePath, JSON.stringify(entry), 'utf-8');
    } catch (e) {
      // Disk write error is non-fatal
    }

    return { data, lastUpdated };
  }

  public clear(): void {
    this.memoryCache.clear();
    try {
      if (fs.existsSync(this.cacheDir)) {
        const files = fs.readdirSync(this.cacheDir);
        for (const file of files) {
          try { fs.unlinkSync(path.join(this.cacheDir, file)); } catch {}
        }
      }
    } catch {}
  }
}

// Global cache instance
export const cacheService = new CacheService();

// TTL Constants
export const TTL_FIXTURES = 60 * 60 * 1000; // 1 hour
export const TTL_TEAM_STATS = 24 * 60 * 60 * 1000; // 24 hours
export const TTL_STANDINGS = 6 * 60 * 60 * 1000; // 6 hours
export const TTL_ODDS = 30 * 60 * 1000; // 30 minutes
