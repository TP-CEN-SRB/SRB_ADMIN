// lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) => {
  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!, // Example: "Smart Bin System <onboarding@resend.dev>"
      to,
      subject,
      html,
    });
    console.log("[Resend] Email sent:", response);
    return response;
  } catch (error) {
    console.error("[Resend] Failed to send email:", error);
    throw error;
  }
};
