import axios from 'axios';
import { BaseCrawler, CrawledNews, prisma } from './base-crawler';

interface NaverNewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

interface NaverNewsResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverNewsItem[];
}

// HTML 태그 제거
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

export class NaverNewsCrawler extends BaseCrawler {
  private clientId: string;
  private clientSecret: string;
  private searchQuery: string;
  private displayCount: number;

  constructor(
    companyName: string,
    companyCode: string,
    clientId: string,
    clientSecret: string,
    displayCount: number = 20
  ) {
    super({
      name: `네이버뉴스-${companyName}`,
      targetUrl: 'https://openapi.naver.com/v1/search/news.json',
      companyCode,
    });

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.searchQuery = companyName;
    this.displayCount = displayCount;
  }

  async crawl(): Promise<CrawledNews[]> {
    try {
      const response = await axios.get<NaverNewsResponse>(this.config.targetUrl, {
        params: {
          query: this.searchQuery,
          display: this.displayCount,
          sort: 'date', // 최신순
        },
        headers: {
          'X-Naver-Client-Id': this.clientId,
          'X-Naver-Client-Secret': this.clientSecret,
        },
      });

      const { items } = response.data;

      return items.map(item => ({
        title: stripHtml(item.title),
        content: stripHtml(item.description),
        sourceUrl: item.originallink || item.link,
        sourceName: '네이버뉴스',
        publishedAt: new Date(item.pubDate),
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`네이버 API 오류: ${error.response?.data?.errorMessage || error.message}`);
      }
      throw error;
    }
  }
}

// 모든 증권사 네이버 뉴스 크롤링
export async function crawlAllNaverNews(clientId: string, clientSecret: string) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('         네이버 뉴스 크롤러 실행');
  console.log('═══════════════════════════════════════════════════════════\n');

  const companies = await prisma.securitiesCompany.findMany({
    where: { isActive: true },
    select: { name: true, code: true },
  });

  const results: { company: string; success: boolean; count: number }[] = [];

  for (const company of companies) {
    if (!company.code) continue;

    const crawler = new NaverNewsCrawler(
      company.name,
      company.code,
      clientId,
      clientSecret,
      10 // 회사당 10개씩
    );

    const result = await crawler.run();
    results.push({
      company: company.name,
      success: result.success,
      count: result.itemsFound,
    });

    // API 호출 간격 (초당 10회 제한 대응)
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // 결과 요약
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                    크롤링 결과 요약');
  console.log('═══════════════════════════════════════════════════════════');

  const totalSaved = results.reduce((sum, r) => sum + r.count, 0);
  const successCount = results.filter(r => r.success).length;

  console.log(`\n총 ${companies.length}개 증권사 중 ${successCount}개 성공`);
  console.log(`총 ${totalSaved}개 뉴스 저장됨\n`);

  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    console.log(`${status} ${r.company}: ${r.count}개`);
  });

  return results;
}

// CLI 실행
if (require.main === module) {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('❌ 환경 변수를 설정해주세요: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET');
    process.exit(1);
  }

  crawlAllNaverNews(clientId, clientSecret)
    .then(() => process.exit(0))
    .catch(error => {
      console.error('크롤링 실패:', error);
      process.exit(1);
    });
}
