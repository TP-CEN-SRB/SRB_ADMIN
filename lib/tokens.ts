import { getVerificationTokenByEmail } from "@/utils/verificationToken";
import { v4 as uuidv4 } from "uuid";
import prisma from "./db";
export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expirationTimeInSeconds = 3600;
  const expires = new Date(
    new Date().getTime() + expirationTimeInSeconds * 1000
  );

  const existingToken = await getVerificationTokenByEmail(email);
  if (existingToken) {
    await prisma.verificationToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const verficationToken = await prisma.verificationToken.create({
    data: {
      email: email,
      token: token,
      expires: expires,
    },
  });
  return verficationToken;
};
