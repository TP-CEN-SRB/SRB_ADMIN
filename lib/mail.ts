import nodemailer from "nodemailer";
import dns from "dns/promises";

// 🔧 Force IPv4 address resolution for Gmail
const resolveIPv4GmailHost = async () => {
  const { address } = await dns.lookup("smtp.gmail.com", { family: 4 });
  return address;
};

// 📩 Create reusable transporter with forced IPv4 and debug logging
const createIPv4Transporter = async () => {
  const host = await resolveIPv4GmailHost();

  return nodemailer.createTransport({
    host,
    port: 465, // Gmail SSL
    secure: true,
    auth: {
      user: process.env.NEXT_PUBLIC_PERSONAL_EMAIL,
      pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD,
    },
    logger: true,
    debug: true,
  });
};

// ✉️ Email Template - Verification / Reset
const emailTemplate = (link: string, type: "VERIFY" | "RESET") => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${type === "RESET" ? "Reset Password" : "Verify Email"}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #fff;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #333;
    }
    p {
      color: #555;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background-color: #007bff;
      color: #fff;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin-top: 20px;
    }
    .btn:hover {
      background-color: #3399ff;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello,</h1>
    <p>
      We received a request to ${
        type === "RESET" ? "reset your password" : "verify your email address"
      }.
      If you made this request, please click the link below:
    </p>
    <a href="${link}" class="btn">
      ${type === "RESET" ? "Reset Password" : "Verify Email"}
    </a>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <div class="footer">
      <p>Thank you,<br />Temasek Polytechnic CEN</p>
    </div>
  </div>
</body>
</html>
`;
};

// ⚠️ Bin Warning Template
const warningEmailTemplate = (
  binCapacity: number,
  material: string,
  location: string | null
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bin Capacity Warning</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #fff;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #333;
    }
    p {
      color: #555;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello,</h1>
    <p>
      Please be informed that the <b>${material}</b> bin at
      <b>${location ?? "unknown location"}</b> is currently
      <b>${binCapacity.toFixed(2)}%</b> full.
    </p>
    <p>You may proceed to the location to empty the bin.</p>
    <div class="footer">
      <p>Thank you,<br />Temasek Polytechnic CEN</p>
    </div>
  </div>
</body>
</html>
`;
};

// ✅ Send Verification Email
export const sendVerificationEmail = async (
  email: string,
  token: string
) => {
  const confirmLink = `${process.env.BASE_URL}/new-verification?token=${token}`;
  try {
    const transporter = await createIPv4Transporter();
    await transporter.sendMail({
      from: `Temasek Polytechnic CEN <${process.env.NEXT_PUBLIC_PERSONAL_EMAIL}>`,
      to: email,
      subject: "[Smart Bin System] Account verification",
      html: emailTemplate(confirmLink, "VERIFY"),
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

// ✅ Send Password Reset Email
export const sendPasswordResetEmail = async (
  email: string,
  token: string
) => {
  const resetLink = `${process.env.BASE_URL}/new-password?token=${token}`;
  try {
    const transporter = await createIPv4Transporter();
    await transporter.sendMail({
      from: `Temasek Polytechnic CEN <${process.env.NEXT_PUBLIC_PERSONAL_EMAIL}>`,
      to: email,
      subject: "[Smart Bin System] Reset password",
      html: emailTemplate(resetLink, "RESET"),
    });
  } catch (error) {
    console.error("Error sending reset email:", error);
  }
};

// ✅ Send Bin Capacity Warning
export const sendBinWarningEmail = async (
  email: string[],
  binCapacity: number,
  material: string,
  location: string | null
) => {
  try {
    const transporter = await createIPv4Transporter();
    await transporter.sendMail({
      from: `Temasek Polytechnic CEN <${process.env.NEXT_PUBLIC_PERSONAL_EMAIL}>`,
      to: email,
      subject: "[Smart Bin System] Bin Capacity Information",
      html: warningEmailTemplate(binCapacity, material, location),
    });
  } catch (error) {
    console.error("Error sending bin warning email:", error);
  }
};
