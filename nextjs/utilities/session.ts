import type { Roles } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../client';
import Session from 'services/session';

export type UserSession = {
  accountId: string;
  userId: string;
  role: Roles;
  authId: string;
  email: string;
};

export async function getAuthFromSession(
  request: NextApiRequest,
  response: NextApiResponse
): Promise<UserSession> {
  const session = await Session.find(request, response);
  if (!session || !session?.user?.email) {
    throw 'missing session';
  }

  const auth = await prisma.auths.findFirst({
    where: {
      email: session.user.email,
    },
    include: { account: true, users: true },
  });
  if (!auth) {
    throw 'auth not found';
  }

  const { account } = auth;
  if (!account) {
    throw 'missing account from auth';
  }

  const user = auth.users.find((user) => user.accountsId === auth.accountId);
  if (!user) {
    throw 'missing user from auth';
  }

  return {
    accountId: account.id,
    userId: user.id,
    role: user.role,
    authId: auth.id,
    email: auth.email,
  };
}
