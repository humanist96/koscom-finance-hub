import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/search - 통합 검색
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all'; // all, news, personnel
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: '검색어는 2글자 이상 입력해주세요.' },
        { status: 400 }
      );
    }

    const results: {
      news?: unknown[];
      personnel?: unknown[];
      companies?: unknown[];
    } = {};

    // 뉴스 검색
    if (type === 'all' || type === 'news') {
      results.news = await prisma.news.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { content: { contains: query } },
            { summary: { contains: query } },
          ],
        },
        take: limit,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          summary: true,
          category: true,
          isPersonnel: true,
          publishedAt: true,
          sourceUrl: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }

    // 인사 정보 검색
    if (type === 'all' || type === 'personnel') {
      results.personnel = await prisma.personnelChange.findMany({
        where: {
          OR: [
            { personName: { contains: query } },
            { position: { contains: query } },
            { department: { contains: query } },
          ],
        },
        take: limit,
        orderBy: { announcedAt: 'desc' },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }

    // 증권사 검색 (항상 포함)
    if (type === 'all') {
      results.companies = await prisma.securitiesCompany.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { code: { contains: query } },
          ],
        },
        take: 5,
        select: {
          id: true,
          name: true,
          code: true,
          logoUrl: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: results,
      query,
    });
  } catch (error) {
    console.error('검색 실패:', error);
    return NextResponse.json(
      { success: false, error: '검색에 실패했습니다.' },
      { status: 500 }
    );
  }
}
