import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/alerts/settings/keywords/[id] - 키워드 알림 수정
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isActive } = body;

    const alert = await prisma.keywordAlert.findUnique({
      where: { id },
    });

    if (!alert) {
      return NextResponse.json(
        { success: false, error: '키워드 알림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const updated = await prisma.keywordAlert.update({
      where: { id },
      data: { isActive },
      include: { keyword: true },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('키워드 알림 수정 실패:', error);
    return NextResponse.json(
      { success: false, error: '키워드 알림 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/alerts/settings/keywords/[id] - 키워드 알림 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const alert = await prisma.keywordAlert.findUnique({
      where: { id },
    });

    if (!alert) {
      return NextResponse.json(
        { success: false, error: '키워드 알림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    await prisma.keywordAlert.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: '키워드 알림이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('키워드 알림 삭제 실패:', error);
    return NextResponse.json(
      { success: false, error: '키워드 알림 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
