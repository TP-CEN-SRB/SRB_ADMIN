import { Resend } from "resend";
import nodemailer from "nodemailer";

// const resend = new Resend(process.env.RESEND_API_KEY);
const emailTemplate = (link: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password / Verify Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333333;
        }
        p {
            color: #555555;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #007BFF;
            color: #555555;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 20px;
        }
        .btn:hover {
            background-color: #3399FF;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #999999;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello,</h1>
        <p>We received a request to reset your password or verify your email address. If you made this request, please click the link below:</p>
        <a href="${link}" class="btn">Reset Password / Verify Email</a>
        <p>If you didn't request this, you can ignore this email.</p>
        <div class="footer">
            <p>Thank you,<br>Temasek Polytechnic CEN</p>
        </div>
    </div>
</body>
</html>
`;
};
export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${process.env.BASE_URL}/new-verification?token=${token}`;

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
      from: `Temasek Polytechnic CEN<${process.env.NEXT_PUBLIC_PERSONAL_EMAIL}>`,
      to: email,
      subject: "[Smart Bin System] Account creation",
      html: emailTemplate(confirmLink),
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
      from: `Temasek Polytechnic CEN<${process.env.NEXT_PUBLIC_PERSONAL_EMAIL}>`,
      to: email,
      subject: "[Smart Bin System] Reset password",
      html: emailTemplate(resetLink),
    });
  } catch (error) {
    return;
  }
};
