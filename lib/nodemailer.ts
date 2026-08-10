// ============================================================================
// DESTINATION: lib/nodemailer.ts
// ============================================================================

import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error(
    "Missing EMAIL_USER or EMAIL_PASS environment variables"
  );
}

export const transporter = nodemailer.createTransport({
  host: "smtp.titan.email",
  port: 465,
  secure: true,

  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },

  // Timeouts
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,

  // Helpful during development
  debug: process.env.NODE_ENV === "development",
  logger: process.env.NODE_ENV === "development",
});

export const FROM_ADDRESS = EMAIL_USER;

export const FROM_NAME =
  process.env.EMAIL_FROM_NAME || "HireVexa Consultancy";

export const FROM_EMAIL = `"${FROM_NAME}" <${FROM_ADDRESS}>`;

/**
 * Verify SMTP connection on startup
 */
export async function verifyEmailConnection() {
  try {
    await transporter.verify();

    console.log("✅ SMTP connection established successfully");
    console.log(`📧 Mailbox: ${EMAIL_USER}`);

    return true;
  } catch (error) {
    console.error("❌ SMTP verification failed");
    console.error(error);

    return false;
  }
}