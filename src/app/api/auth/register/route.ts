import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validators';
import { successResponse, handleApiError } from '@/lib/api-response';
import { ConflictError } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Zod 검증
    const validated = registerSchema.parse(body);
    const { email, password, name, department, position, employeeId } = validated;

    // 이메일 중복 확인
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictError('이미 등록된 이메일입니다.');
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 12);

    // 사용자 생성 (PENDING 상태)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        department: department || null,
        position: position || null,
        employeeId: employeeId || null,
        status: 'PENDING',
        role: 'USER',
      },
    });

    // 관리자에게 알림 생성
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        status: 'APPROVED',
      },
    });

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: 'SYSTEM',
          title: '새로운 회원가입 신청',
          message: `${name}(${email})님이 회원가입을 신청했습니다.`,
          linkType: 'USER',
          linkId: user.id,
        })),
      });
    }

    return successResponse({
      message: '회원가입 신청이 완료되었습니다. 관리자 승인 후 이용 가능합니다.',
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'auth/register');
  }
}
