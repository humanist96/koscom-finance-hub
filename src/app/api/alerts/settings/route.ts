import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/alerts/settings - 알림 설정 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const [keywordAlerts, companyAlerts] = await Promise.all([
      prisma.keywordAlert.findMany({
        where: { userId },
        include: {
          keyword: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.companyAlert.findMany({
        where: { userId },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        keywordAlerts,
        companyAlerts,
      },
    });
  } catch (error) {
    console.error('알림 설정 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '알림 설정을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
