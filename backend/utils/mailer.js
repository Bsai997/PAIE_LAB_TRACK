import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

export async function sendWelcomeEmail({ originalmail, name, clubmail, password }) {
  const transport = getTransporter();
  const message = {
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    to: originalmail,
    subject: 'Welcome to PAIE Cell - Your Account Details',
    html: `
      <h2>Welcome to PAIE Cell, ${name}!</h2>
      <p>Your account has been created successfully. Here are your login credentials:</p>
      <ul>
        <li><strong>Registration ID (Login):</strong> ${clubmail}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      <p>Please login and change your password after first login.</p>
      <p>Best regards,<br/>PAIE Cell Team</p>
    `,
  };

  if (!transport) {
    console.log('[Email Preview]', message);
    return { sent: false, preview: true };
  }

  await transport.sendMail(message);
  return { sent: true };
}
