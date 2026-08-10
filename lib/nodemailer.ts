// ============================================================================
//  DESTINATION:  lib/nodemailer.ts   (replaces existing)
// ============================================================================
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.titan.email",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  // Without these, an unreachable host hangs until the OS gives up — which is
  // why the forgot-password route sat for 5 seconds before failing.
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000,

  // Reuse one connection across a burst of sends rather than reconnecting each
  // time. Titan rate-limits aggressive senders.
  pool: true,
  maxConnections: 3,
  maxMessages: 50,
});

export const FROM_ADDRESS = process.env.EMAIL_USER ?? "";
export const FROM_NAME = process.env.EMAIL_FROM_NAME ?? "HireVexa Consultancy";