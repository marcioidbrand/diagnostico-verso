import nodemailer from "nodemailer";
import { Resend } from "resend";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  attachment?: { filename: string; content: Buffer };
};

export async function sendTransactionalEmail(payload: EmailPayload) {
  const from = "marcio@estudioincognitum.com.br";

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      attachments: payload.attachment
        ? [
            {
              filename: payload.attachment.filename,
              content: payload.attachment.content
            }
          ]
        : undefined
    });
    return;
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("Configure RESEND_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASS.");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    attachments: payload.attachment
      ? [
          {
            filename: payload.attachment.filename,
            content: payload.attachment.content
          }
        ]
      : undefined
  });
}
