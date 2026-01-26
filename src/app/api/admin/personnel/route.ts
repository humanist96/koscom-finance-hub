import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 인사정보 생성 스키마
const createPersonnelSchema = z.object({
  companyId: z.string().min(1, '증권사를 선택해주세요'),
  personName: z.string().min(1, '인물명을 입력해주세요'),
  position: z.string().optional(),
  department: z.string().optional(),
  changeType: z.enum(['APPOINTMENT', 'PROMOTION', 'TRANSFER', 'RESIGNATION', 'RETIREMENT']),
  previousPosition: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  effectiveDate: z.string().optional(),
  announcedAt: z.string().min(1, '발표일을 입력해주세요'),
});

// 인사정보 목록 조회
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const companyIds = searchParams.get('companyIds')?.split(',').filter(Boolean) || [];
    const changeTypes = searchParams.get('changeTypes')?.split(',').filter(Boolean) || [];
    const sourceTypes = searchParams.get('sourceTypes')?.split(',').filter(Boolean) || [];
    const keyword = searchParams.get('keyword') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'announcedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (companyIds.length > 0) {
      where.companyId = { in: companyIds };
    }

    if (changeTypes.length > 0) {
      where.changeType = { in: changeTypes };
    }

    if (sourceTypes.length > 0) {
      where.sourceType = { in: sourceTypes };
    }

    if (keyword) {
      where.OR = [
        { personName: { contains: keyword, mode: 'insensitive' } },
        { position: { contains: keyword, mode: 'insensitive' } },
        { department: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.announcedAt = {};
      if (startDate) {
        where.announcedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.announcedAt.lte = new Date(endDate);
      }
    }

    const [items, total] = await Promise.all([
      prisma.personnelChange.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.personnelChange.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      },
    });
  } catch (error) {
    console.error('인사정보 목록 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '인사정보 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 인사정보 생성 (수기 입력)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = createPersonnelSchema.safeParse(body);

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

    const data = validationResult.data;

    // 증권사 존재 확인
    const company = await prisma.securitiesCompany.findUnique({
      where: { id: data.companyId },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: '존재하지 않는 증권사입니다.' },
        { status: 400 }
      );
    }

    const personnel = await prisma.personnelChange.create({
      data: {
        companyId: data.companyId,
        personName: data.personName,
        position: data.position || null,
        department: data.department || null,
        changeType: data.changeType,
        previousPosition: data.previousPosition || null,
        sourceUrl: data.sourceUrl || null,
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : null,
        announcedAt: new Date(data.announcedAt),
        sourceType: 'MANUAL',
        createdById: session.user.id,
      },
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
      message: '인사정보가 등록되었습니다.',
    });
  } catch (error) {
    console.error('인사정보 생성 실패:', error);
    return NextResponse.json(
      { success: false, error: '인사정보 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
