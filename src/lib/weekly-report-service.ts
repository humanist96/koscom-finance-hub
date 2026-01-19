import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CategoryNews {
  category: string;
  news: Array<{
    title: string;
    summary: string;
    companyName: string;
    publishedAt: Date;
  }>;
}

// 최근 7일 기간 계산
export function getWeekRange(date: Date = new Date()): { weekStart: Date; weekEnd: Date } {
  const weekEnd = new Date(date);
  weekEnd.setHours(23, 59, 59, 999);

  const weekStart = new Date(weekEnd);
  weekStart.setDate(weekStart.getDate() - 6); // 오늘 포함 7일
  weekStart.setHours(0, 0, 0, 0);

  return { weekStart, weekEnd };
}

// 카테고리별 뉴스 수집 (Powerbase 고객사만)
async function getNewsByCategory(weekStart: Date, weekEnd: Date): Promise<CategoryNews[]> {
  const categories = ['BUSINESS', 'PERSONNEL', 'PRODUCT', 'IR', 'EVENT', 'GENERAL'];
  const result: CategoryNews[] = [];

  for (const category of categories) {
    const news = await prisma.news.findMany({
      where: {
        category,
        publishedAt: {
          gte: weekStart,
          lte: weekEnd,
        },
        company: {
          isPowerbaseClient: true, // Powerbase 고객사만 필터링
        },
      },
      include: {
        company: {
          select: { name: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    });

    result.push({
      category,
      news: news.map(n => ({
        title: n.title,
        summary: n.summary || n.title,
        companyName: n.company.name,
        publishedAt: n.publishedAt,
      })),
    });
  }

  return result;
}

// 증권사별 언급 횟수 계산 (Powerbase 고객사만)
async function getCompanyMentions(weekStart: Date, weekEnd: Date): Promise<Record<string, number>> {
  const news = await prisma.news.findMany({
    where: {
      publishedAt: {
        gte: weekStart,
        lte: weekEnd,
      },
      company: {
        isPowerbaseClient: true, // Powerbase 고객사만 필터링
      },
    },
    include: {
      company: {
        select: { name: true },
      },
    },
  });

  const mentions: Record<string, number> = {};
  for (const n of news) {
    mentions[n.company.name] = (mentions[n.company.name] || 0) + 1;
  }

  return mentions;
}

// OpenAI로 카테고리별 요약 생성
async function generateCategorySummary(categoryName: string, news: CategoryNews['news']): Promise<string> {
  if (news.length === 0) {
    return '최근 7일간 관련 뉴스가 없습니다.';
  }

  const categoryKorean: Record<string, string> = {
    BUSINESS: '실적/사업',
    PERSONNEL: '인사',
    PRODUCT: '상품/서비스',
    IR: 'IR/공시',
    EVENT: '이벤트',
    GENERAL: '일반',
  };

  const newsText = news.map((n, i) =>
    `${i + 1}. [${n.companyName}] ${n.title}\n   요약: ${n.summary}`
  ).join('\n\n');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 증권업계 전문 애널리스트입니다. 주어진 ${categoryKorean[categoryName]} 관련 뉴스들을 분석하여 최근 동향을 3-5문장으로 요약해주세요.
- Powerbase 고객사 증권사들의 움직임과 트렌드를 파악하세요
- 업계 전반의 흐름을 설명하세요
- 구체적인 수치나 사례를 포함하세요
- 전문적이면서도 읽기 쉬운 문체를 사용하세요`
        },
        {
          role: 'user',
          content: `다음은 최근 7일간 Powerbase 고객사 ${categoryKorean[categoryName]} 관련 뉴스입니다:\n\n${newsText}`
        }
      ],
      max_tokens: 500,
      temperature: 0.4,
    });

    return response.choices[0]?.message?.content || '요약을 생성할 수 없습니다.';
  } catch (error) {
    console.error(`Error generating ${categoryName} summary:`, error);
    return `최근 7일간 Powerbase 고객사 ${categoryKorean[categoryName]} 관련 주요 뉴스 ${news.length}건이 수집되었습니다.`;
  }
}

// 전체 요약 생성
async function generateExecutiveSummary(categorySummaries: Record<string, string>, totalCount: number): Promise<string> {
  const summaryText = Object.entries(categorySummaries)
    .filter(([_, summary]) => !summary.includes('뉴스가 없습니다'))
    .map(([cat, summary]) => `[${cat}]\n${summary}`)
    .join('\n\n');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 코스콤 금융영업부의 주간 브리핑 담당자입니다.
카테고리별 요약을 바탕으로 최근 7일간 Powerbase 고객사 증권업계의 핵심 하이라이트를 3-4문장으로 정리해주세요.
- 가장 중요한 이슈를 먼저 언급하세요
- 업계 전반의 트렌드를 짚어주세요
- 영업 담당자들이 고객사 미팅에서 활용할 수 있는 인사이트를 제공하세요`
        },
        {
          role: 'user',
          content: `최근 7일간 Powerbase 고객사 총 ${totalCount}건의 뉴스가 수집되었습니다.\n\n${summaryText}`
        }
      ],
      max_tokens: 400,
      temperature: 0.4,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating executive summary:', error);
    return `최근 7일간 Powerbase 고객사 증권업계에서 총 ${totalCount}건의 뉴스가 발생했습니다.`;
  }
}

