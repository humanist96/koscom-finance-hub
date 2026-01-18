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

function parseDate(dateStr: string): Date {
  const now = new Date();
  const str = dateStr.trim();

  if (str.includes('분 전')) return new Date(now.getTime() - (parseInt(str) || 1) * 60 * 1000);
  if (str.includes('시간 전')) return new Date(now.getTime() - (parseInt(str) || 1) * 60 * 60 * 1000);
  if (str.includes('일 전')) return new Date(now.getTime() - (parseInt(str) || 1) * 24 * 60 * 60 * 1000);

  const match = str.match(/(\d{4})\.(\d{1,2})\.(\d{1,2})/);
  if (match) return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));

  return now;
}

function isPersonnelNews(text: string): boolean {
  return /인사|임명|선임|승진|취임|사임|퇴임|대표이사|부사장|전무|상무|본부장|조직개편|사장/.test(text);
}

function classifyCategory(text: string): string {
  if (isPersonnelNews(text)) return 'PERSONNEL';
  if (/실적|영업이익|순이익|매출|분기|결산|흑자|적자/.test(text)) return 'BUSINESS';
  if (/펀드|ETF|상품|서비스|출시|오픈|MTS|HTS|앱/.test(text)) return 'PRODUCT';
  if (/공시|IR|주주|배당|증자/.test(text)) return 'IR';
  if (/세미나|컨퍼런스|이벤트|행사/.test(text)) return 'EVENT';
  return 'GENERAL';
}

async function crawlNews(page: any, companyName: string): Promise<NewsItem[]> {
  const url = `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(companyName)}&sort=1`;

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
    await new Promise(r => setTimeout(r, 2000)); // 렌더링 대기

    const newsData = await page.evaluate(() => {
      const results: { title: string; content: string; url: string; source: string; date: string }[] = [];

      // list_news 내의 뉴스 아이템 찾기
      const newsContainer = document.querySelector('.list_news, .group_news, ._infinite_list');
      if (!newsContainer) return results;

      // 모든 뉴스 아이템 찾기
      const items = newsContainer.querySelectorAll('[class*="item"], [class*="bx"]');

      items.forEach(item => {
        try {
          // 제목 링크 찾기 - 다양한 패턴 시도
          let titleEl = item.querySelector('a[class*="tit"], a.news_tit, [class*="title"] a, a[href*="news.naver"]');

          if (!titleEl) {
            const allLinks = item.querySelectorAll('a');
            for (const link of allLinks) {
              const href = (link as HTMLAnchorElement).href;
              if (href && href.includes('news.naver.com') && link.textContent && link.textContent.length > 10) {
                titleEl = link;
                break;
              }
            }
          }

          if (!titleEl) return;

          const title = titleEl.textContent?.trim() || '';
          const url = (titleEl as HTMLAnchorElement).href || '';

          if (!title || title.length < 5 || !url || !url.includes('naver')) return;
          if (title === '네이버뉴스') return; // 버튼 텍스트 제외

          // 내용 찾기
          let content = '';
          const descEl = item.querySelector('[class*="dsc"], [class*="desc"], [class*="txt"]');
          if (descEl) content = descEl.textContent?.trim() || '';

          // 출처 찾기
          let source = '뉴스';
          const sourceEl = item.querySelector('[class*="press"], [class*="info"] a, [class*="source"]');
          if (sourceEl) source = sourceEl.textContent?.trim() || '뉴스';

          // 날짜 찾기
          let date = '';
          const dateEl = item.querySelector('[class*="time"], [class*="date"], span[class*="info"]:last-child');
          if (dateEl) date = dateEl.textContent?.trim() || '';

          results.push({ title, content, url, source, date });
        } catch (e) {
          // skip
        }
      });

      return results;
    });

    return newsData.map((item: any) => ({
      title: item.title,
      content: item.content || item.title,
      sourceUrl: item.url,
      sourceName: item.source,
      publishedAt: parseDate(item.date),
    }));
  } catch (error) {
    return [];
  }
}

async function saveNews(companyId: string, news: NewsItem): Promise<boolean> {
  try {
    const exists = await prisma.news.findFirst({ where: { sourceUrl: news.sourceUrl } });
    if (exists) return false;

    const text = `${news.title} ${news.content}`;
    await prisma.news.create({
      data: {
        companyId,
        title: news.title,
        content: news.content,
        summary: news.content.substring(0, 200),
        sourceUrl: news.sourceUrl,
        sourceName: news.sourceName,
        category: classifyCategory(text),
        isPersonnel: isPersonnelNews(text),
        publishedAt: news.publishedAt,
      },
    });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('          증권사 뉴스 크롤링 시작');
  console.log('═══════════════════════════════════════════════════════════\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1280, height: 800 });

  const companies = await prisma.securitiesCompany.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  console.log(`📊 ${companies.length}개 증권사 뉴스 수집\n`);

  let totalSaved = 0;
  const results: { name: string; saved: number }[] = [];

  for (const company of companies) {
    process.stdout.write(`🔍 ${company.name}...`);

    const newsList = await crawlNews(page, company.name);
    let saved = 0;

    for (const news of newsList) {
      if (await saveNews(company.id, news)) saved++;
    }

    results.push({ name: company.name, saved });
    totalSaved += saved;
    console.log(` ${newsList.length}개 발견, ${saved}개 저장`);

    await new Promise(r => setTimeout(r, 1500));
  }

  await browser.close();
  await prisma.$disconnect();

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`✅ 크롤링 완료: 총 ${totalSaved}개 뉴스 저장`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (totalSaved > 0) {
    console.log('📋 저장된 뉴스:');
    results.filter(r => r.saved > 0).forEach(r => console.log(`   ${r.name}: ${r.saved}개`));
  }
}

main().catch(console.error);
