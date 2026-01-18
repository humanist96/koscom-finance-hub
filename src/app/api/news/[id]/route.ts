import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/news/[id] - 뉴스 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const news = await prisma.news.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            code: true,
            logoUrl: true,
            websiteUrl: true,
          },
        },
        keywords: {
          include: {
            keyword: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!news) {
      return NextResponse.json(
        { success: false, error: '뉴스를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: news,
    });
  } catch (error) {
    console.error('뉴스 상세 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '뉴스 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
