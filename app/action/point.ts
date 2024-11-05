"use server";

import prisma from "@/lib/db";

const getPointByAdminNumber = async (adminNumber: string) => {
  const user = await prisma.user.findFirst({
    where: {
      email: {
        contains: adminNumber.toLowerCase(),
      },
    },
  });
  if (user) {
    const point = await prisma.point.findFirst({
      where: { userId: user?.id },
    });
    return point;
  }
  return null;
};

export { getPointByAdminNumber };
