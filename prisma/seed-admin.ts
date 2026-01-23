import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@koscom.co.kr';
  const adminPassword = 'admin1234'; // 실제 환경에서는 변경 필요

  // 이미 존재하는지 확인
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('관리자 계정이 이미 존재합니다:', adminEmail);
    return;
  }

  // 비밀번호 해시
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  // 관리자 생성
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: '시스템 관리자',
      role: 'SUPER_ADMIN',
      status: 'APPROVED',
      department: 'IT',
      position: '관리자',
      approvedAt: new Date(),
    },
  });

  console.log('관리자 계정이 생성되었습니다:');
  console.log('  이메일:', admin.email);
  console.log('  비밀번호:', adminPassword);
  console.log('  역할:', admin.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
