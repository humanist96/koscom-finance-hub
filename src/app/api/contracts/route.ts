import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/contracts - 계약 목록 조회
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;

    // 페이지네이션
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    // 필터 파라미터
    const category = searchParams.get('category'); // DOMESTIC, FOREIGN, MIGRATED
    const customerType = searchParams.get('customerType'); // SECURITIES, INSTITUTION, ASSET_MGMT, FUTURES, MEDIA
    const keyword = searchParams.get('keyword');
    const sortBy = searchParams.get('sortBy') || 'orderNumber'; // orderNumber, powerbaseRevenue, year2025Revenue
    const sortOrder = searchParams.get('sortOrder') || 'asc'; // asc, desc

    // where 조건 구성
    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    if (customerType) {
      where.customerType = customerType;
    }

    if (keyword) {
      where.company = {
        name: { contains: keyword },
      };
    }

    // 정렬 조건
    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    // 쿼리 실행
    const [contracts, total] = await Promise.all([
      prisma.customerContract.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          services: {
            select: {
              id: true,
              serviceCode: true,
              serviceName: true,
              amount: true,
              status: true,
            },
          },
        },
      }),
      prisma.customerContract.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        items: contracts,
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
    console.error('계약 목록 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '계약 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
