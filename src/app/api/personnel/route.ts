import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { subDays, startOfDay } from 'date-fns';
import { parsePersonnelQuery, PersonnelDateRange } from '@/lib/validators/personnel';
import { logger } from '@/lib/logger';

// GET /api/personnel - 인사 뉴스 목록 조회
export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const searchParams = request.nextUrl.searchParams;

    // Validate query parameters
    const validation = parsePersonnelQuery(searchParams);

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

    const { page, limit, companyIds, keyword, dateRange, startDate } = validation.data!;
    const skip = (page - 1) * limit;

    // Use startDate as dateRange if provided
    const effectiveDateRange: PersonnelDateRange = startDate || dateRange;

    logger.info({ requestId, page, limit, companyIds, keyword, dateRange: effectiveDateRange }, 'Personnel request');

    // 날짜 범위 계산
    let filterStartDate: Date | undefined;
    const now = new Date();

    switch (effectiveDateRange) {
      case '1week':
        filterStartDate = startOfDay(subDays(now, 7));
        break;
      case '1month':
        filterStartDate = startOfDay(subDays(now, 30));
        break;
      case '3months':
        filterStartDate = startOfDay(subDays(now, 90));
        break;
      case 'all':
      default:
        filterStartDate = undefined;
    }

    // where 조건 구성 - News 테이블에서 인사 뉴스만 조회
    const where: Record<string, unknown> = {
      isPersonnel: true,
    };

    if (companyIds && companyIds.length > 0) {
      where.companyId = { in: companyIds };
    }

    if (filterStartDate) {
      where.publishedAt = { gte: filterStartDate };
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { content: { contains: keyword, mode: 'insensitive' } },
        { summary: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // 쿼리 실행 - News 테이블에서 isPersonnel=true인 항목 조회
    const [personnelNews, total] = await Promise.all([
      prisma.news.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
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

    logger.info({ requestId, total, totalPages }, 'Personnel query completed');

    return NextResponse.json({
      success: true,
      data: {
        items: personnelNews,
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
    logger.error({ requestId, error }, 'Personnel query failed');
    return NextResponse.json(
      { success: false, error: '인사 정보를 불러오는데 실패했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
