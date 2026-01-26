import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { subDays, startOfDay } from 'date-fns';
import { parseNewsListQuery, NewsDateRange } from '@/lib/validators/news';
import { logger } from '@/lib/logger';

// GET /api/news - 뉴스 목록 조회
export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const searchParams = request.nextUrl.searchParams;

    // Validate query parameters
    const validation = parseNewsListQuery(searchParams);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          code: 'VALIDATION_ERROR',
          details: validation.details,
        },
        { status: 400 }
      );
    }

    const {
      page,
      limit,
      companyIds,
      categories,
      isPersonnel,
      isPowerbaseOnly,
      keyword,
      dateRange,
    } = validation.data!;

    const skip = (page - 1) * limit;

    logger.info(
      {
        requestId,
        page,
        limit,
        companyIds,
        categories,
        isPersonnel,
        isPowerbaseOnly,
        keyword,
        dateRange,
      },
      'News list request'
    );

    // 날짜 범위 계산
    let startDate: Date | undefined;
    const now = new Date();

    switch (dateRange as NewsDateRange) {
      case 'today':
        startDate = startOfDay(now);
        break;
      case '3days':
        startDate = startOfDay(subDays(now, 3));
        break;
      case '1week':
        startDate = startOfDay(subDays(now, 7));
        break;
      case '1month':
        startDate = startOfDay(subDays(now, 30));
        break;
      case 'all':
      default:
        startDate = undefined;
    }

    // where 조건 구성
    const where: Record<string, unknown> = {};

    // Powerbase 고객사만 필터링
    if (isPowerbaseOnly) {
      where.company = { isPowerbaseClient: true };
    }

    if (companyIds && companyIds.length > 0) {
      where.companyId = { in: companyIds };
    }

    if (categories && categories.length > 0) {
      where.category = { in: categories };
    }

    if (isPersonnel !== undefined) {
      where.isPersonnel = isPersonnel;
    }

    if (startDate) {
      where.publishedAt = { gte: startDate };
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { content: { contains: keyword, mode: 'insensitive' } },
        { summary: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // 쿼리 실행
    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          summary: true,
          sourceUrl: true,
          sourceName: true,
          category: true,
          isPersonnel: true,
          publishedAt: true,
          company: {
            select: {
              id: true,
              name: true,
              code: true,
              logoUrl: true,
            },
          },
        },
      }),
      prisma.news.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    logger.info({ requestId, total, totalPages }, 'News list query completed');

    return NextResponse.json({
      success: true,
      data: {
        items: news,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages,
        },
      },
    });
  } catch (error) {
    logger.error({ requestId, error }, 'News list query failed');
    return NextResponse.json(
      { success: false, error: '뉴스 목록을 불러오는데 실패했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
