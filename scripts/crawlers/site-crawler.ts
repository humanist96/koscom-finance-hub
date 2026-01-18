import * as cheerio from 'cheerio';
import axios from 'axios';
import { BaseCrawler, CrawledNews, prisma } from './base-crawler';

// 사이트별 크롤링 설정
interface SiteCrawlerConfig {
  companyCode: string;
  companyName: string;
  newsroomUrl: string;
  selectors: {
    listItem: string;
    title: string;
    link: string;
    date?: string;
    content?: string;
  };
  dateParser?: (dateStr: string) => Date;
}

// 기본 날짜 파서
function defaultDateParser(dateStr: string): Date {
  // 다양한 형식 시도
  const cleaned = dateStr.trim();

  // YYYY.MM.DD 또는 YYYY-MM-DD
  const match1 = cleaned.match(/(\d{4})[.-](\d{2})[.-](\d{2})/);
  if (match1) {
    return new Date(parseInt(match1[1]), parseInt(match1[2]) - 1, parseInt(match1[3]));
  }

  // YY.MM.DD
  const match2 = cleaned.match(/(\d{2})[.-](\d{2})[.-](\d{2})/);
  if (match2) {
    const year = 2000 + parseInt(match2[1]);
    return new Date(year, parseInt(match2[2]) - 1, parseInt(match2[3]));
  }

  // 그 외 Date.parse 시도
  const parsed = Date.parse(cleaned);
  if (!isNaN(parsed)) {
    return new Date(parsed);
  }

  return new Date();
}

export class SiteCrawler extends BaseCrawler {
  private siteConfig: SiteCrawlerConfig;

  constructor(siteConfig: SiteCrawlerConfig) {
    super({
      name: `${siteConfig.companyName} 뉴스룸`,
      targetUrl: siteConfig.newsroomUrl,
      companyCode: siteConfig.companyCode,
    });
    this.siteConfig = siteConfig;
  }

  async crawl(): Promise<CrawledNews[]> {
    const response = await axios.get(this.config.targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const { selectors } = this.siteConfig;
    const dateParser = this.siteConfig.dateParser || defaultDateParser;
    const newsList: CrawledNews[] = [];

    $(selectors.listItem).each((_, element) => {
      try {
        const $item = $(element);

        // 제목
        const title = $item.find(selectors.title).text().trim();
        if (!title) return;

        // 링크
        let link = $item.find(selectors.link).attr('href') || '';
        if (link && !link.startsWith('http')) {
          const baseUrl = new URL(this.config.targetUrl);
          link = new URL(link, baseUrl.origin).href;
        }
        if (!link) return;

        // 날짜
        let publishedAt = new Date();
        if (selectors.date) {
          const dateStr = $item.find(selectors.date).text().trim();
          if (dateStr) {
            publishedAt = dateParser(dateStr);
          }
        }

        // 내용 (선택적)
        let content: string | undefined;
        if (selectors.content) {
          content = $item.find(selectors.content).text().trim();
        }

        newsList.push({
          title,
          content,
          sourceUrl: link,
          sourceName: `${this.siteConfig.companyName} 뉴스룸`,
          publishedAt,
        });
      } catch (error) {
        console.error('  파싱 오류:', error);
      }
    });

    return newsList;
  }
}

// 증권사별 크롤러 설정 (예시)
export const SITE_CRAWLER_CONFIGS: SiteCrawlerConfig[] = [
  // 삼성증권 (예시 - 실제 사이트 구조에 맞게 수정 필요)
  {
    companyCode: 'SAMSUNG',
    companyName: '삼성증권',
    newsroomUrl: 'https://www.samsungpop.com/mbw/news/newsRoom.do',
    selectors: {
      listItem: '.news-list li',
      title: '.tit',
      link: 'a',
      date: '.date',
    },
  },
];

// 단일 사이트 크롤링 실행
export async function crawlSite(config: SiteCrawlerConfig) {
  const crawler = new SiteCrawler(config);
  return crawler.run();
}

// 모든 사이트 크롤링
export async function crawlAllSites() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('         증권사 뉴스룸 크롤러 실행');
  console.log('═══════════════════════════════════════════════════════════\n');

  const results: { company: string; success: boolean; count: number; error?: string }[] = [];

  for (const config of SITE_CRAWLER_CONFIGS) {
    try {
      const crawler = new SiteCrawler(config);
      const result = await crawler.run();
      results.push({
        company: config.companyName,
        success: result.success,
        count: result.itemsFound,
        error: result.error,
      });
    } catch (error) {
      results.push({
        company: config.companyName,
        success: false,
        count: 0,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      });
    }

    // 요청 간격
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 결과 요약
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                    크롤링 결과 요약');
  console.log('═══════════════════════════════════════════════════════════');

  const totalSaved = results.reduce((sum, r) => sum + r.count, 0);
  const successCount = results.filter(r => r.success).length;

  console.log(`\n총 ${SITE_CRAWLER_CONFIGS.length}개 사이트 중 ${successCount}개 성공`);
  console.log(`총 ${totalSaved}개 뉴스 저장됨\n`);

  return results;
}
