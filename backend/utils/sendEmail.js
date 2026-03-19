// utils/sendEmail.js
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail(to, subject, htmlContent) {
  const msg = {
    to,
    from: "no-reply@tonsite.com",
    subject,
    html: htmlContent,
  };
  await sgMail.send(msg);
}
