// backend/src/services/report.service.js
const { transporter, FROM } = require("../config/mailer");

const REPORT_TO = process.env.REPORT_EMAIL || process.env.SMTP_USER;

/**
 * Send a "Report a problem" email.
 * @param {{ userId: string, username: string, email: string, message: string, file?: object }} opts
 */
async function sendReport({ userId, username, email, message, file }) {
  const attachments = [];

  if (file) {
    // multer memoryStorage — file.buffer contains the data
    attachments.push({
      filename: file.originalname,
      content: file.buffer,
    });
  }

  const info = await transporter.sendMail({
    from: `"Nexora Reports" <${FROM}>`,
    to: REPORT_TO,
    subject: `[Nexora] Problem Report from @${username}`,
    text: [
      `User: @${username} (${email})`,
      `User ID: ${userId}`,
      `Date: ${new Date().toISOString()}`,
      ``,
      `--- Message ---`,
      message,
    ].join("\n"),
    html: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2 style="color: #4a99e9;">Problem Report</h2>
        <table style="margin-bottom: 16px;">
          <tr><td style="padding-right: 12px; color: #888;">User</td><td><strong>@${username}</strong> (${email})</td></tr>
          <tr><td style="padding-right: 12px; color: #888;">User ID</td><td>${userId}</td></tr>
          <tr><td style="padding-right: 12px; color: #888;">Date</td><td>${new Date().toISOString()}</td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #333;">
        <p style="margin-top: 16px; white-space: pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
        ${file ? `<p style="color: #888; font-size: 12px;">📎 Attachment: ${file.originalname}</p>` : ""}
      </div>
    `,
    attachments,
  });

  return { messageId: info.messageId };
}

module.exports = { sendReport };
