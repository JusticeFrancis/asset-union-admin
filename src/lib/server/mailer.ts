import nodemailer from "nodemailer";

function transporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD must be configured");
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendMail(options: { to: string | string[]; bcc?: string | string[]; subject: string; html: string; text?: string }) {
  const from = process.env.EMAIL_FROM || `Asset Union <${process.env.GMAIL_USER}>`;
  return transporter().sendMail({ from, ...options });
}

export async function sendAdminInviteEmail(input: {
  to: string;
  fullName: string;
  invitedBy: string;
  roleLabel: string;
  token: string;
}) {
  const baseUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const url = `${baseUrl}/accept-admin-invite?token=${encodeURIComponent(input.token)}`;
  return sendMail({
    to: input.to,
    subject: "You have been invited to Asset Union Admin",
    text: `${input.invitedBy} invited you as ${input.roleLabel}. Accept within 30 minutes: ${url}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#050a0e">
      <h2>Asset Union admin invitation</h2>
      <p>Hello ${escapeHtml(input.fullName)},</p>
      <p>${escapeHtml(input.invitedBy)} invited you to join the Asset Union admin dashboard as <strong>${escapeHtml(input.roleLabel)}</strong>.</p>
      <p>This one-time link expires in 30 minutes.</p>
      <p><a href="${url}" style="display:inline-block;background:#5c60cc;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none">Accept invitation</a></p>
      <p style="font-size:12px;color:#6b7280">If you did not expect this invitation, you can ignore this email.</p>
    </div>`,
  });
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char] || char);
}
