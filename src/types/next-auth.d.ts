import 'next-auth';
import { UserRole, UserStatus } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: string;
      status: string;
      assignedCompanyIds: string[];
    };
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    status: UserStatus;
    assignedCompanyIds?: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    status: string;
    assignedCompanyIds: string[];
  }
}
