// utils/emailTransporter.ts

import { Resend } from "resend";

/**
 * Resend email client
 * No SMTP, no ports, no Gmail limits. Pure API-based.
 */
export const resend = new Resend(process.env.RESEND_API_KEY!);

// Optional: Ping Resend to verify the API key works
(async () => {
  try {
    await resend.domains.list();
    console.log("✅ Resend API connection verified.");
  } catch (error: any) {
    console.error("❌ Resend API verification failed:", error.message);
  }
})();
