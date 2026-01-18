import cron from 'node-cron';
import puppeteer from 'puppeteer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface NewsItem {
  title: string;
  content: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: Date;
}

function cleanHtml(text: string): string {
  return text
    .replace(/<\/?mark>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function isPersonnelNews(text: string): boolean {
  return /인사|임명|선임|승진|취임|사임|퇴임|대표이사|부사장|전무|상무|본부장|조직개편|사장|신임/.test(text);
}

function classifyCategory(text: string): string {
  if (isPersonnelNews(text)) return 'PERSONNEL';
  if (/실적|영업이익|순이익|매출|분기|결산|흑자|적자/.test(text)) return 'BUSINESS';
  if (/펀드|ETF|상품|서비스|출시|오픈|MTS|HTS|앱|플랫폼/.test(text)) return 'PRODUCT';
  if (/공시|IR|주주|배당|증자|IPO|상장/.test(text)) return 'IR';
  if (/세미나|컨퍼런스|이벤트|행사/.test(text)) return 'EVENT';
  return 'GENERAL';
}

function isValidNewsUrl(url: string): boolean {
  return url.includes('n.news.naver.com') || url.includes('news.naver.com');
}

async function crawlCompanyNews(page: any, companyName: string): Promise<NewsItem[]> {
  const url = `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(companyName)}&sort=1`;

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
    await new Promise(r => setTimeout(r, 2000));

    const html = await page.content();
    const newsItems: NewsItem[] = [];

    const titleMatches = html.matchAll(/"title":"([^"]+)"/g);
    const titles: string[] = [];
    const excludeNames = ['국제신문', 'TV조선', '파이낸셜뉴스', '아시아투데이', '국민일보', '비즈트리뷴', '아주경제', '비즈한국', '매일경제', '한국경제', '머니투데이', '뉴스1', '연합뉴스', '조선일보', '중앙일보', '동아일보', '헤럴드경제', '서울경제'];

    for (const match of titleMatches) {
      const title = cleanHtml(match[1]);
      if (title.length > 10 && !excludeNames.includes(title)) {
        titles.push(title);
      }
    }

    const urlMatches = html.matchAll(/https:\/\/n\.news\.naver\.com\/mnews\/article\/(\d+)\/(\d+)/g);
    const urls: string[] = [];
    for (const match of urlMatches) {
      urls.push(match[0]);
    }

    const sourceMatches = html.matchAll(/"subtext":"([^"]+)"/g);
    const sources: string[] = [];
    for (const match of sourceMatches) {
      sources.push(cleanHtml(match[1]));
    }

    const uniqueUrls = [...new Set(urls)];
    for (let i = 0; i < Math.min(titles.length, uniqueUrls.length); i++) {
      if (titles[i].includes(companyName) || titles[i].includes(companyName.replace('증권', ''))) {
        newsItems.push({
          title: titles[i],
          content: titles[i],
          sourceUrl: uniqueUrls[i],
          sourceName: sources[i] || '네이버뉴스',
          publishedAt: new Date(),
        });
      }
    }

    return newsItems.slice(0, 10);
  } catch {
    return [];
  }
}

async function saveNewsItem(companyId: string, news: NewsItem): Promise<boolean> {
  try {
    if (!isValidNewsUrl(news.sourceUrl)) return false;

    const exists = await prisma.news.findFirst({ where: { sourceUrl: news.sourceUrl } });
    if (exists) return false;

    await prisma.news.create({
      data: {
        companyId,
        title: news.title,
        content: news.content,
        summary: news.content.substring(0, 200),
        sourceUrl: news.sourceUrl,
        sourceName: news.sourceName,
        category: classifyCategory(news.title),
        isPersonnel: isPersonnelNews(news.title),
        publishedAt: news.publishedAt,
      },
    });
    return true;
  } catch {
    return false;
  }
}

async function runCrawler(): Promise<void> {
  const startedAt = new Date();
  console.log(`\n[${startedAt.toLocaleString('ko-KR')}] 🔄 스케줄 크롤링 시작`);

  const crawlLog = await prisma.crawlLog.create({
    data: {
      targetUrl: 'https://search.naver.com/search.naver',
      status: 'RUNNING',
      startedAt,
    },
  });

  let totalFound = 0;
  let totalSaved = 0;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

    const companies = await prisma.securitiesCompany.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    console.log(`📊 ${companies.length}개 증권사 뉴스 수집 중...`);

    for (const company of companies) {
      const newsList = await crawlCompanyNews(page, company.name);
      totalFound += newsList.length;

      for (const news of newsList) {
        if (await saveNewsItem(company.id, news)) {
          totalSaved++;
        }
      }

      await new Promise(r => setTimeout(r, 1000));
    }

    await browser.close();

    const completedAt = new Date();
    await prisma.crawlLog.update({
      where: { id: crawlLog.id },
      data: {
        status: 'SUCCESS',
        itemsFound: totalFound,
        completedAt,
      },
    });

    console.log(`✅ 크롤링 완료: ${totalFound}개 발견, ${totalSaved}개 저장`);
    console.log(`⏱️ 소요시간: ${Math.round((completedAt.getTime() - startedAt.getTime()) / 1000)}초\n`);
  } catch (error) {
    const completedAt = new Date();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await prisma.crawlLog.update({
      where: { id: crawlLog.id },
      data: {
        status: 'FAILED',
        errorMessage,
        completedAt,
      },
    });

    console.error(`❌ 크롤링 실패: ${errorMessage}\n`);
  }
}

// 스케줄 설정
// 매일 오전 7시, 오후 1시, 오후 7시에 실행 (하루 3회)
const CRON_SCHEDULE = '0 7,13,19 * * *';

console.log('═══════════════════════════════════════════════════════════');
console.log('       증권사 뉴스 자동 수집 스케줄러');
console.log('═══════════════════════════════════════════════════════════');
console.log(`📅 스케줄: 매일 07:00, 13:00, 19:00 (하루 3회)`);
console.log(`🕐 현재 시간: ${new Date().toLocaleString('ko-KR')}`);
console.log('═══════════════════════════════════════════════════════════\n');

// 시작 시 즉시 1회 실행
console.log('🚀 스케줄러 시작 - 초기 크롤링 실행');
runCrawler();

// 스케줄 등록
cron.schedule(CRON_SCHEDULE, () => {
  runCrawler();
});

console.log('✅ 스케줄러가 백그라운드에서 실행 중입니다.');
console.log('   종료하려면 Ctrl+C를 누르세요.\n');

// 프로세스 종료 시 정리
process.on('SIGINT', async () => {
  console.log('\n🛑 스케줄러 종료 중...');
  await prisma.$disconnect();
  process.exit(0);
});
