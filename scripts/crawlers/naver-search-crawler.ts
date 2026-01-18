import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CrawledNews {
  title: string;
  content: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: Date;
}

// HTML 엔티티 디코딩
function decodeHtml(html: string): string {
  return html
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/<[^>]*>/g, '')
    .trim();
}

// 날짜 파싱
function parseDate(dateStr: string): Date {
  const now = new Date();

  // "n분 전", "n시간 전" 형식
  if (dateStr.includes('분 전')) {
    const minutes = parseInt(dateStr);
    return new Date(now.getTime() - minutes * 60 * 1000);
  }
  if (dateStr.includes('시간 전')) {
    const hours = parseInt(dateStr);
    return new Date(now.getTime() - hours * 60 * 60 * 1000);
  }
  if (dateStr.includes('일 전')) {
    const days = parseInt(dateStr);
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }

  // "YYYY.MM.DD." 형식
  const match = dateStr.match(/(\d{4})\.(\d{2})\.(\d{2})/);
  if (match) {
    return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  }

  return now;
}

// 인사 뉴스 판별
function isPersonnelNews(title: string, content: string): boolean {
  const keywords = ['인사', '임명', '선임', '승진', '취임', '사임', '퇴임', '대표이사', '부사장', '전무', '상무', '본부장', '조직개편'];
  const text = `${title} ${content}`.toLowerCase();
  return keywords.some(k => text.includes(k));
}

// 카테고리 분류
function classifyCategory(title: string, content: string): string {
  const text = `${title} ${content}`.toLowerCase();

  if (isPersonnelNews(title, content)) return 'PERSONNEL';
  if (/실적|영업이익|순이익|매출|분기|결산/.test(text)) return 'BUSINESS';
  if (/펀드|etf|상품|서비스|출시|오픈|mts|hts/.test(text)) return 'PRODUCT';
  if (/공시|ir|주주|배당|유상증자/.test(text)) return 'IR';
  if (/세미나|컨퍼런스|이벤트|행사/.test(text)) return 'EVENT';

  return 'GENERAL';
}

// 네이버 뉴스 검색 크롤링
async function crawlNaverSearch(companyName: string): Promise<CrawledNews[]> {
  const url = `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(companyName)}&sort=1`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const newsList: CrawledNews[] = [];

    // 뉴스 아이템 선택
    $('div.news_area, li.bx').each((_, element) => {
      try {
        const $item = $(element);

        // 제목과 링크
        const $titleLink = $item.find('a.news_tit, a.title');
        const title = decodeHtml($titleLink.text() || $titleLink.attr('title') || '');
        const sourceUrl = $titleLink.attr('href') || '';

        if (!title || !sourceUrl) return;

        // 내용
        const content = decodeHtml($item.find('div.news_dsc, div.dsc_wrap, a.dsc_txt').text());

        // 출처
        const sourceName = $item.find('a.info.press, span.info.press').text().trim() || '네이버뉴스';

        // 날짜
        const dateText = $item.find('span.info').last().text().trim();
        const publishedAt = parseDate(dateText);

        newsList.push({
          title,
          content,
          sourceUrl,
          sourceName,
          publishedAt,
        });
      } catch (e) {
        // 개별 아이템 파싱 오류 무시
      }
    });

    return newsList;
  } catch (error) {
    console.error(`  ❌ ${companyName} 크롤링 실패:`, error instanceof Error ? error.message : error);
    return [];
  }
}

// 뉴스 저장
async function saveNews(companyId: string, companyName: string, news: CrawledNews): Promise<boolean> {
  try {
    // 중복 확인
    const existing = await prisma.news.findFirst({
      where: { sourceUrl: news.sourceUrl },
    });

    if (existing) {
      return false;
    }

    const category = classifyCategory(news.title, news.content);
    const isPersonnel = isPersonnelNews(news.title, news.content);

    await prisma.news.create({
      data: {
        companyId,
        title: news.title,
        content: news.content,
        summary: news.content.substring(0, 200),
        sourceUrl: news.sourceUrl,
        sourceName: news.sourceName,
        category,
        isPersonnel,
        publishedAt: news.publishedAt,
      },
    });

    return true;
  } catch (error) {
    return false;
  }
}

// 메인 크롤링 함수
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║          증권사 뉴스 크롤링 시작                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const startTime = Date.now();

  // 증권사 목록 조회
  const companies = await prisma.securitiesCompany.findMany({
    where: { isActive: true },
    select: { id: true, name: true, code: true },
  });

  console.log(`📊 ${companies.length}개 증권사 뉴스 수집 시작\n`);

  let totalSaved = 0;
  const results: { name: string; found: number; saved: number }[] = [];

  for (const company of companies) {
    process.stdout.write(`🔍 ${company.name} 검색 중...`);

    const newsList = await crawlNaverSearch(company.name);
    let savedCount = 0;

    for (const news of newsList) {
      const saved = await saveNews(company.id, company.name, news);
      if (saved) savedCount++;
    }

    results.push({ name: company.name, found: newsList.length, saved: savedCount });
    totalSaved += savedCount;

    console.log(` ${newsList.length}개 발견, ${savedCount}개 저장`);

    // 요청 간격 (서버 부하 방지)
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                    크롤링 결과 요약                        ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║  총 수집: ${String(totalSaved).padStart(4)}개 뉴스                                 ║`);
  console.log(`║  소요 시간: ${elapsed.padStart(5)}초                                    ║`);
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // 상세 결과
  console.log('📋 증권사별 결과:');
  results
    .filter(r => r.saved > 0)
    .sort((a, b) => b.saved - a.saved)
    .forEach(r => {
      console.log(`   ${r.name}: ${r.saved}개 저장`);
    });

  await prisma.$disconnect();
}

main().catch(error => {
  console.error('크롤링 실패:', error);
  process.exit(1);
});
