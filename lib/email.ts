// lib/email.ts
"use server";

import { Resend } from "resend";

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY); 
// Send email helper function
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
      from: process.env.RESEND_FROM_EMAIL!, // e.g., "Smart Bin System <onboarding@resend.dev>"
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
