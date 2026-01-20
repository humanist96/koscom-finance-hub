import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/alerts/settings/companies/[id] - 회사 알림 수정
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { alertOnNews, alertOnPersonnel, isActive } = body;

    const alert = await prisma.companyAlert.findUnique({
      where: { id },
    });

    if (!alert) {
      return NextResponse.json(
        { success: false, error: '회사 알림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const updateData: Record<string, boolean> = {};
    if (typeof alertOnNews === 'boolean') updateData.alertOnNews = alertOnNews;
    if (typeof alertOnPersonnel === 'boolean') updateData.alertOnPersonnel = alertOnPersonnel;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const updated = await prisma.companyAlert.update({
      where: { id },
      data: updateData,
      include: {
        company: {
          select: { id: true, name: true, logoUrl: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('회사 알림 수정 실패:', error);
    return NextResponse.json(
      { success: false, error: '회사 알림 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/alerts/settings/companies/[id] - 회사 알림 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const alert = await prisma.companyAlert.findUnique({
      where: { id },
    });

    if (!alert) {
      return NextResponse.json(
        { success: false, error: '회사 알림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    await prisma.companyAlert.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: '회사 알림이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('회사 알림 삭제 실패:', error);
    return NextResponse.json(
      { success: false, error: '회사 알림 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
