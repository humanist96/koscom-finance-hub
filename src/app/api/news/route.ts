import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { subDays, startOfDay, endOfDay } from 'date-fns';

// GET /api/news - 뉴스 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // 페이지네이션
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    // 필터 파라미터
    const companyIds = searchParams.get('companyIds')?.split(',').filter(Boolean) || [];
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
    const isPersonnel = searchParams.get('isPersonnel');
    const keyword = searchParams.get('keyword');
    const dateRange = searchParams.get('dateRange') || '1week';

    // 날짜 범위 계산
    let startDate: Date | undefined;
    const now = new Date();

    switch (dateRange) {
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

    if (companyIds.length > 0) {
      where.companyId = { in: companyIds };
    }

    if (categories.length > 0) {
      where.category = { in: categories };
    }

    if (isPersonnel !== null && isPersonnel !== undefined) {
      where.isPersonnel = isPersonnel === 'true';
    }

    if (startDate) {
      where.publishedAt = { gte: startDate };
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { content: { contains: keyword } },
        { summary: { contains: keyword } },
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
    console.error('뉴스 목록 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '뉴스 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
