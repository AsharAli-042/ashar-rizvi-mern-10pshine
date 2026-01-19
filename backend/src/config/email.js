const { loadEnv } = require("./env");

const env = loadEnv();

const emailConfig = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 2525),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  from: process.env.EMAIL_FROM,
  frontendUrl: process.env.FRONTEND_URL,
};

function validateEmailConfig() {
  const required = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM", "FRONTEND_URL"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing email env vars: ${missing.join(", ")}`);
  }
}

module.exports = { emailConfig, validateEmailConfig };
