'use server';

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

import prisma from '@/lib/prisma';

export async function setupUser() {
  const { userId } = auth();

  if (!userId) {
    throw new Error('Unautheticated');
  }

  const balance = await prisma.userBalanace.findUnique({
    where: { userId },
  });

  if (!balance) {
    await prisma.userBalanace.create({
      data: { userId, credits: 1000 },
    });
  }

  redirect('/');
}
