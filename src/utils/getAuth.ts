import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const getUserRole = async () => {
  const session = await auth();
  return session?.user?.role;
};

export const getSessionUser = async () => {
  const session = await auth();
  if (!session?.user?.email) return null; // ⛔️ No valid user

  // ✅ Fetch full user record from Prisma
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true, role: true, faculty: true },
  });

  return user;
};
