// backend/src/config/mailer.js
const nodemailer = require("nodemailer");

/**
 * Create a reusable transporter.
 *
 * Required env vars:
 *   SMTP_HOST     – e.g. smtp.gmail.com
 *   SMTP_PORT     – e.g. 587
 *   SMTP_USER     – your email address
 *   SMTP_PASS     – app-specific password (not your regular password)
 *
 * Optional:
 *   SMTP_FROM     – custom "from" address (defaults to SMTP_USER)
 *   SMTP_SECURE   – "true" for port 465, otherwise STARTTLS is used
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || process.env.SMTP_USER;

module.exports = { transporter, FROM };
