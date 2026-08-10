import { resend, FROM_EMAIL, FROM_ADDRESS } from "@/lib/resend";

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, text, replyTo }: SendEmailArgs): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text: text ?? stripHtml(html),
      replyTo: replyTo ?? FROM_ADDRESS,
    });

    if (error) {
      console.error(`[email] FAILED "${subject}" to ${to}:`, error.message);
      return false;
    }

    console.log(`[email] sent "${subject}" to ${to} (${data?.id})`);
    return true;
  } catch (error) {
    const e = error as { message?: string };
    console.error(`[email] FAILED "${subject}" to ${to}:`, e.message);
    return false;
  }
}

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