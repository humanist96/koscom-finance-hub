import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/alerts/settings/keywords - 키워드 알림 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, keyword } = body;

    if (!userId || !keyword) {
      return NextResponse.json(
        { success: false, error: '사용자 ID와 키워드가 필요합니다.' },
        { status: 400 }
      );
    }

    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword.length < 2) {
      return NextResponse.json(
        { success: false, error: '키워드는 2글자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 키워드가 없으면 생성, 있으면 기존 것 사용
    let keywordRecord = await prisma.keyword.findUnique({
      where: { name: trimmedKeyword },
    });

    if (!keywordRecord) {
      keywordRecord = await prisma.keyword.create({
        data: { name: trimmedKeyword },
      });
    }

    // 이미 설정된 알림인지 확인
    const existingAlert = await prisma.keywordAlert.findUnique({
      where: {
        userId_keywordId: {
          userId,
          keywordId: keywordRecord.id,
        },
      },
    });

    if (existingAlert) {
      // 비활성화된 경우 다시 활성화
      if (!existingAlert.isActive) {
        const updated = await prisma.keywordAlert.update({
          where: { id: existingAlert.id },
          data: { isActive: true },
          include: { keyword: true },
        });
        return NextResponse.json({
          success: true,
          data: updated,
          message: '키워드 알림이 다시 활성화되었습니다.',
        });
      }
      return NextResponse.json(
        { success: false, error: '이미 설정된 키워드입니다.' },
        { status: 400 }
      );
    }

    const alert = await prisma.keywordAlert.create({
      data: {
        userId,
        keywordId: keywordRecord.id,
      },
      include: { keyword: true },
    });

    return NextResponse.json({
      success: true,
      data: alert,
      message: '키워드 알림이 추가되었습니다.',
    });
  } catch (error) {
    console.error('키워드 알림 추가 실패:', error);
    return NextResponse.json(
      { success: false, error: '키워드 알림 추가에 실패했습니다.' },
      { status: 500 }
    );
  }
}
