/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/prefer-optional-chain, @typescript-eslint/prefer-optional-chain */

import NextAuth from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]'; // Or move authOptions to a shared utils file

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };