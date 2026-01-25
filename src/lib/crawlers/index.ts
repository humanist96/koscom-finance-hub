/**
 * Crawler Module Exports
 *
 * Unified crawler module for news aggregation
 */

// Main service
export {
  runCrawler,
  getLastCrawlStatus,
  isAiSummarizationAvailable,
} from './crawler-service';

// Naver news specific
export {
  crawlCompanyNews,
  fetchArticleContent,
} from './naver-news';

// AI summarization
export { summarizeWithOpenAI } from './summarizer';

// Utilities
export {
  cleanText,
  isPersonnelNews,
  classifyCategory,
  isValidNaverNewsUrl,
  fetchWithRetry,
  delay,
} from './utils';

// Types
export type {
  NewsItem,
  CrawlResult,
  CrawlStatus,
  CompanyInfo,
  NewsCategory,
  CrawlerOptions,
} from './types';

export { DEFAULT_CRAWLER_OPTIONS } from './types';
