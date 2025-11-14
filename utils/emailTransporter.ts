import nodemailer, { Transporter } from "nodemailer";

/**
 * Shared Gmail transporter with connection pooling.
 * Keeps the SMTP connection alive for faster email sending.
 */
export const transporter: Transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NEXT_PUBLIC_PERSONAL_EMAIL,
    pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

transporter
  .verify()
  .then(() => console.log("✅ Gmail SMTP connection verified."))
  .catch((err) => console.error("❌ Gmail verification failed:", err));
