import { BrevoClient } from '@getbrevo/brevo';

export const sendEmail = async (options) => {
  try {
    const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject: options.subject,
      htmlContent: options.message,
      sender: { name: 'JIBWIS Portal', email: process.env.EMAIL_USER },
      to: [{ email: options.email }],
    });

    console.log('✅ Brevo email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    // 👇 This will log the exact reason Brevo rejected the email
    console.error('🚨 BREVO ERROR:', error);
    throw error;
  }
};
