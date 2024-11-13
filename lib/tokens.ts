import { getVerificationTokenByEmail } from "@/utils/verificationToken";
import { v4 as uuidv4 } from "uuid";
import prisma from "./db";
import { getPasswordResetTokenByEmail } from "@/utils/passwordResetToken";
export const generateVerificationToken = async (
  email: string,
  oldEmail?: string
) => {
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
      oldEmail: oldEmail,
      token: token,
      expires: expires,
    },
  });
  return verficationToken;
};

export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expirationTimeInSeconds = 3600;
  const expires = new Date(
    new Date().getTime() + expirationTimeInSeconds * 1000
  );

  const existingToken = await getPasswordResetTokenByEmail(email);
  if (existingToken) {
    await prisma.passswordResetToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const passswordResetToken = await prisma.passswordResetToken.create({
    data: {
      email: email,
      token: token,
      expires: expires,
    },
  });
  return passswordResetToken;
};
