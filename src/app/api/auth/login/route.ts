import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: '이름과 이메일을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 기존 사용자 조회 또는 새로 생성
    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        favorites: {
          select: { companyId: true },
        },
      },
    });

    if (!user) {
      // 새 사용자 생성
      user = await prisma.user.create({
        data: {
          name,
          email,
        },
        include: {
          favorites: {
            select: { companyId: true },
          },
        },
      });
    } else if (user.name !== name) {
      // 이름이 다르면 업데이트
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name },
        include: {
          favorites: {
            select: { companyId: true },
          },
        },
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        assignedCompanyIds: user.favorites.map((f) => f.companyId),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
