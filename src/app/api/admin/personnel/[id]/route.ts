import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 인사정보 수정 스키마
const updatePersonnelSchema = z.object({
  companyId: z.string().min(1).optional(),
  personName: z.string().min(1).optional(),
  position: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  changeType: z.enum(['APPOINTMENT', 'PROMOTION', 'TRANSFER', 'RESIGNATION', 'RETIREMENT']).optional(),
  previousPosition: z.string().optional().nullable(),
  sourceUrl: z.string().url().optional().nullable().or(z.literal('')),
  effectiveDate: z.string().optional().nullable(),
  announcedAt: z.string().optional(),
});

// 개별 인사정보 조회
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 403 });
    }

    const { id } = await params;

    const personnel = await prisma.personnelChange.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!personnel) {
      return NextResponse.json(
        { success: false, error: '인사정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: personnel,
    });
  } catch (error) {
    console.error('인사정보 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '인사정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 인사정보 수정
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validationResult = updatePersonnelSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: '입력값이 올바르지 않습니다.',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const existing = await prisma.personnelChange.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: '인사정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const data = validationResult.data;

    // 증권사 변경 시 존재 확인
    if (data.companyId) {
      const company = await prisma.securitiesCompany.findUnique({
        where: { id: data.companyId },
      });

      if (!company) {
        return NextResponse.json(
          { success: false, error: '존재하지 않는 증권사입니다.' },
          { status: 400 }
        );
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (data.companyId !== undefined) updateData.companyId = data.companyId;
    if (data.personName !== undefined) updateData.personName = data.personName;
    if (data.position !== undefined) updateData.position = data.position || null;
    if (data.department !== undefined) updateData.department = data.department || null;
    if (data.changeType !== undefined) updateData.changeType = data.changeType;
    if (data.previousPosition !== undefined) updateData.previousPosition = data.previousPosition || null;
    if (data.sourceUrl !== undefined) updateData.sourceUrl = data.sourceUrl || null;
    if (data.effectiveDate !== undefined) {
      updateData.effectiveDate = data.effectiveDate ? new Date(data.effectiveDate) : null;
    }
    if (data.announcedAt !== undefined) {
      updateData.announcedAt = new Date(data.announcedAt);
    }

    const personnel = await prisma.personnelChange.update({
      where: { id },
      data: updateData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: personnel,
      message: '인사정보가 수정되었습니다.',
    });
  } catch (error) {
    console.error('인사정보 수정 실패:', error);
    return NextResponse.json(
      { success: false, error: '인사정보 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 인사정보 삭제
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.personnelChange.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: '인사정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    await prisma.personnelChange.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: '인사정보가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('인사정보 삭제 실패:', error);
    return NextResponse.json(
      { success: false, error: '인사정보 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
