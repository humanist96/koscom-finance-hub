import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  sendApprovalEmail,
  sendRejectionEmail,
  sendSuspensionEmail,
  sendReactivationEmail,
  sendPasswordResetEmail,
} from '@/lib/email';

// 임시 비밀번호 생성 함수
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// 사용자 목록 조회
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 관리자 권한 확인
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = status ? { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          department: true,
          position: true,
          employeeId: true,
          createdAt: true,
          approvedAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('사용자 목록 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '사용자 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 사용자 승인/거절/정지
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 관리자 권한 확인
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action, rejectReason } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: '필수 항목이 누락되었습니다.' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    let updateData: {
      status: 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'PENDING';
      approvedAt?: Date;
      approvedBy?: string;
      rejectedAt?: Date;
      rejectReason?: string | null;
    };

    let notificationMessage = '';

    switch (action) {
      case 'approve':
        updateData = {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: session.user.id,
          rejectReason: null,
        };
        notificationMessage = '회원가입이 승인되었습니다. 이제 로그인하실 수 있습니다.';
        break;

      case 'reject':
        updateData = {
          status: 'REJECTED',
          rejectedAt: new Date(),
          rejectReason: rejectReason || '관리자에 의해 거절되었습니다.',
        };
        notificationMessage = `회원가입이 거절되었습니다. 사유: ${rejectReason || '관리자에 의해 거절되었습니다.'}`;
        break;

      case 'suspend':
        updateData = {
          status: 'SUSPENDED',
        };
        notificationMessage = '계정이 정지되었습니다. 관리자에게 문의해주세요.';
        break;

      case 'reactivate':
        updateData = {
          status: 'APPROVED',
        };
        notificationMessage = '계정이 재활성화되었습니다.';
        break;

      case 'resetPassword': {
        // 비밀번호 초기화는 별도 처리
        const temporaryPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        await prisma.user.update({
          where: { id: userId },
          data: { password: hashedPassword },
        });

        // 알림 생성
        await prisma.notification.create({
          data: {
            userId: userId,
            type: 'SYSTEM',
            title: '비밀번호 초기화',
            message: '관리자에 의해 비밀번호가 초기화되었습니다. 이메일을 확인해주세요.',
          },
        });

        // 이메일 발송
        const userName = targetUser.name || targetUser.email;
        try {
          await sendPasswordResetEmail(targetUser.email, userName, temporaryPassword);
        } catch (emailError) {
          console.error('비밀번호 초기화 이메일 발송 실패:', emailError);
        }

        return NextResponse.json({
          success: true,
          message: '비밀번호가 초기화되었습니다. 임시 비밀번호가 이메일로 발송되었습니다.',
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: '잘못된 액션입니다.' },
          { status: 400 }
        );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
      },
    });

    // 사용자에게 알림 생성
    await prisma.notification.create({
      data: {
        userId: userId,
        type: 'SYSTEM',
        title: action === 'approve' ? '가입 승인 완료' :
               action === 'reject' ? '가입 거절' :
               action === 'suspend' ? '계정 정지' : '계정 재활성화',
        message: notificationMessage,
      },
    });

    // 이메일 발송 (비동기, 실패해도 응답에 영향 없음)
    const userName = targetUser.name || targetUser.email;
    try {
      switch (action) {
        case 'approve':
          await sendApprovalEmail(targetUser.email, userName);
          break;
        case 'reject':
          await sendRejectionEmail(targetUser.email, userName, rejectReason);
          break;
        case 'suspend':
          await sendSuspensionEmail(targetUser.email, userName);
          break;
        case 'reactivate':
          await sendReactivationEmail(targetUser.email, userName);
          break;
      }
    } catch (emailError) {
      console.error('이메일 발송 실패:', emailError);
      // 이메일 실패해도 사용자 상태 변경은 성공으로 처리
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: `사용자가 ${action === 'approve' ? '승인' : action === 'reject' ? '거절' : action === 'suspend' ? '정지' : '재활성화'}되었습니다.`,
    });
  } catch (error) {
    console.error('사용자 상태 변경 실패:', error);
    return NextResponse.json(
      { success: false, error: '사용자 상태 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
