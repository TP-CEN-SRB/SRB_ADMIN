import { auth } from "@/auth";

export const getUserRole = async () => {
  const session = await auth();
  return session?.user.role;
};

export const getSessionUser = async () => {
  const session = await auth();
  return session?.user;
};
