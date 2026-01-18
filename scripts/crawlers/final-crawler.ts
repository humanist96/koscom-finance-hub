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

async function crawlNews(page: any, companyName: string): Promise<NewsItem[]> {
  const url = `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(companyName)}&sort=1`;

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
    await new Promise(r => setTimeout(r, 2000));

    // HTML에서 JSON 데이터 추출
    const html = await page.content();

    // title과 URL 패턴 찾기
    const newsItems: NewsItem[] = [];

    // 제목 추출 (title 패턴)
    const titleMatches = html.matchAll(/"title":"([^"]+)"/g);
    const titles: string[] = [];
    for (const match of titleMatches) {
      const title = cleanHtml(match[1]);
      if (title.length > 10 && !['국제신문', 'TV조선', '파이낸셜뉴스', '아시아투데이', '국민일보', '비즈트리뷴', '아주경제', '비즈한국', '매일경제', '한국경제', '머니투데이', '뉴스1', '연합뉴스', '조선일보', '중앙일보', '동아일보', '헤럴드경제', '서울경제'].includes(title)) {
        titles.push(title);
      }
    }

    // URL 추출
    const urlMatches = html.matchAll(/https:\/\/n\.news\.naver\.com\/mnews\/article\/(\d+)\/(\d+)/g);
    const urls: string[] = [];
    for (const match of urlMatches) {
      urls.push(match[0]);
    }

    // 출처 추출
    const sourceMatches = html.matchAll(/"subtext":"([^"]+)"/g);
    const sources: string[] = [];
    for (const match of sourceMatches) {
      sources.push(cleanHtml(match[1]));
    }

    // 조합
    const uniqueUrls = [...new Set(urls)];
    for (let i = 0; i < Math.min(titles.length, uniqueUrls.length); i++) {
      // 회사명이 포함된 뉴스만 필터링
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

    return newsItems.slice(0, 10); // 최대 10개
  } catch (error) {
    return [];
  }
}

function isValidNewsUrl(url: string): boolean {
  // 유효한 뉴스 URL 패턴만 허용 (네이버 뉴스)
  return url.includes('n.news.naver.com') || url.includes('news.naver.com');
}

async function saveNews(companyId: string, news: NewsItem): Promise<boolean> {
  try {
    // URL 유효성 검증
    if (!isValidNewsUrl(news.sourceUrl)) {
      console.log(`  ⚠️ 유효하지 않은 URL 스킵: ${news.sourceUrl}`);
      return false;
    }

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

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('          증권사 뉴스 크롤링');
  console.log('═══════════════════════════════════════════════════════════\n');

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

  console.log(`📊 ${companies.length}개 증권사 뉴스 수집\n`);

  let totalSaved = 0;

  for (const company of companies) {
    process.stdout.write(`🔍 ${company.name}...`);

    const newsList = await crawlNews(page, company.name);
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

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`✅ 완료: 총 ${totalSaved}개 뉴스 저장`);
  console.log('═══════════════════════════════════════════════════════════');
}

main().catch(console.error);
