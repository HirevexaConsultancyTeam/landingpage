// ============================================================================
//  DESTINATION:  lib/sendEmail.ts   (replaces existing)
// ============================================================================
import { transporter, FROM_ADDRESS, FROM_NAME } from "@/lib/nodemailer";

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Sends an email. Returns true on success, false on failure — it does NOT throw.
 *
 * That's deliberate. Every caller here is a side effect of something more
 * important: a registration, a payment, a job application. If SMTP is down, the
 * user must still get their account, their course and their application. An
 * exception propagating out of a send would roll back or 500 the thing they
 * actually came to do.
 *
 * Failures are logged loudly instead, so they show up in your server logs
 * rather than vanishing.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendEmailArgs): Promise<boolean> {
  if (!FROM_ADDRESS) {
    console.error("[email] EMAIL_USER is not set — skipping send to", to);
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_ADDRESS}>`,
      to,
      subject,
      html,
      // A plaintext fallback improves deliverability — HTML-only mail scores
      // worse with spam filters. Generated from the HTML if not supplied.
      text: text ?? stripHtml(html),
      replyTo: replyTo ?? FROM_ADDRESS,
    });

    console.log(`[email] sent "${subject}" to ${to} (${info.messageId})`);
    return true;
  } catch (error) {
    const e = error as { code?: string; message?: string };
    console.error(`[email] FAILED "${subject}" to ${to}:`, e.code, e.message);
    return false;
  }
}

/**
 * Fire-and-forget wrapper for use inside request handlers.
 *
 * Awaiting a send adds a second or two to the response — the user sits watching
 * a spinner while SMTP negotiates. This lets the handler return immediately.
 * The tradeoff is no confirmation the mail went out, which is why sendEmail
 * logs its own failures.
 */
export function sendEmailAsync(args: SendEmailArgs): void {
  void sendEmail(args).catch((e) => console.error("[email] unexpected:", e));
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}