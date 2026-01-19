import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface NewsItem {
  title: string;
  content: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: Date;
}

function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
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

async function fetchWithRetry(url: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        },
      });
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      if (i === retries - 1) throw error;
    }
    await new Promise(r => setTimeout(r, 1000 * (i + 1)));
  }
  throw new Error('Failed to fetch after retries');
}

// URL이 이미 DB에 있는지 확인 (중복 방지)
async function isUrlAlreadyExists(sourceUrl: string): Promise<boolean> {
  const exists = await prisma.news.findFirst({
    where: { sourceUrl },
    select: { id: true },
  });
  return !!exists;
}

// 네이버 뉴스 본문 추출
async function fetchArticleContent(url: string): Promise<string> {
  try {
    const html = await fetchWithRetry(url);
    const $ = cheerio.load(html);

    let content = '';
    content = $('#dic_area').text() ||
              $('#articleBodyContents').text() ||
              $('.news_end').text() ||
              $('article').text() ||
              $('.article_body').text();

    content = cleanText(content);

    if (content.length < 50) {
      content = $('meta[property="og:description"]').attr('content') || '';
      content = cleanText(content);
    }

    return content.substring(0, 2000);
  } catch (error) {
    console.error(`Error fetching article: ${url}`, error);
    return '';
  }
}

// OpenAI로 요약
async function summarizeWithOpenAI(title: string, content: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY || !content || content.length < 50) {
    return content.substring(0, 200) || title;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 금융 뉴스 요약 전문가입니다. 주어진 증권사 관련 뉴스를 2-3문장으로 핵심만 요약해주세요. 한국어로 작성하세요.'
        },
        {
          role: 'user',
          content: `제목: ${title}\n\n본문:\n${content}`
        }
      ],
      max_tokens: 300,
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || content.substring(0, 200);
  } catch (error) {
    console.error('OpenAI summarization error:', error);
    return content.substring(0, 200) || title;
  }
}

async function crawlCompanyNews(companyName: string): Promise<NewsItem[]> {
  const searchUrl = `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(companyName)}&sort=1&sm=tab_smr&nso=so:dd,p:all`;

  try {
    const html = await fetchWithRetry(searchUrl);
    const $ = cheerio.load(html);
    const newsItems: NewsItem[] = [];

    // 네이버 뉴스 검색 결과 파싱
    const elements = $('.news_area').toArray().slice(0, 3);

    for (const element of elements) {
      const $el = $(element);
      const titleEl = $el.find('.news_tit');
      const title = cleanText(titleEl.text());
      const sourceUrl = titleEl.attr('href') || '';
      const sourceName = cleanText($el.find('.info.press').text()) || '네이버뉴스';

      const companyShortName = companyName.replace('증권', '');
      if ((title.includes(companyName) || title.includes(companyShortName)) &&
          sourceUrl && title.length > 5) {

        // ✅ 중복 체크 먼저! - URL이 이미 있으면 스킵
        if (await isUrlAlreadyExists(sourceUrl)) {
          console.log(`  ⏭️ Already exists: ${title.substring(0, 40)}...`);
          continue;
        }

        // 새로운 뉴스만 본문 가져오기
        console.log(`  📰 New article: ${title.substring(0, 40)}...`);
        const content = await fetchArticleContent(sourceUrl);

        // 새로운 뉴스만 OpenAI로 요약
        console.log(`  🤖 Summarizing with OpenAI...`);
        const summary = await summarizeWithOpenAI(title, content);

        newsItems.push({
          title,
          content: content || title,
          summary,
          sourceUrl,
          sourceName,
          publishedAt: new Date(),
        });

        await new Promise(r => setTimeout(r, 500));
      }
    }

    // 대체 파싱 - JSON 데이터에서 추출
    if (newsItems.length === 0) {
      const jsonMatches = html.matchAll(/"title":"([^"]+)"/g);
      const urlMatches = [...html.matchAll(/https:\/\/n\.news\.naver\.com\/mnews\/article\/\d+\/\d+/g)];
      const titles: string[] = [];

      for (const match of jsonMatches) {
        const title = cleanText(match[1]);
        if (title.length > 10 && !title.includes('검색') && !title.includes('네이버')) {
          const companyShortName = companyName.replace('증권', '');
          if (title.includes(companyName) || title.includes(companyShortName)) {
            titles.push(title);
          }
        }
      }

      const uniqueUrls = [...new Set(urlMatches.map(m => m[0]))];
      for (let i = 0; i < Math.min(titles.length, uniqueUrls.length, 2); i++) {
        // ✅ 중복 체크 먼저!
        if (await isUrlAlreadyExists(uniqueUrls[i])) {
          console.log(`  ⏭️ Already exists: ${titles[i].substring(0, 40)}...`);
          continue;
        }

        console.log(`  📰 New article: ${titles[i].substring(0, 40)}...`);
        const content = await fetchArticleContent(uniqueUrls[i]);
        const summary = await summarizeWithOpenAI(titles[i], content);

        newsItems.push({
          title: titles[i],
          content: content || titles[i],
          summary,
          sourceUrl: uniqueUrls[i],
          sourceName: '네이버뉴스',
          publishedAt: new Date(),
        });

        await new Promise(r => setTimeout(r, 500));
      }
    }

    return newsItems.slice(0, 3);
  } catch (error) {
    console.error(`Error crawling ${companyName}:`, error);
    return [];
  }
}

