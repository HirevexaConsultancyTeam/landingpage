const BASE_URL = process.env.NEXTAUTH_URL || "https://landingpage-eta-drab.vercel.app";

export function welcomeEmail(name: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1a2332,#232F3E);border-radius:16px 16px 0 0;padding:40px 40px 32px;text-align:center;">
      <div style="background:#FF9900;display:inline-block;padding:12px 16px;border-radius:12px;margin-bottom:20px;">
        <span style="color:#131921;font-weight:900;font-size:20px;letter-spacing:1px;">HireVexa</span>
      </div>
      <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;">Welcome aboard, ${name}! 🚀</h1>
      <p style="color:#aaaaaa;margin:10px 0 0;font-size:14px;">Your career journey starts now</p>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:40px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Hi <strong>${name}</strong>,
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Your HireVexa account has been created successfully. We're excited to help you land your first job!
      </p>

      <!-- Steps -->
      <div style="background:#f9fafb;border-radius:12px;padding:24px;margin-bottom:28px;">
        <p style="color:#111827;font-weight:700;margin:0 0 16px;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;">Here's how to get started:</p>
        ${[
          ["Complete your profile", "Add your education, skills, and job preferences"],
          ["Upload your resume", "Our counsellor will review and optimise it for you"],
          ["Browse open jobs", "Apply to roles matched to your profile"],
          ["Book a counselling session", "Get personalised guidance from our experts"],
        ].map(([title, desc], i) => `
        <div style="display:flex;align-items:flex-start;margin-bottom:14px;">
          <div style="background:#FF9900;color:#131921;font-weight:700;font-size:12px;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-right:12px;margin-top:1px;">${i + 1}</div>
          <div>
            <p style="margin:0;color:#111827;font-weight:600;font-size:14px;">${title}</p>
            <p style="margin:2px 0 0;color:#6b7280;font-size:13px;">${desc}</p>
          </div>
        </div>`).join("")}
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${BASE_URL}/dashboard" style="display:inline-block;background:#FF9900;color:#131921;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;">
          Go to My Dashboard →
        </a>
      </div>

      <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0;">
        Our team will reach out within 24 hours to schedule your first counselling session. If you have any questions, reply to this email or contact us at <a href="mailto:hirevexaconsultancy01@gmail.com" style="color:#FF9900;">hirevexaconsultancy01@gmail.com</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        © 2025 HireVexa Consultancy · Pan India<br/>
        <a href="${BASE_URL}" style="color:#FF9900;text-decoration:none;">hirevexa.com</a> · 
        <a href="mailto:hirevexaconsultancy01@gmail.com" style="color:#FF9900;text-decoration:none;">Support</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}

export function resetPasswordEmail(name: string, resetUrl: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1a2332,#232F3E);border-radius:16px 16px 0 0;padding:40px 40px 32px;text-align:center;">
      <div style="background:#FF9900;display:inline-block;padding:12px 16px;border-radius:12px;margin-bottom:20px;">
        <span style="color:#131921;font-weight:900;font-size:20px;letter-spacing:1px;">HireVexa</span>
      </div>
      <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;">Reset Your Password 🔐</h1>
      <p style="color:#aaaaaa;margin:10px 0 0;font-size:14px;">We received a request to reset your password</p>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:40px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Hi <strong>${name}</strong>,
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 28px;">
        Someone requested a password reset for your HireVexa account. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
      </p>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${resetUrl}" style="display:inline-block;background:#FF9900;color:#131921;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;">
          Reset My Password →
        </a>
      </div>

      <!-- Security note -->
      <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:10px;padding:16px;margin-bottom:24px;">
        <p style="color:#92400e;font-size:13px;margin:0;line-height:1.6;">
          ⚠️ If you didn't request this, you can safely ignore this email. Your password will not change unless you click the link above.
        </p>
      </div>

      <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${resetUrl}" style="color:#FF9900;word-break:break-all;">${resetUrl}</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        © 2025 HireVexa Consultancy · Pan India<br/>
        <a href="${BASE_URL}" style="color:#FF9900;text-decoration:none;">hirevexa.com</a> · 
        <a href="mailto:hirevexaconsultancy01@gmail.com" style="color:#FF9900;text-decoration:none;">Support</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}