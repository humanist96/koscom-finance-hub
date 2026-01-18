import puppeteer from 'puppeteer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CrawledNews {
  title: string;
  content: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: Date;
}

// 날짜 파싱
function parseDate(dateStr: string): Date {
  const now = new Date();
  const str = dateStr.trim();

  if (str.includes('분 전')) {
    const minutes = parseInt(str) || 1;
    return new Date(now.getTime() - minutes * 60 * 1000);
  }
  if (str.includes('시간 전')) {
    const hours = parseInt(str) || 1;
    return new Date(now.getTime() - hours * 60 * 60 * 1000);
  }
  if (str.includes('일 전')) {
    const days = parseInt(str) || 1;
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }

  const match = str.match(/(\d{4})\.(\d{1,2})\.(\d{1,2})/);
  if (match) {
    return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  }

  return now;
}

// 인사 뉴스 판별
function isPersonnelNews(title: string, content: string): boolean {
  const keywords = ['인사', '임명', '선임', '승진', '취임', '사임', '퇴임', '대표이사', '부사장', '전무', '상무', '본부장', '조직개편', '사장'];
  const text = `${title} ${content}`;
  return keywords.some(k => text.includes(k));
}

// 카테고리 분류
function classifyCategory(title: string, content: string): string {
  const text = `${title} ${content}`;

  if (isPersonnelNews(title, content)) return 'PERSONNEL';
  if (/실적|영업이익|순이익|매출|분기|결산|흑자|적자/.test(text)) return 'BUSINESS';
  if (/펀드|ETF|상품|서비스|출시|오픈|MTS|HTS|앱/.test(text)) return 'PRODUCT';
  if (/공시|IR|주주|배당|증자/.test(text)) return 'IR';
  if (/세미나|컨퍼런스|이벤트|행사/.test(text)) return 'EVENT';

  return 'GENERAL';
}

// 네이버 뉴스 크롤링
async function crawlNaverNews(page: any, companyName: string): Promise<CrawledNews[]> {
  const url = `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(companyName)}&sort=1&sm=tab_smr&nso=so:dd,p:all`;

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
    await page.waitForSelector('.news_area, .list_news', { timeout: 5000 }).catch(() => {});

    const newsList = await page.evaluate(() => {
      const items: { title: string; content: string; sourceUrl: string; sourceName: string; dateStr: string }[] = [];

      // 뉴스 아이템 선택자들 시도
      const newsItems = document.querySelectorAll('.news_area, .bx, .news_wrap');

      newsItems.forEach(item => {
        try {
          // 제목과 링크
          const titleEl = item.querySelector('a.news_tit, a.title, .news_tit');
          const title = titleEl?.textContent?.trim() || '';
          const sourceUrl = (titleEl as HTMLAnchorElement)?.href || '';

          if (!title || !sourceUrl) return;

          // 내용
          const contentEl = item.querySelector('.news_dsc, .dsc_txt, .api_txt_lines');
          const content = contentEl?.textContent?.trim() || '';

          // 출처
          const sourceEl = item.querySelector('.info.press, .info_group a:first-child, .press');
          const sourceName = sourceEl?.textContent?.trim() || '뉴스';

          // 날짜
          const dateEl = item.querySelector('.info:last-child, .info_group span.info');
          const dateStr = dateEl?.textContent?.trim() || '';

          items.push({ title, content, sourceUrl, sourceName, dateStr });
        } catch (e) {
          // 개별 아이템 오류 무시
        }
      });

      return items;
    });

    return newsList.map((item: any) => ({
      title: item.title,
      content: item.content,
      sourceUrl: item.sourceUrl,
      sourceName: item.sourceName,
      publishedAt: parseDate(item.dateStr),
    }));
  } catch (error) {
    console.error(`  ❌ ${companyName} 크롤링 오류`);
    return [];
  }
}

// 뉴스 저장
async function saveNews(companyId: string, news: CrawledNews): Promise<boolean> {
  try {
    const existing = await prisma.news.findFirst({
      where: { sourceUrl: news.sourceUrl },
    });

    if (existing) return false;

    const category = classifyCategory(news.title, news.content);

    await prisma.news.create({
      data: {
        companyId,
        title: news.title,
        content: news.content,
        summary: news.content.substring(0, 200),
        sourceUrl: news.sourceUrl,
        sourceName: news.sourceName,
        category,
        isPersonnel: isPersonnelNews(news.title, news.content),
        publishedAt: news.publishedAt,
      },
    });

    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║       증권사 뉴스 크롤링 (Puppeteer)                       ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  const companies = await prisma.securitiesCompany.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    take: 10, // 처음 10개 증권사만
  });

  console.log(`📊 ${companies.length}개 증권사 뉴스 수집\n`);

  let totalSaved = 0;

  for (const company of companies) {
    process.stdout.write(`🔍 ${company.name}...`);

    const newsList = await crawlNaverNews(page, company.name);
    let saved = 0;

    for (const news of newsList) {
      if (await saveNews(company.id, news)) saved++;
    }

    totalSaved += saved;
    console.log(` ${newsList.length}개 발견, ${saved}개 저장`);

    await new Promise(r => setTimeout(r, 1000));
  }

  await browser.close();
  await prisma.$disconnect();

  console.log(`\n✅ 크롤링 완료: 총 ${totalSaved}개 뉴스 저장`);
}

main().catch(console.error);
