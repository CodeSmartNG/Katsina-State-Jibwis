import { BrevoClient } from '@getbrevo/brevo';

export const sendEmail = async (options) => {
  const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

  const result = await brevo.transactionalEmails.sendTransacEmail({
    subject: options.subject,
    htmlContent: options.message,
    sender: { name: 'JIBWIS Portal', email: process.env.EMAIL_USER },
    to: [{ email: options.email }],
  });

  return result;
};
