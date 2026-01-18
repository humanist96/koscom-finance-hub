import puppeteer from 'puppeteer';
import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';

const prisma = new PrismaClient();

// Anthropic 클라이언트 (API 키가 있을 때만 사용)
let anthropic: Anthropic | null = null;
if (process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

interface NewsItem {
  title: string;
  content: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  category: string;
  isPersonnel: boolean;
  publishedAt: Date;
}

// AI 요약 함수
async function summarizeWithAI(title: string, content: string): Promise<string> {
  if (!anthropic || !content || content.length < 50) {
    return content.substring(0, 200) + (content.length > 200 ? '...' : '');
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `다음 증권사 관련 뉴스를 2-3문장으로 핵심만 요약해주세요. 요약만 작성하세요.

제목: ${title}

본문:
${content.substring(0, 2000)}`,
        },
      ],
    });

    const textBlock = response.content.find(block => block.type === 'text');
    if (textBlock && textBlock.type === 'text') {
      return textBlock.text.trim();
    }
  } catch (error) {
    console.error('    AI 요약 오류:', error);
  }
  return content.substring(0, 200) + (content.length > 200 ? '...' : '');
}

// AI 분류 함수
async function classifyWithAI(title: string, content: string): Promise<{ category: string; isPersonnel: boolean }> {
  // 기본 키워드 기반 분류
  const text = `${title} ${content}`;

  const isPersonnel = /인사|임명|선임|승진|취임|사임|퇴임|대표이사|부사장|전무|상무|본부장|조직개편|사장|신임/.test(text);

  let category = 'GENERAL';
  if (isPersonnel) category = 'PERSONNEL';
  else if (/실적|영업이익|순이익|매출|분기|결산|흑자|적자/.test(text)) category = 'BUSINESS';
  else if (/펀드|ETF|상품|서비스|출시|오픈|MTS|HTS|앱|플랫폼/.test(text)) category = 'PRODUCT';
  else if (/공시|IR|주주|배당|증자|IPO|상장/.test(text)) category = 'IR';
  else if (/세미나|컨퍼런스|이벤트|행사/.test(text)) category = 'EVENT';

  return { category, isPersonnel };
}

// 네이버 뉴스 본문 추출
async function fetchArticleContent(page: any, url: string): Promise<{ title: string; content: string; sourceName: string; publishedAt: Date }> {
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));

    const data = await page.evaluate(() => {
      // 제목 추출
      let title = '';
      const titleEl = document.querySelector('#title_area, .media_end_head_headline, h2.media_end_head_headline');
      if (titleEl) title = titleEl.textContent?.trim() || '';

      // 본문 추출
      let content = '';
      const contentEl = document.querySelector('#newsct_article, #dic_area, .newsct_article, article#dic_area');
      if (contentEl) {
        // 이미지 캡션, 광고 등 제거
        const clone = contentEl.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('script, style, .img_desc, .ad_area, [class*="ad"]').forEach(el => el.remove());
        content = clone.textContent?.trim().replace(/\s+/g, ' ') || '';
      }

      // 출처 추출
      let sourceName = '네이버뉴스';
      const sourceEl = document.querySelector('.media_end_head_top_logo img, .press_logo img');
      if (sourceEl) sourceName = (sourceEl as HTMLImageElement).alt || '네이버뉴스';

      // 날짜 추출
      let dateStr = '';
      const dateEl = document.querySelector('.media_end_head_info_datestamp_time, span._ARTICLE_DATE_TIME');
      if (dateEl) {
        dateStr = dateEl.getAttribute('data-date-time') || dateEl.textContent?.trim() || '';
      }

      return { title, content, sourceName, dateStr };
    });

    // 날짜 파싱
    let publishedAt = new Date();
    if (data.dateStr) {
      const parsed = new Date(data.dateStr);
      if (!isNaN(parsed.getTime())) publishedAt = parsed;
    }

    return {
      title: data.title || '',
      content: data.content || '',
      sourceName: data.sourceName || '네이버뉴스',
      publishedAt,
    };
  } catch (error) {
    console.error(`    본문 추출 실패: ${url}`);
    return { title: '', content: '', sourceName: '네이버뉴스', publishedAt: new Date() };
  }
}

