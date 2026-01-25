/**
 * Shared utility functions for crawlers
 */

import type { NewsCategory } from './types';

/**
 * Clean HTML entities and extra whitespace from text
 */
export function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Personnel-related keyword patterns
 */
const PERSONNEL_PATTERNS = /인사|임명|선임|승진|취임|사임|퇴임|대표이사|부사장|전무|상무|본부장|조직개편|사장|신임|부회장|회장|CEO|CFO|CTO/;

/**
 * Check if text contains personnel-related keywords
 */
export function isPersonnelNews(text: string): boolean {
  return PERSONNEL_PATTERNS.test(text);
}

/**
 * Category classification patterns
 */
const CATEGORY_PATTERNS: Record<NewsCategory, RegExp> = {
  PERSONNEL: PERSONNEL_PATTERNS,
  BUSINESS: /실적|영업이익|순이익|매출|분기|결산|흑자|적자|수익|손실|성장/,
  PRODUCT: /펀드|ETF|상품|서비스|출시|오픈|MTS|HTS|앱|플랫폼|런칭|신규/,
  IR: /공시|IR|주주|배당|증자|IPO|상장|유상증자|무상증자/,
  EVENT: /세미나|컨퍼런스|이벤트|행사|포럼|설명회/,
  GENERAL: /.*/,
};

/**
 * Classify news into category based on content
 */
export function classifyCategory(text: string): NewsCategory {
  if (CATEGORY_PATTERNS.PERSONNEL.test(text)) return 'PERSONNEL';
  if (CATEGORY_PATTERNS.BUSINESS.test(text)) return 'BUSINESS';
  if (CATEGORY_PATTERNS.PRODUCT.test(text)) return 'PRODUCT';
  if (CATEGORY_PATTERNS.IR.test(text)) return 'IR';
  if (CATEGORY_PATTERNS.EVENT.test(text)) return 'EVENT';
  return 'GENERAL';
}

/**
 * Validate if URL is a valid Naver news URL
 */
export function isValidNaverNewsUrl(url: string): boolean {
  return url.includes('n.news.naver.com') || url.includes('news.naver.com');
}

/**
 * Fetch URL with retry logic
 */
export async function fetchWithRetry(
  url: string,
  retries: number = 3
): Promise<string> {
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
  };

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { headers });
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      if (i === retries - 1) throw error;
    }
    await delay(1000 * (i + 1));
  }
  throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}

/**
 * Delay execution
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract company short name (remove '증권' suffix)
 */
export function getCompanyShortName(companyName: string): string {
  return companyName.replace('증권', '');
}

/**
 * Check if title mentions the company
 */
export function titleMentionsCompany(title: string, companyName: string): boolean {
  const shortName = getCompanyShortName(companyName);
  return title.includes(companyName) || title.includes(shortName);
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength);
}
