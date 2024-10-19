import { Resend } from "resend";
import nodemailer from "nodemailer";

// const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${process.env.BASE_URL}/new-verification?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
      user: process.env.NEXT_PUBLIC_PERSONAL_EMAIL,
      pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD,
    },
  });
  try {
    const testResult = await transporter.verify();
  } catch (error) {
    return;
  }

  try {
    const sendResult = await transporter.sendMail({
      from: `Automated Messenger<${process.env.NEXT_PUBLIC_PERSONAL_EMAIL}>`,
      to: email,
      subject: "[Confirmation] Account creation",
      html: `<p>Click <a href=${confirmLink}>here</a> to verify email</p>`,
    });
  } catch (error) {
    return;
  }
  // await resend.emails.send({
  //   from: "onboarding@resend.dev",
  //   to: email,
  //   subject: "[Confirmation] Account creation",
  //   html: `<p>Click <a href=${confirmLink}>here</a> to confirm email</p>`,
  // });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.BASE_URL}/new-password?token=${token}`;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NEXT_PUBLIC_PERSONAL_EMAIL,
      pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD,
    },
  });
  try {
    const testResult = await transporter.verify();
  } catch (error) {
    return;
  }

  try {
    const sendResult = await transporter.sendMail({
      from: `Automated Messenger<${process.env.NEXT_PUBLIC_PERSONAL_EMAIL}>`,
      to: email,
      subject: "[Confirmation] Reset password",
      html: `<p>Click <a href=${resetLink}>here</a> to reset password</p>`,
    });
  } catch (error) {
    return;
  }
};
