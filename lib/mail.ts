import nodemailer from "nodemailer";

// ✅ Base64-URL encode helper
function base64UrlEncode(str: string) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NEXT_PUBLIC_PERSONAL_EMAIL,
    pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD,
  },
});

// ✨ Styled HTML template + plain text fallback
const emailTemplate = (link: string, type: "VERIFY" | "RESET") => {
  const action = type === "RESET" ? "reset your password" : "verify your email address";
  const button = type === "RESET" ? "Reset Password" : "Verify Email";
  return {
    html: `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 0; margin: 0;">
        <div style="max-width: 600px; margin: 30px auto; background-color: #fff; padding: 20px; border-radius: 8px;">
          <h1 style="color: #333;">Hello,</h1>
          <p style="color: #555;">We received a request to ${action}. Click the button below to proceed:</p>
          <a href="${link}" style="display:inline-block; padding: 12px 24px; background:#007BFF; color:#fff; border-radius:5px; text-decoration:none;">${button}</a>
          <p style="color: #555;">If this wasn't you, you can ignore this email.</p>
          <p style="font-size:12px; color:#aaa;">Thank you,<br>Temasek Polytechnic CEN</p>
        </div>
      </body>
    </html>`,
    text: `Hello,\n\nWe received a request to ${action}.\nPlease use the link below:\n\n${link}\n\nIf this wasn't you, you can ignore this email.\n\nThank you,\nTemasek Polytechnic CEN`
  };
};

const warningEmailTemplate = (binCapacity: number, material: string, location: string | null) => ({
  html: `
  <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width:600px;margin:30px auto;background-color:#fff;padding:20px;border-radius:8px;">
        <h1 style="color:#333;">Bin Capacity Alert</h1>
        <p style="color:#555;">The <b>${material}</b> bin at <b>${location}</b> is <b>${binCapacity.toFixed(2)}%</b> full.</p>
        <p style="color:#555;">Please clear it at your earliest convenience.</p>
        <p style="font-size:12px; color:#aaa;">Thank you,<br>Temasek Polytechnic CEN</p>
      </div>
    </body>
  </html>`,
  text: `The ${material} bin at ${location} is currently ${binCapacity.toFixed(2)}% full.\n\nPlease clear the bin.\n\n- Temasek Polytechnic CEN`
});

// ✅ Verification email with Base64-URL encoded token
export const sendVerificationEmail = async (email: string, token: string) => {
  const encodedToken = base64UrlEncode(token);
  const link = `${process.env.BASE_URL}/new-verification?token=${encodedToken}`;
  const content = emailTemplate(link, "VERIFY");

  try {
    await transporter.sendMail({
      from: `Temasek Polytechnic CEN <${process.env.NEXT_PUBLIC_PERSONAL_EMAIL}>`,
      to: email,
      subject: "[Smart Bin System] Email Verification",
      html: content.html,
      text: content.text,
      headers: {
        "X-Priority": "3",
        "X-Mailer": "SmartBinMailer"
      },
    });
  } catch (error) {
    console.error("[Email Error] Verification Email:", error);
  }
};

// ✅ Password reset email with Base64-URL encoded token
export const sendPasswordResetEmail = async (email: string, token: string) => {
  const encodedToken = base64UrlEncode(token);
  const link = `${process.env.BASE_URL}/new-password?token=${encodedToken}`;
  const content = emailTemplate(link, "RESET");

  try {
    await transporter.sendMail({
      from: `Temasek Polytechnic CEN <${process.env.NEXT_PUBLIC_PERSONAL_EMAIL}>`,
      to: email,
      subject: "[Smart Bin System] Password Reset",
      html: content.html,
      text: content.text,
      headers: {
        "X-Priority": "3",
        "X-Mailer": "SmartBinMailer"
      },
    });
  } catch (error) {
    console.error("[Email Error] Reset Email:", error);
  }
};

// ✅ Bin warning email (unchanged)
export const sendBinWarningEmail = async (
  email: string[],
  binCapacity: number,
  material: string,
  location: string | null
) => {
  const content = warningEmailTemplate(binCapacity, material, location);

  try {
    await transporter.sendMail({
      from: `Temasek Polytechnic CEN <${process.env.NEXT_PUBLIC_PERSONAL_EMAIL}>`,
      to: email,
      subject: "[Smart Bin System] Bin Capacity Warning",
      html: content.html,
      text: content.text,
      headers: {
        "X-Priority": "3",
        "X-Mailer": "SmartBinMailer"
      },
    });
  } catch (error) {
    console.error("[Email Error] Bin Warning Email:", error);
  }
};
