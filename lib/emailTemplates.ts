// ============================================================================
//  DESTINATION:  lib/emailTemplates.ts   (replaces existing)
// ============================================================================

const BRAND = "#FF9900";
const DARK = "#232F3E";
const SITE = process.env.NEXTAUTH_URL ?? "https://www.hirevexaconsultancy.in";

/**
 * Shared shell for every email.
 *
 * Table-based layout with inline styles, deliberately. Outlook renders with
 * Word's HTML engine — no flexbox, no grid, and external stylesheets are
 * stripped by most clients. This looks like 2005 markup because email clients
 * are stuck there.
 */
function layout(opts: {
  preheader: string;
  heading: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}): string {
  const { preheader, heading, body, ctaLabel, ctaUrl, footerNote } = opts;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <!-- Preheader: the grey preview line next to the subject in most inboxes.
       Hidden in the body itself. Without it, clients pull the first visible
       text, which is usually the logo alt text. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

          <tr>
            <td style="background-color:${DARK};padding:24px 28px;">
              <div style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">HireVexa</div>
              <div style="font-size:10px;font-weight:600;color:${BRAND};letter-spacing:2px;text-transform:uppercase;margin-top:2px;">Consultancy</div>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 28px 8px 28px;">
              <h1 style="margin:0 0 16px 0;font-size:20px;line-height:1.35;font-weight:700;color:#111827;">${escapeHtml(heading)}</h1>
              <div style="font-size:14px;line-height:1.7;color:#4b5563;">${body}</div>
            </td>
          </tr>

          ${ctaLabel && ctaUrl ? `
          <tr>
            <td style="padding:8px 28px 32px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:${BRAND};border-radius:10px;">
                    <a href="${ctaUrl}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:700;color:#111827;text-decoration:none;">${escapeHtml(ctaLabel)}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:14px 0 0 0;font-size:11px;color:#9ca3af;line-height:1.6;">
                If the button doesn't work, copy this link into your browser:<br>
                <span style="color:#6b7280;word-break:break-all;">${ctaUrl}</span>
              </p>
            </td>
          </tr>` : `<tr><td style="padding:0 28px 32px 28px;"></td></tr>`}

          <tr>
            <td style="background-color:#fafafa;border-top:1px solid #e5e7eb;padding:20px 28px;">
              ${footerNote ? `<p style="margin:0 0 10px 0;font-size:12px;color:#6b7280;line-height:1.6;">${footerNote}</p>` : ""}
              <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.7;">
                HireVexa Consultancy &middot; Serving Pan India<br>
                Questions? Reply to this email and we'll get back to you.<br>
                <a href="${SITE}" style="color:#9ca3af;">${SITE.replace(/^https?:\/\//, "")}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Escapes user-supplied values. A candidate named `<script>` shouldn't break the email. */
function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ───────────────────────── 1. Welcome ───────────────────────── */

export function welcomeEmail(name: string): string {
  return layout({
    preheader: "Your HireVexa account is ready — here's what to do next.",
    heading: `Welcome to HireVexa, ${escapeHtml(name)}`,
    body: `
      <p style="margin:0 0 14px 0;">Your account is set up. You can sign in and start straight away.</p>
      <p style="margin:0 0 10px 0;font-weight:600;color:#111827;">To get the most out of it:</p>
      <ol style="margin:0 0 14px 0;padding-left:20px;">
        <li style="margin-bottom:7px;">Upload your resume — recruiters see it first.</li>
        <li style="margin-bottom:7px;">Complete your profile. Fuller profiles get shortlisted more often.</li>
        <li style="margin-bottom:7px;">Complete registration to unlock job applications and full listing details.</li>
      </ol>`,
    ctaLabel: "Go to your dashboard",
    ctaUrl: `${SITE}/dashboard`,
    footerNote: "You're receiving this because an account was created with this email address.",
  });
}

/* ─────────────────── 2. Registration fee paid ─────────────────── */

export function registrationPaidEmail(name: string, amount: number): string {
  return layout({
    preheader: "Registration confirmed — you can now apply to jobs.",
    heading: "Registration confirmed",
    body: `
      <p style="margin:0 0 14px 0;">Hi ${escapeHtml(name)}, we've received your registration payment of <strong>₹${amount}</strong>.</p>
      <p style="margin:0 0 14px 0;">Your account is now fully active. You can see salary details and full job descriptions, apply to any open role, and track every application from your dashboard.</p>
      <p style="margin:0;">A counsellor will be in touch shortly to talk through your goals.</p>`,
    ctaLabel: "Browse open jobs",
    ctaUrl: `${SITE}/jobs`,
    footerNote: "Keep this email as your payment record.",
  });
}

/* ───────────────────── 3. Course purchase ───────────────────── */

export function coursePurchaseEmail(
  name: string,
  courseTitle: string,
  amount: number,
  courseSlug: string
): string {
  return layout({
    preheader: `You're enrolled in ${courseTitle}.`,
    heading: "You're enrolled",
    body: `
      <p style="margin:0 0 14px 0;">Hi ${escapeHtml(name)}, your payment of <strong>₹${amount}</strong> has gone through and you now have full access to:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0;">
        <tr>
          <td style="background-color:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px;">
            <div style="font-size:15px;font-weight:700;color:#111827;">${escapeHtml(courseTitle)}</div>
            <div style="font-size:12px;color:#9a3412;margin-top:4px;">Lifetime access</div>
          </td>
        </tr>
      </table>
      <p style="margin:0;">Modules unlock as you go — finish the lessons in one and clear its assessment to open the next.</p>`,
    ctaLabel: "Start learning",
    ctaUrl: `${SITE}/dashboard/courses/${courseSlug}/learn`,
    footerNote: "Keep this email as your purchase record.",
  });
}

/* ─────────────────── 4. Job application sent ─────────────────── */

export function jobApplicationEmail(
  name: string,
  company: string,
  role: string
): string {
  return layout({
    preheader: `Your application to ${company} has been received.`,
    heading: "Application received",
    body: `
      <p style="margin:0 0 14px 0;">Hi ${escapeHtml(name)}, we've received your application for:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0;">
        <tr>
          <td style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;">
            <div style="font-size:15px;font-weight:700;color:#111827;">${escapeHtml(role)}</div>
            <div style="font-size:13px;color:#6b7280;margin-top:3px;">${escapeHtml(company)}</div>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 14px 0;">Our team reviews applications before they go to the company. You'll get an update as the status changes, and you can check it any time from your dashboard.</p>
      <p style="margin:0;color:#6b7280;font-size:13px;">In the meantime, keep applying — candidates who apply to several roles hear back sooner.</p>`,
    ctaLabel: "Track your application",
    ctaUrl: `${SITE}/dashboard`,
  });
}

/* ───────────────────── 5. Password reset ───────────────────── */

export function resetPasswordEmail(name: string, resetUrl: string): string {
  return layout({
    preheader: "Reset your HireVexa password — this link expires in 1 hour.",
    heading: "Reset your password",
    body: `
      <p style="margin:0 0 14px 0;">Hi ${escapeHtml(name)}, we received a request to reset the password on your HireVexa account.</p>
      <p style="margin:0 0 14px 0;">Click below to choose a new one. <strong>This link expires in 1 hour.</strong></p>`,
    ctaLabel: "Reset password",
    ctaUrl: resetUrl,
    footerNote:
      "If you didn't request this, you can ignore this email — your password won't change. If you keep getting these, reply and let us know.",
  });
}

/* ─────────────── 6. Application rejected (optional) ─────────────── */

export function applicationRejectedEmail(
  name: string,
  company: string,
  role: string,
  reason: string | null
): string {
  return layout({
    preheader: `Update on your application to ${company}.`,
    heading: "Update on your application",
    body: `
      <p style="margin:0 0 14px 0;">Hi ${escapeHtml(name)}, your application for <strong>${escapeHtml(role)}</strong> at ${escapeHtml(company)} won't be moving forward this time.</p>
      ${reason ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0;">
        <tr>
          <td style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;">
            <div style="font-size:11px;font-weight:700;color:#b91c1c;text-transform:uppercase;letter-spacing:0.5px;">Feedback</div>
            <div style="font-size:14px;color:#7f1d1d;margin-top:6px;line-height:1.6;">${escapeHtml(reason)}</div>
          </td>
        </tr>
      </table>` : ""}
      <p style="margin:0 0 14px 0;">This happens to nearly everyone, and it says less than it feels like it does. There are other roles open right now that may fit you better.</p>`,
    ctaLabel: "See other openings",
    ctaUrl: `${SITE}/jobs`,
  });
}