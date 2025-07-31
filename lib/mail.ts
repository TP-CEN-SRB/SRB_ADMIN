// lib/emailService.ts
import { sendEmail } from "@/lib/email"; // Resend wrapper

// 🔗 Email Templates
const emailTemplate = (link: string, type: "VERIFY" | "RESET") => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${type === "RESET" ? "Reset Password" : "Verify Email"}</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); }
    h1 { color: #333; }
    p { color: #555; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
    .btn:hover { background-color: #3399ff; }
    .footer { margin-top: 30px; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello,</h1>
    <p>We received a request to ${
      type === "RESET" ? "reset your password" : "verify your email address"
    }. If you made this request, please click the link below:</p>
    <a href="${link}" class="btn">${type === "RESET" ? "Reset Password" : "Verify Email"}</a>
    <p>If you didn't request this, you can ignore this email.</p>
    <div class="footer"><p>Thank you,<br>Temasek Polytechnic CEN</p></div>
  </div>
</body>
</html>`;
};

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
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); }
    h1 { color: #333; }
    p { color: #555; }
    .footer { margin-top: 30px; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello,</h1>
    <p>The <b>${material}</b> bin at <b>${location ?? "Unknown Location"}</b> is currently <b>${binCapacity.toFixed(2)}%</b> full.</p>
    <p>Please proceed to clear it as soon as possible.</p>
    <div class="footer"><p>Thank you,<br>Temasek Polytechnic CEN</p></div>
  </div>
</body>
</html>`;
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const link = `${process.env.BASE_URL}/new-verification?token=${token}`;
  const html = emailTemplate(link, "VERIFY");

  try {
    console.time("sendVerificationEmail");
    await sendEmail({
      to: email,
      subject: "[Smart Bin System] Account Verification",
      html,
    });
    console.timeEnd("sendVerificationEmail");
  } catch (error) {
    console.error("❌ Verification email failed:", error);
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const link = `${process.env.BASE_URL}/new-password?token=${token}`;
  const html = emailTemplate(link, "RESET");

  try {
    console.time("sendPasswordResetEmail");
    await sendEmail({
      to: email,
      subject: "[Smart Bin System] Reset Password",
      html,
    });
    console.timeEnd("sendPasswordResetEmail");
  } catch (error) {
    console.error("❌ Password reset email failed:", error);
  }
};

export const sendBinWarningEmail = async (
  emails: string[],
  binCapacity: number,
  material: string,
  location: string | null
) => {
  const html = warningEmailTemplate(binCapacity, material, location);

  try {
    console.time("sendBinWarningEmail");
    await sendEmail({
      to: emails,
      subject: "[Smart Bin System] Bin Capacity Warning",
      html,
    });
    console.timeEnd("sendBinWarningEmail");
  } catch (error) {
    console.error("❌ Bin warning email failed:", error);
  }
};
