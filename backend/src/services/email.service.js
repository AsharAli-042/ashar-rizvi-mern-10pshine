const nodemailer = require("nodemailer");
const { emailConfig } = require("../config/email");
const { logger } = require("../config/logger");

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      auth: emailConfig.auth,
    });
  }
  return transporter;
}

async function sendMail({ to, subject, html }) {
  const info = await getTransporter().sendMail({
    from: emailConfig.from,
    to,
    subject,
    html,
  });

  logger.info({ messageId: info.messageId, to }, "Password reset email sent");
  return info;
}

module.exports = { sendMail };
