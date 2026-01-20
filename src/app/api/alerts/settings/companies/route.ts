import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/alerts/settings/companies - 회사 알림 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, companyId, alertOnNews = true, alertOnPersonnel = true } = body;

    if (!userId || !companyId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID와 회사 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 회사 존재 여부 확인
    const company = await prisma.securitiesCompany.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: '회사를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 설정된 알림인지 확인
    const existingAlert = await prisma.companyAlert.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
    });

    if (existingAlert) {
      // 비활성화된 경우 다시 활성화
      if (!existingAlert.isActive) {
        const updated = await prisma.companyAlert.update({
          where: { id: existingAlert.id },
          data: {
            isActive: true,
            alertOnNews,
            alertOnPersonnel,
          },
          include: {
            company: {
              select: { id: true, name: true, logoUrl: true },
            },
          },
        });
        return NextResponse.json({
          success: true,
          data: updated,
          message: '회사 알림이 다시 활성화되었습니다.',
        });
      }
      return NextResponse.json(
        { success: false, error: '이미 설정된 회사입니다.' },
        { status: 400 }
      );
    }

    const alert = await prisma.companyAlert.create({
      data: {
        userId,
        companyId,
        alertOnNews,
        alertOnPersonnel,
      },
      include: {
        company: {
          select: { id: true, name: true, logoUrl: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: alert,
      message: '회사 알림이 추가되었습니다.',
    });
  } catch (error) {
    console.error('회사 알림 추가 실패:', error);
    return NextResponse.json(
      { success: false, error: '회사 알림 추가에 실패했습니다.' },
      { status: 500 }
    );
  }
}
