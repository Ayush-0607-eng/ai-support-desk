import nodemailer from "nodemailer";
import logger from "../config/logger.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

export const sendTicketReplyEmail = async (ticket, content) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    logger.warn("Email not sent: EMAIL_USER or EMAIL_PASS is not configured");
    return;
  }
  try {
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "Support Team"}" <${process.env.EMAIL_USER}>`,
      to: ticket.customerEmail,
      subject: `Re: ${ticket.subject}`,
      text: content,
      html: `<p>Hi ${ticket.customerName},</p><p>${content.replace(/\n/g, "<br/>")}</p><p>Best regards,<br/>${process.env.EMAIL_FROM_NAME || "Support Team"}</p>`
    });
  } catch (error) {
    logger.error(`Failed to send email to ${ticket.customerEmail}: ${error.message}`);
  }
};
