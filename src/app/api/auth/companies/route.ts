import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const { userId, companyIds } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 기존 담당 증권사 삭제
    await prisma.userFavorite.deleteMany({
      where: { userId },
    });

    // 새 담당 증권사 추가
    if (companyIds && companyIds.length > 0) {
      await prisma.userFavorite.createMany({
        data: companyIds.map((companyId: string) => ({
          userId,
          companyId,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save companies error:', error);
    return NextResponse.json(
      { error: '저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const favorites = await prisma.userFavorite.findMany({
      where: { userId },
      select: { companyId: true },
    });

    return NextResponse.json({
      companyIds: favorites.map((f) => f.companyId),
    });
  } catch (error) {
    console.error('Get companies error:', error);
    return NextResponse.json(
      { error: '조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
