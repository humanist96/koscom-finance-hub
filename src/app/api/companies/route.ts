import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/companies - 증권사 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const withStats = searchParams.get('withStats') === 'true';
    const isActive = searchParams.get('isActive');

    const where = isActive !== null ? { isActive: isActive === 'true' } : {};

    const companies = await prisma.securitiesCompany.findMany({
      where,
      orderBy: { name: 'asc' },
      ...(withStats && {
        include: {
          _count: {
            select: {
              news: true,
              personnel: true,
            },
          },
        },
      }),
    });

    return NextResponse.json({
      success: true,
      data: companies,
    });
  } catch (error) {
    console.error('증권사 목록 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '증권사 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
