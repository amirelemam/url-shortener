export interface URL {
  id: string;
  longUrl: string;
  slug: string;
  shortUrl: string;
  createdAt: string;
  visitCount?: number;
}

export interface Analytics {
  url: URL;
  analytics: {
    totalVisits: number;
    lastDayVisits: number;
    browsers: Record<string, number>;
    recentVisits: Array<{
      visitedAt: string;
      ipAddress?: string;
    }>;
  };
}