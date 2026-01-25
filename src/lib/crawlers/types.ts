/**
 * Crawler type definitions
 */

export interface NewsItem {
  title: string;
  content: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: Date;
  category?: string;
  isPersonnel?: boolean;
}

export interface CrawlResult {
  success: boolean;
  totalFound: number;
  totalSaved: number;
  skippedDuplicates: number;
  startedAt: Date;
  completedAt: Date;
  error?: string;
  companiesProcessed?: number;
}

export interface CrawlStatus {
  lastCrawl: {
    id: string;
    status: string;
    itemsFound: number | null;
    startedAt: Date;
    completedAt: Date | null;
    errorMessage: string | null;
  } | null;
  isRunning: boolean;
}

export interface CompanyInfo {
  id: string;
  name: string;
}

export type NewsCategory = 'GENERAL' | 'PERSONNEL' | 'BUSINESS' | 'PRODUCT' | 'IR' | 'EVENT';

export interface CrawlerOptions {
  maxNewsPerCompany?: number;
  delayBetweenRequests?: number;
  enableAiSummary?: boolean;
  retryAttempts?: number;
}

export const DEFAULT_CRAWLER_OPTIONS: Required<CrawlerOptions> = {
  maxNewsPerCompany: 3,
  delayBetweenRequests: 300,
  enableAiSummary: true,
  retryAttempts: 3,
};
