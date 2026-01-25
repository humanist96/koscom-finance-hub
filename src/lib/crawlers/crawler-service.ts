/**
 * Main Crawler Service
 * Orchestrates news crawling for all companies
 */

import { prisma } from '../prisma';
import { loggers, createTimer } from '../logger';
import { crawlCompanyNews } from './naver-news';
import { summarizeWithOpenAI, isAiSummarizationAvailable } from './summarizer';
import { classifyCategory, isPersonnelNews, delay } from './utils';
import {
  DEFAULT_CRAWLER_OPTIONS,
  type CrawlResult,
  type CrawlStatus,
  type CompanyInfo,
  type NewsItem,
  type CrawlerOptions,
} from './types';

const log = loggers.crawler;

/**
 * Check if news URL already exists in database
 */
async function isUrlAlreadyExists(sourceUrl: string): Promise<boolean> {
  const exists = await prisma.news.findFirst({
    where: { sourceUrl },
    select: { id: true },
  });
  return !!exists;
}

/**
 * Save news item to database
 */
async function saveNewsItem(
  companyId: string,
  news: NewsItem
): Promise<boolean> {
  try {
    // Double-check for duplicates (race condition prevention)
    const exists = await prisma.news.findFirst({
      where: { sourceUrl: news.sourceUrl },
    });
    if (exists) return false;

    await prisma.news.create({
      data: {
        companyId,
        title: news.title,
        content: news.content,
        summary: news.summary,
        sourceUrl: news.sourceUrl,
        sourceName: news.sourceName,
        category: news.category || classifyCategory(news.title),
        isPersonnel: news.isPersonnel ?? isPersonnelNews(news.title),
        publishedAt: news.publishedAt,
      },
    });

    log.info(
      { companyId, title: news.title.substring(0, 40) },
      'News item saved'
    );
    return true;
  } catch (error) {
    log.error({ error, sourceUrl: news.sourceUrl }, 'Failed to save news item');
    return false;
  }
}

/**
 * Get active companies for crawling
 */
async function getActiveCompanies(): Promise<CompanyInfo[]> {
  return prisma.securitiesCompany.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });
}

/**
 * Create crawl log entry
 */
async function createCrawlLog(startedAt: Date) {
  return prisma.crawlLog.create({
    data: {
      targetUrl: 'https://search.naver.com/search.naver',
      status: 'RUNNING',
      startedAt,
    },
  });
}

/**
 * Update crawl log with results
 */
async function updateCrawlLog(
  id: string,
  status: 'SUCCESS' | 'FAILED',
  itemsFound: number,
  completedAt: Date,
  errorMessage?: string
) {
  return prisma.crawlLog.update({
    where: { id },
    data: {
      status,
      itemsFound,
      completedAt,
      errorMessage,
    },
  });
}

/**
 * Run the main crawler
 */
export async function runCrawler(
  options: Partial<CrawlerOptions> = {}
): Promise<CrawlResult> {
  const opts = { ...DEFAULT_CRAWLER_OPTIONS, ...options } as Required<CrawlerOptions>;
  const startedAt = new Date();
  const timer = createTimer('crawler:full-run');

  let totalFound = 0;
  let totalSaved = 0;
  let skippedDuplicates = 0;

  const crawlLog = await createCrawlLog(startedAt);

  try {
    const companies = await getActiveCompanies();
    log.info(
      {
        companyCount: companies.length,
        aiEnabled: isAiSummarizationAvailable(),
      },
      'Starting crawl'
    );

    for (const company of companies) {
      log.info({ companyName: company.name }, 'Processing company');

      const summarizer = opts.enableAiSummary ? summarizeWithOpenAI : undefined;
      const newsList = await crawlCompanyNews(
        company.name,
        opts,
        isUrlAlreadyExists,
        summarizer
      );

      totalFound += newsList.length;

      for (const news of newsList) {
        if (await saveNewsItem(company.id, news)) {
          totalSaved++;
        } else {
          skippedDuplicates++;
        }
      }

      await delay(opts.delayBetweenRequests);
    }

    const completedAt = new Date();
    await updateCrawlLog(crawlLog.id, 'SUCCESS', totalFound, completedAt);

    const result: CrawlResult = {
      success: true,
      totalFound,
      totalSaved,
      skippedDuplicates,
      startedAt,
      completedAt,
      companiesProcessed: companies.length,
    };

    timer.end({ ...result });
    log.info({ ...result }, 'Crawl completed successfully');

    return result;
  } catch (error) {
    const completedAt = new Date();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await updateCrawlLog(crawlLog.id, 'FAILED', totalFound, completedAt, errorMessage);

    const result: CrawlResult = {
      success: false,
      totalFound,
      totalSaved,
      skippedDuplicates,
      startedAt,
      completedAt,
      error: errorMessage,
    };

    timer.endWithError(error, { ...result });
    log.error({ error }, 'Crawl failed');

    return result;
  }
}

/**
 * Get last crawl status
 */
export async function getLastCrawlStatus(): Promise<CrawlStatus> {
  const lastCrawl = await prisma.crawlLog.findFirst({
    where: { status: { in: ['SUCCESS', 'FAILED'] } },
    orderBy: { completedAt: 'desc' },
  });

  const runningCrawl = await prisma.crawlLog.findFirst({
    where: { status: 'RUNNING' },
  });

  return {
    lastCrawl,
    isRunning: !!runningCrawl,
  };
}

// Re-export for backward compatibility
export { isAiSummarizationAvailable };
