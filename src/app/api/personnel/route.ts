import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { subDays, startOfDay } from 'date-fns';

// GET /api/personnel - 인사 뉴스 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // 페이지네이션
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    // 필터 파라미터
    const companyIds = searchParams.get('companyIds')?.split(',').filter(Boolean) || [];
    const keyword = searchParams.get('keyword');
    const dateRange = searchParams.get('dateRange') || searchParams.get('startDate') || '1month';

    // 날짜 범위 계산
    let startDate: Date | undefined;
    const now = new Date();

    switch (dateRange) {
      case '1week':
        startDate = startOfDay(subDays(now, 7));
        break;
      case '1month':
        startDate = startOfDay(subDays(now, 30));
        break;
      case '3months':
        startDate = startOfDay(subDays(now, 90));
        break;
      case 'all':
      default:
        startDate = undefined;
    }

    // where 조건 구성 - News 테이블에서 인사 뉴스만 조회
    const where: Record<string, unknown> = {
      isPersonnel: true,
    };

    if (companyIds.length > 0) {
      where.companyId = { in: companyIds };
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
    console.error('인사 정보 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '인사 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
