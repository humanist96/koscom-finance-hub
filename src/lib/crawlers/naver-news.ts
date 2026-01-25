/**
 * Naver News Crawler
 * Lightweight crawler using Cheerio for serverless environments
 */

import * as cheerio from 'cheerio';
import { loggers, createTimer } from '../logger';
import {
  cleanText,
  fetchWithRetry,
  titleMentionsCompany,
  delay,
  truncateText,
} from './utils';
import { DEFAULT_CRAWLER_OPTIONS, type NewsItem, type CrawlerOptions } from './types';

const log = loggers.crawler;

/**
 * Build Naver news search URL
 */
function buildSearchUrl(companyName: string): string {
  const query = encodeURIComponent(companyName);
  return `https://search.naver.com/search.naver?where=news&query=${query}&sort=1&sm=tab_smr&nso=so:dd,p:all`;
}

/**
 * Extract article content from Naver news page
 */
export async function fetchArticleContent(url: string): Promise<string> {
  try {
    const html = await fetchWithRetry(url);
    const $ = cheerio.load(html);

    // Try multiple content selectors
    let content =
      $('#dic_area').text() ||
      $('#articleBodyContents').text() ||
      $('.news_end').text() ||
      $('article').text() ||
      $('.article_body').text();

    content = cleanText(content);

    // Fallback to meta description
    if (content.length < 50) {
      content = $('meta[property="og:description"]').attr('content') || '';
      content = cleanText(content);
    }

    return truncateText(content, 2000);
  } catch (error) {
    log.warn({ url, error }, 'Failed to fetch article content');
    return '';
  }
}

/**
 * Parse news items from search results HTML
 */
function parseSearchResults(
  html: string,
  companyName: string
): Array<{ title: string; sourceUrl: string; sourceName: string }> {
  const $ = cheerio.load(html);
  const results: Array<{ title: string; sourceUrl: string; sourceName: string }> = [];

  // Primary parsing: structured news elements
  $('.news_area')
    .toArray()
    .slice(0, 5)
    .forEach((element) => {
      const $el = $(element);
      const titleEl = $el.find('.news_tit');
      const title = cleanText(titleEl.text());
      const sourceUrl = titleEl.attr('href') || '';
      const sourceName = cleanText($el.find('.info.press').text()) || '네이버뉴스';

      if (
        title.length > 5 &&
        sourceUrl &&
        titleMentionsCompany(title, companyName)
      ) {
        results.push({ title, sourceUrl, sourceName });
      }
    });

  // Fallback parsing: JSON data extraction
  if (results.length === 0) {
    const jsonMatches = html.matchAll(/"title":"([^"]+)"/g);
    const urlMatches = [
      ...html.matchAll(/https:\/\/n\.news\.naver\.com\/mnews\/article\/\d+\/\d+/g),
    ];
    const titles: string[] = [];

    for (const match of jsonMatches) {
      const title = cleanText(match[1]);
      if (
        title.length > 10 &&
        !title.includes('검색') &&
        !title.includes('네이버') &&
        titleMentionsCompany(title, companyName)
      ) {
        titles.push(title);
      }
    }

    const uniqueUrls = [...new Set(urlMatches.map((m) => m[0]))];
    for (let i = 0; i < Math.min(titles.length, uniqueUrls.length, 5); i++) {
      results.push({
        title: titles[i],
        sourceUrl: uniqueUrls[i],
        sourceName: '네이버뉴스',
      });
    }
  }

  return results;
}

/**
 * Crawl news for a specific company
 */
export async function crawlCompanyNews(
  companyName: string,
  options: Partial<CrawlerOptions> = {},
  checkDuplicate?: (url: string) => Promise<boolean>,
  summarize?: (title: string, content: string) => Promise<string>
): Promise<NewsItem[]> {
  const opts = { ...DEFAULT_CRAWLER_OPTIONS, ...options } as Required<CrawlerOptions>;
  const timer = createTimer(`crawl:${companyName}`);
  const newsItems: NewsItem[] = [];

  try {
    const searchUrl = buildSearchUrl(companyName);
    const html = await fetchWithRetry(searchUrl, opts.retryAttempts);
    const parsed = parseSearchResults(html, companyName);

    log.debug({ companyName, resultsFound: parsed.length }, 'Search results parsed');

    for (const item of parsed) {
      if (newsItems.length >= opts.maxNewsPerCompany) break;

      // Check for duplicates if checker provided
      if (checkDuplicate && (await checkDuplicate(item.sourceUrl))) {
        log.debug({ title: item.title.substring(0, 40) }, 'Skipping duplicate');
        continue;
      }

      // Fetch article content
      const content = await fetchArticleContent(item.sourceUrl);

      // Generate summary
      let summary = truncateText(content || item.title, 200);
      if (opts.enableAiSummary && summarize && content.length >= 50) {
        try {
          summary = await summarize(item.title, content);
        } catch (error) {
          log.warn({ error }, 'AI summarization failed, using fallback');
        }
      }

      newsItems.push({
        title: item.title,
        content: content || item.title,
        summary,
        sourceUrl: item.sourceUrl,
        sourceName: item.sourceName,
        publishedAt: new Date(),
      });

      await delay(opts.delayBetweenRequests);
    }

    timer.end({ itemsFound: newsItems.length });
    return newsItems;
  } catch (error) {
    timer.endWithError(error, { companyName });
    return [];
  }
}

// Re-export the default options for external use
export { DEFAULT_CRAWLER_OPTIONS } from './types';
