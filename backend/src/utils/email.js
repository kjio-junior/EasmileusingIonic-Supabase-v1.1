const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM = process.env.SENDGRID_FROM_EMAIL || 'noreply@easmile.com';

async function sendPasswordResetEmail(to, name, resetUrl) {
  const msg = {
    to,
    from: FROM,
    subject: 'Reset your EAsmile password',
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #0A1E29;">
        <h2 style="color: #0A1E29; margin: 0 0 8px;">Hi ${name},</h2>
        <p style="font-size: 15px; line-height: 1.5; color: #4a6272;">
          We received a request to reset your EAsmile password. Click the button below to choose a new one.
        </p>
        <p style="margin: 28px 0;">
          <a href="${resetUrl}"
             style="background: #0A1E29; color: #ffffff; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: 600;">
            Reset Password
          </a>
        </p>
        <p style="font-size: 13px; color: #7a8a97; line-height: 1.5;">
          This link expires in 1 hour. If you didn't request this, you can safely ignore this email —
          your password won't change unless you click the link above.
        </p>
        <p style="font-size: 13px; color: #7a8a97; margin-top: 32px;">
          — EAsmile Dental Clinic<br/>
          Your Dental Care, All in One Place.
        </p>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`Password reset email sent to ${to}`);
  } catch (err) {
    console.error('SendGrid send failed:', err.response?.body || err.message);
    throw new Error('Email send failed');
  }
}

module.exports = { sendPasswordResetEmail };