// 네이버 검색에서 뉴스 URL 목록 추출
async function getNewsUrls(page: any, companyName: string): Promise<string[]> {
  const searchUrl = `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(companyName)}&sort=1`;

  try {
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 20000 });
    await new Promise(r => setTimeout(r, 2000));

    const urls = await page.evaluate(() => {
      const links: string[] = [];
      // 네이버 뉴스 링크만 추출
      document.querySelectorAll('a[href*="n.news.naver.com"]').forEach(el => {
        const href = (el as HTMLAnchorElement).href;
        if (href && href.includes('/article/') && !links.includes(href)) {
          links.push(href);
        }
      });
      return links.slice(0, 10); // 최대 10개
    });

    return urls;
  } catch (error) {
    console.error(`  검색 오류: ${companyName}`);
    return [];
  }
}

// URL 유효성 검증
function isValidNewsUrl(url: string): boolean {
  return url.includes('n.news.naver.com') || url.includes('news.naver.com');
}

// 뉴스 저장
async function saveNews(companyId: string, news: NewsItem): Promise<boolean> {
  try {
    if (!isValidNewsUrl(news.sourceUrl)) return false;
    if (!news.title || news.title.length < 5) return false;

    const exists = await prisma.news.findFirst({ where: { sourceUrl: news.sourceUrl } });
    if (exists) return false;

    await prisma.news.create({
      data: {
        companyId,
        title: news.title,
        content: news.content,
        summary: news.summary,
        sourceUrl: news.sourceUrl,
        sourceName: news.sourceName,
        category: news.category,
        isPersonnel: news.isPersonnel,
        publishedAt: news.publishedAt,
      },
    });
    return true;
  } catch (error) {
    console.error('    저장 오류:', error);
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('      증권사 뉴스 크롤링 (AI 요약 포함)');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (anthropic) {
    console.log('✅ Claude AI 요약 활성화\n');
  } else {
    console.log('⚠️ ANTHROPIC_API_KEY 없음 - AI 요약 비활성화\n');
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  const companies = await prisma.securitiesCompany.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  console.log(`📊 ${companies.length}개 증권사 뉴스 수집\n`);

  let totalSaved = 0;
  const startTime = Date.now();

  // 크롤링 로그 시작
  const crawlLog = await prisma.crawlLog.create({
    data: {
      targetUrl: 'https://search.naver.com/search.naver',
      status: 'RUNNING',
      startedAt: new Date(),
    },
  });

  for (const company of companies) {
    console.log(`🔍 ${company.name}`);

    // 1. 뉴스 URL 목록 가져오기
    const newsUrls = await getNewsUrls(page, company.name);
    console.log(`   ${newsUrls.length}개 뉴스 발견`);

    let savedCount = 0;

    // 2. 각 뉴스 본문 추출 및 저장
    for (const url of newsUrls) {
      // 이미 저장된 URL인지 확인
      const exists = await prisma.news.findFirst({ where: { sourceUrl: url } });
      if (exists) continue;

      // 본문 추출
      const article = await fetchArticleContent(page, url);
      if (!article.title || !article.content) continue;

      // 회사명이 포함된 뉴스만 필터링
      const companyShortName = company.name.replace('증권', '').replace('투자', '');
      if (!article.title.includes(company.name) &&
          !article.title.includes(companyShortName) &&
          !article.content.includes(company.name)) {
        continue;
      }

      // AI 요약 생성
      const summary = await summarizeWithAI(article.title, article.content);

      // 카테고리 분류
      const { category, isPersonnel } = await classifyWithAI(article.title, article.content);

      // 저장
      const newsItem: NewsItem = {
        title: article.title,
        content: article.content.substring(0, 5000), // 최대 5000자
        summary,
        sourceUrl: url,
        sourceName: article.sourceName,
        category,
        isPersonnel,
        publishedAt: article.publishedAt,
      };

      if (await saveNews(company.id, newsItem)) {
        savedCount++;
        console.log(`   ✅ "${article.title.substring(0, 40)}..."`);
      }

      // 요청 간격
      await new Promise(r => setTimeout(r, 500));
    }

    totalSaved += savedCount;
    console.log(`   → ${savedCount}개 저장\n`);

    // 회사 간 간격
    await new Promise(r => setTimeout(r, 1000));
  }

  await browser.close();

  // 크롤링 로그 완료
  await prisma.crawlLog.update({
    where: { id: crawlLog.id },
    data: {
      status: 'SUCCESS',
      itemsFound: totalSaved,
      completedAt: new Date(),
    },
  });

  await prisma.$disconnect();

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✅ 완료: 총 ${totalSaved}개 뉴스 저장 (${elapsed}초 소요)`);
  console.log('═══════════════════════════════════════════════════════════');
}

main().catch(console.error);
