export const sendEmail = async (options) => {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { 
          name: 'JIBWIS Portal', 
          email: process.env.EMAIL_USER 
        },
        to: [{ email: options.email }],
        subject: options.subject,
        htmlContent: options.message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('🚨 BREVO API ERROR:', data);
      throw new Error(data.message || 'Brevo API failed');
    }

    console.log('✅ Email sent successfully via Brevo!');
    return data;

  } catch (error) {
    console.error('🚨 SEND EMAIL FAILED:', error.message);
    throw error;
  }
};
