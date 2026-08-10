import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY environment variable");
}

export const resend = new Resend(RESEND_API_KEY);

export const FROM_ADDRESS = process.env.EMAIL_FROM ?? "noreply@hirevexaconsultancy.in";
export const FROM_NAME = process.env.EMAIL_FROM_NAME || "HireVexa Consultancy";
export const FROM_EMAIL = `${FROM_NAME} <${FROM_ADDRESS}>`;