// 마무리 멘트 생성
async function generateClosingRemarks(executiveSummary: string, mentions: Record<string, number>): Promise<string> {
  const topCompanies = Object.entries(mentions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => `${name}(${count}건)`)
    .join(', ');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 코스콤 금융영업부의 주간 브리핑 담당자입니다.
주간 리포트의 마무리 멘트를 작성해주세요.
- 다음 주 주목할 포인트를 언급하세요
- 영업 담당자들에게 도움이 될 조언을 포함하세요
- 친근하면서도 전문적인 톤을 유지하세요
- 2-3문장으로 작성하세요`
        },
        {
          role: 'user',
          content: `최근 7일 요약: ${executiveSummary}\n\n뉴스가 많았던 Powerbase 고객사: ${topCompanies}`
        }
      ],
      max_tokens: 300,
      temperature: 0.5,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating closing remarks:', error);
    return '다음 주에도 증권업계 동향을 꾸준히 모니터링하겠습니다. 좋은 한 주 되세요!';
  }
}

// 주간 리포트 생성
export async function generateWeeklyReport(date?: Date): Promise<{ success: boolean; reportId?: string; error?: string }> {
  const { weekStart, weekEnd } = getWeekRange(date);

  console.log(`Generating report for last 7 days (Powerbase clients only): ${weekStart.toISOString()} - ${weekEnd.toISOString()}`);

  // 이미 존재하는 리포트 확인
  const existing = await prisma.weeklyReport.findFirst({
    where: { weekStart, weekEnd },
  });

  if (existing?.status === 'PUBLISHED') {
    return { success: true, reportId: existing.id };
  }

  try {
    // 1. 카테고리별 뉴스 수집
    const categoryNews = await getNewsByCategory(weekStart, weekEnd);
    const totalCount = categoryNews.reduce((sum, c) => sum + c.news.length, 0);

    if (totalCount === 0) {
      return { success: false, error: '최근 7일간 Powerbase 고객사 관련 수집된 뉴스가 없습니다.' };
    }

    console.log(`Found ${totalCount} news items across categories`);

    // 2. 증권사별 언급 횟수
    const mentions = await getCompanyMentions(weekStart, weekEnd);

    // 3. 카테고리별 요약 생성
    const categorySummaries: Record<string, string> = {};
    for (const { category, news } of categoryNews) {
      console.log(`Generating summary for ${category} (${news.length} items)...`);
      categorySummaries[category] = await generateCategorySummary(category, news);
      await new Promise(r => setTimeout(r, 500)); // Rate limiting
    }

    // 4. 전체 요약 생성
    console.log('Generating executive summary...');
    const executiveSummary = await generateExecutiveSummary(categorySummaries, totalCount);

    // 5. 마무리 멘트 생성
    console.log('Generating closing remarks...');
    const closingRemarks = await generateClosingRemarks(executiveSummary, mentions);

    // 6. 리포트 저장
    const report = await prisma.weeklyReport.upsert({
      where: {
        weekStart_weekEnd: { weekStart, weekEnd },
      },
      update: {
        businessSummary: categorySummaries.BUSINESS,
        personnelSummary: categorySummaries.PERSONNEL,
        productSummary: categorySummaries.PRODUCT,
        irSummary: categorySummaries.IR,
        eventSummary: categorySummaries.EVENT,
        generalSummary: categorySummaries.GENERAL,
        executiveSummary,
        closingRemarks,
        totalNewsCount: totalCount,
        companyMentions: mentions,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      create: {
        weekStart,
        weekEnd,
        businessSummary: categorySummaries.BUSINESS,
        personnelSummary: categorySummaries.PERSONNEL,
        productSummary: categorySummaries.PRODUCT,
        irSummary: categorySummaries.IR,
        eventSummary: categorySummaries.EVENT,
        generalSummary: categorySummaries.GENERAL,
        executiveSummary,
        closingRemarks,
        totalNewsCount: totalCount,
        companyMentions: mentions,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });

    console.log('Weekly report generated successfully:', report.id);
    return { success: true, reportId: report.id };
  } catch (error) {
    console.error('Error generating weekly report:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// 최신 리포트 조회
export async function getLatestReport() {
  return prisma.weeklyReport.findFirst({
    where: { status: 'PUBLISHED' },
    orderBy: { weekEnd: 'desc' },
  });
}

// 리포트 목록 조회
export async function getReportList(limit = 10) {
  return prisma.weeklyReport.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { weekEnd: 'desc' },
    take: limit,
    select: {
      id: true,
      weekStart: true,
      weekEnd: true,
      totalNewsCount: true,
      publishedAt: true,
    },
  });
}