async function saveNewsItem(companyId: string, news: NewsItem): Promise<boolean> {
  try {
    // 이중 체크 (동시 요청 방지)
    const exists = await prisma.news.findFirst({
      where: { sourceUrl: news.sourceUrl }
    });
    if (exists) return false;

    await prisma.news.create({
      data: {
        companyId,
        title: news.title,
        content: news.content,
        summary: news.summary,
        sourceUrl: news.sourceUrl,
        sourceName: news.sourceName,
        category: classifyCategory(news.title),
        isPersonnel: isPersonnelNews(news.title),
        publishedAt: news.publishedAt,
      },
    });
    return true;
  } catch (error) {
    console.error('Error saving news:', error);
    return false;
  }
}

export interface CrawlResult {
  success: boolean;
  totalFound: number;
  totalSaved: number;
  skippedDuplicates: number;
  startedAt: Date;
  completedAt: Date;
  error?: string;
}

export async function runServerlessCrawler(): Promise<CrawlResult> {
  const startedAt = new Date();
  let totalFound = 0;
  let totalSaved = 0;
  let skippedDuplicates = 0;

  const crawlLog = await prisma.crawlLog.create({
    data: {
      targetUrl: 'https://search.naver.com/search.naver',
      status: 'RUNNING',
      startedAt,
    },
  });

  try {
    const companies = await prisma.securitiesCompany.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    console.log(`Starting crawl for ${companies.length} companies...`);
    console.log(`OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'configured' : 'NOT configured'}`);

    for (const company of companies) {
      console.log(`\n🔍 Crawling: ${company.name}`);
      const newsList = await crawlCompanyNews(company.name);
      totalFound += newsList.length;

      for (const news of newsList) {
        if (await saveNewsItem(company.id, news)) {
          totalSaved++;
          console.log(`  ✅ Saved: ${news.title.substring(0, 40)}...`);
        } else {
          skippedDuplicates++;
        }
      }

      await new Promise(r => setTimeout(r, 300));
    }

    const completedAt = new Date();

    await prisma.crawlLog.update({
      where: { id: crawlLog.id },
      data: {
        status: 'SUCCESS',
        itemsFound: totalFound,
        completedAt,
      },
    });

    console.log(`\n✅ Crawl completed: Found ${totalFound}, Saved ${totalSaved}, Skipped ${skippedDuplicates}`);

    return {
      success: true,
      totalFound,
      totalSaved,
      skippedDuplicates,
      startedAt,
      completedAt,
    };
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

    console.error('Crawl failed:', errorMessage);

    return {
      success: false,
      totalFound,
      totalSaved,
      skippedDuplicates,
      startedAt,
      completedAt,
      error: errorMessage,
    };
  }
}

export async function getLastCrawlStatus() {
  const lastCrawl = await prisma.crawlLog.findFirst({
    where: { status: { in: ['SUCCESS', 'FAILED'] } },
    orderBy: { completedAt: 'desc' },
  });

  const runningCrawl = await prisma.crawlLog.findFirst({
    where: { status: 'RUNNING' },
  });

  return {
    lastCrawl,
    isRunning: !!runningCrawl,
  };
}
