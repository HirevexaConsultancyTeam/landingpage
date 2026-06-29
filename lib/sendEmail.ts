import { transporter } from "./nodemailer";

type SendEmailProps = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailProps) {
  await transporter.sendMail({
    from: `"HireVexa" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}