
'use server';

import { currentUser } from '@clerk/nextjs/server';
import  prisma  from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function grantFreeCredits() {
  const user = await currentUser();
  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  const userBalance = await prisma.userBalanace.findUnique({
    where: { userId: user.id },
  });

  if (!userBalance) {
    await prisma.userBalanace.create({
      data: {
        userId: user.id,
        credits: 1000,
        hasClaimedFreeCredit: true,
      },
    });

    revalidatePath('/setup');
    return { success: true, message: '1000 free credits added!' };
  }

  if (userBalance.hasClaimedFreeCredit) {
    return { success: false, message: 'Only new users get free credits' };
  }

  await prisma.userBalanace.update({
    where: { userId: user.id },
    data: {
      credits: { increment: 1000 },
      hasClaimedFreeCredit: true,
    },
  });

  revalidatePath('/setup');
  return { success: true, message: '1000 free credits added!' };
}
