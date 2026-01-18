import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/companies/[id] - 증권사 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const company = await prisma.securitiesCompany.findUnique({
      where: { id },
      include: {
        news: {
          take: 10,
          orderBy: { publishedAt: 'desc' },
          select: {
            id: true,
            title: true,
            summary: true,
            category: true,
            isPersonnel: true,
            publishedAt: true,
            sourceUrl: true,
            sourceName: true,
          },
        },
        personnel: {
          take: 5,
          orderBy: { announcedAt: 'desc' },
          select: {
            id: true,
            personName: true,
            position: true,
            department: true,
            changeType: true,
            announcedAt: true,
          },
        },
        _count: {
          select: {
            news: true,
            personnel: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: '증권사를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error('증권사 상세 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '증권사 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
