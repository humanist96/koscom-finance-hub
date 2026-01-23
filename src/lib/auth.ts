import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: '이메일', type: 'email' },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('이메일과 비밀번호를 입력해주세요.');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('등록되지 않은 이메일입니다.');
        }

        if (!user.password) {
          throw new Error('비밀번호가 설정되지 않았습니다.');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('비밀번호가 일치하지 않습니다.');
        }

        // 승인 상태 확인
        if (user.status === 'PENDING') {
          throw new Error('PENDING:관리자 승인 대기 중입니다.');
        }

        if (user.status === 'REJECTED') {
          throw new Error('REJECTED:가입이 거절되었습니다.');
        }

        if (user.status === 'SUSPENDED') {
          throw new Error('SUSPENDED:계정이 정지되었습니다.');
        }

        // 마지막 로그인 시간 업데이트
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        // 담당 증권사 목록 조회
        const favorites = await prisma.userFavorite.findMany({
          where: { userId: user.id },
          select: { companyId: true },
        });
        const assignedCompanyIds = favorites.map(f => f.companyId);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          assignedCompanyIds,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.assignedCompanyIds = user.assignedCompanyIds || [];
      }
      // 세션 업데이트 시 담당 증권사 목록 새로고침
      if (trigger === 'update') {
        const favorites = await prisma.userFavorite.findMany({
          where: { userId: token.id as string },
          select: { companyId: true },
        });
        token.assignedCompanyIds = favorites.map(f => f.companyId);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
        session.user.assignedCompanyIds = token.assignedCompanyIds as string[];
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24시간
  },
  secret: process.env.NEXTAUTH_SECRET,
};
